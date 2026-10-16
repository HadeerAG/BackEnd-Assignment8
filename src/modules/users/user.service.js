import { decrypt, Encrypt } from "../../common/security/encrypt.js";
import { Compare, Hash } from "../../common/security/hash.js";
import * as dbService from "../../DB/service/db.service.js";
import userModel from "./../../DB/models/user.model.js";
import jwt from "jsonwebtoken";
import multer from "multer";
import { OAuth2Client } from "google-auth-library";
import { ProviderEnum } from "../../common/enum/user.enum.js";
import { compare } from "bcrypt";
import { randomUUID } from 'node:crypto';
import revokeTokenModel from './../../DB/models/revokeToken.model';

//================ signup ================
export const signUp = async (req, res, next) => {
  const { fName, lName, email, password, age, gender, phone, cPassword } =
    req.body;

  if (await userModel.findOne({ email: email.toLowerCase() })) {
    throw new Error("Email already exist", { cause: 409 });
  }

  // if(!req.files|| !req.files.coverImages || req.files.coverImages.length == 0){
  //     throw new Error("Please upload at least one file")
  // }

  const paths = [];
  for (const file of req.files.coverImages) {
    paths.push(file.path);
  }

  const user = await dbService.create({
    model: userModel,
    data: {
      fName,
      lName,
      email,
      password: await Hash(password),
      cPassword: await Hash(cPassword),
      age,
      gender,
      phone: Encrypt(phone),
      profileImage: req.files.profileImage[0].path,
      coverImages: paths,
    },
  });
  res
    .status(201)
    .json({ message: "Account created successfully", userData: user });
};

//================ signup with gmail ================

const client = new OAuth2Client();
export const signUpWithGmail = async (req, res, next) => {
  const { idToken } = req.body;

  const decoded = await client.verifyIdToken({
    idToken,
    audience:
      "238573037375-r1fll9funmqitpdn6p3pcbni27flouko.apps.googleusercontent.com",
  });
  const { email_verified, family_name, given_name, picture, email } =
    decoded.getPayload();

  let user = await userModel.findOne({ email: email.toLowerCase() });

  if (!user) {
    user = await dbService.create({
      data: {
        fName: given_name,
        lName: family_name,
        email,
        profileImage: picture,
        isConfirmed: email_verified,
        provider: ProviderEnum.google,
      },
      model: userModel,
    });
  }

  if (user.provider == ProviderEnum.system) {
    throw new Error("Please login with system only", { cause: 400 });
  }

  const access_token = jwt.sign(
    { id: user._id, email: user.email },
    "hadeer123",
    {
      expiresIn: "1 day",
    },
  );
  const refresh_token = jwt.sign({ id: user._id }, "hadeer", {
    expiresIn: "5d",
  });

  return res
    .status(200)
    .json({ message: "done", tokens: { refresh_token, access_token } });

  console.log({ payload });
};

//================ signin ================

export const signIn = async (req, res, next) => {
  const { email, password } = req.body;

  const user = await dbService.findOne({
    model: userModel,
    filter: { email: email.toLowerCase(), provider: "system" },
  });

  if (!user) {
    throw new Error("email not exist", { cause: 404 });
  }

  // if(user.isConfirmed !== true){
  //     return res.status(400).json({message: "email not confirmed"});
  // }

  if (!(await Compare(password, user.password))) {
    throw new Error("Invalid password", { cause: 400 });
  }

  const tokenId = randomUUID()

  const access_token = jwt.sign(
    { id: user._id, email: user.email },
    "hadeer123",
    {
      expiresIn: "1 day",
      jwtid: tokenId
    },
  );
  const refresh_token = jwt.sign({ id: user._id }, "hadeer", {
    expiresIn: "5d",
    jwtid: tokenId
  });

  return res
    .status(200)
    .json({ message: "done", tokens: { refresh_token, access_token } });
};

// Get Profile
export const getProfile = async (req, res, next) => {
  return res.status(200).json({ message: "Done", user: req.user });
};

//================ share profile ================

export const shareProfile = async (req, res, next) => {
  const { id } = req.params;
  let user = await dbService.findById({
    model: userModel,
    id,
    options: { password: 0 },
  });
  if (!user) {
    throw new Error("user not exist", { cause: 404 });
  }

  user.phone = decrypt(user.phone);

  return res.status(200).json({ message: "Done", user });
};

//================ refreshToken ================

export const refreshToken = async (req, res, next) => {
  const { authorization } = req.headers;
  if (!authorization) {
    throw new Error("You have no authorization", { cause: 404 });
  }

  const decoded = jwt.verify(authorization, "hadeer");

  if (!decoded?.id) {
    throw new Error("Invalide token", { cause: 400 });
  }

  const user = await dbService.findOne({
    model: userModel,
    filter: { _id: decoded.id, provider: "system" },
  });

  if (!user) {
    throw new Error("email not exist", { cause: 404 });
  }
  const access_token = jwt.sign(
    { id: user._id, email: user.email },
    "hadeer123",
    {
      expiresIn: 60 * 10,
    },
  );

  return res.status(200).json({ message: "Done", access_token });
};

//================ updateProfile ===============

export const updateProfile = async (req, res, next) => {
  const { fName, lName, age, gender, phone} =
    req.body;

  let updateQuery = {};

  if(fName !== undefined){
    updateQuery.fName = fName
  }
  if(lName !== undefined){
    updateQuery.lName = lName
  }
  if(age !== undefined){
    updateQuery.age = age
  }
  if(phone !== undefined){
    updateQuery.phone = Encrypt(phone)
  }
  if(gender !== undefined){
    updateQuery.gender = gender
  }

 let user = await dbService.findByIdAndUpdate({
    model: userModel,
    id: req.user._id,
    update: updateQuery
  })


  res.status(200).json({ message: "Account created successfully", userData: user });

};

//================ updatePassword ===============

export const updatePassword = async (req, res, next) => {
  const { oldPassword, newPassword } = req.body;
    

if(!await Compare(oldPassword,req.user.password)){
  throw new Error("incorrect password")
}

req.user.password = await Hash(newPassword)
req.user.changeCredentialAt = new Date()
await req.user.save()


  res.status(200).json({ message: "Password updated successfully", userData: req.user });

};

//================ logout ===============

export const logout = async (req, res, next) => {

const { flag } = req.query

if(flag == "all"){
  req.user.changeCredentialAt = new Date()
  await req.user.save()

}else{
  await dbService.create({
    model: revokeTokenModel,
    data:{
      userId: req.user._id,
      tokenId: req.decoded.jti,
      expireAt: new Date(req.decoded.exp * 1000)
    }

  })

}

res.status(200).json({ message: "User logged out successfully" });

};


