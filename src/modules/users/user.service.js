import { decrypt, Encrypt } from "../../common/security/encrypt.js";
import { Compare, Hash } from "../../common/security/hash.js";
import * as dbService from "../../DB/service/db.service.js";
import userModel from "./../../DB/models/user.model.js";
import jwt from "jsonwebtoken";
import multer from "multer";
import { OAuth2Client } from "google-auth-library";
import { ProviderEnum } from "../../common/enum/user.enum.js";
import { hashSync } from "bcrypt";
import { randomUUID } from 'node:crypto';
import * as rService from "../../DB/service/redis.service.js";
import sendEmail, { generate_otp } from "../../common/service/sendEmail.js";
import { eventEmitter } from "../../common/utilities/event.js";
import { email_template } from "../../common/utilities/email.template.js";
import { sendEmailOtp } from "./user.helper.js";


//================ signup ================
export const signUp = async (req, res, next) => {
  const { fName, lName, email, password, age, gender, phone, cPassword } =
    req.body;

  if (await userModel.findOne({ email: email.toLowerCase() })) {
    throw new Error("Email already exist", { cause: 409 });
  }

  if(!req.files|| !req.files.coverImages || req.files.coverImages.length == 0){
      throw new Error("Please upload at least one file")
  }

  const paths = [];
  for (const file of req.files.coverImages) {
    paths.push(file.path);
  }

  const otp = await generate_otp();
  const otpHash = await Hash(otp,12);
  await rService.setValue({
    key: `otp::${email}`,
    value: otpHash,
    ttl: 60 * 2
  });
    await rService.setValue({
    key: `otp::max::${email}`,
    value: 1,
    ttl: 60 * 5
  });
  eventEmitter.emit("confirm_email",async ()=>{
  await sendEmail({
    to: email,
    subject: "Confirm email",
    html: `<h1>${otp}</h1>`
  })
  })
  

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
      profileImage: req.files.profileImage[0].path || "",
      coverImages: paths,
    },
  });
  res
    .status(201)
    .json({ message: "Account created successfully", userData: user });
};

//================ resend OTP ================
export const resendOtp = async (req, res) => {
    const { email } = req.body;

   await sendEmailOtp({email, isConfirmed: false})


    return res.status(200).json({ message: "Done"});
};

//================ ConfirmEmail ================

export const confirmEmail = async (req, res, next) => {
  const { email, otp } = req.body;

  const otpValue = await rService.getValue(`otp::${email}`)

  if (!otpValue) {
    throw new Error("otp erxpired",{cause:400})
  }

    if (!(await Compare(String(otp), otpValue))) {
    throw new Error("Invalid otp", { cause: 400 });
  }

      const user = await dbService.findOneAndUpdate({
    model: userModel,
    filter: { email: email.toLowerCase(), isConfirmed:{$exists: false} },
    update: {isConfirmed:true}
  });

  if (!user) {
    throw new Error("email not exist or it's already confirmed", { cause: 400 });
  }

  await rService.deleteKey(`otp::${email}`)

  // if(user.isConfirmed !== true){
  //     return res.status(400).json({message: "email not confirmed"});
  // }






  return res
    .status(200)
    .json({ message: "done", user });
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


};

//================ signin ================

export const signIn = async (req, res, next) => {
  const { email, password } = req.body;

  const user = await dbService.findOne({
    model: userModel,
    filter: { email: email.toLowerCase(),isConfirmed:{$exists: true}, provider: "system" },
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

//================ forgetPassword ===============

export const forgetPassword = async (req, res, next) => {

const { email } = req.body

await sendEmailOtp({email, isConfirmed: true, subject:"Forget password OTP"})

res.status(200).json({ message: "OTP sent successfully to your email" });

};

//================ resetPassword ===============

export const resetPassword = async (req, res, next) => {

const { email, code, newPassword } = req.body

const otp = await rService.getValue(`otp::${email}`);
    if (!otp) throw new Error(`OTP is not correct`,{cause:403});

    if(!await Compare(code,otp))throw new Error(`Invalid OTP`,{cause:404});

    const user = dbService.findOneAndUpdate({
      model: userModel,
      filter:{email, isConfirmed: {$exists: true}},
      update:{
        password: await Hash(newPassword,12),
        changeCredentialAt: new Date()
      }
    })

    if(!user)throw new Error(`user not found`,{cause:404});
    await rService.deleteKey(`otp::${email}`)

res.status(200).json({ message: "Password resetted successfully" });

};

//================ logout ===============

export const logout = async (req, res, next) => {

const { flag } = req.query

if(flag && flag == "all"){
  req.user.changeCredentialAt = new Date()
  await req.user.save()
await rService.deleteKey(await rService.keys(`revoke_token::${req.user._id}`))

}else{
  await rService.setValue({
    key:`revoke_token::${req.user._id}::${req.decoded.jti}`,
    value:`${req.decoded.jti}`,
    ttl: req.decoded.exp - Math.floor((Date.now()/1000))
  })


  // await dbService.create({
  //   model: revokeTokenModel,
  //   data:{
  //     userId: req.user._id,
  //     tokenId: req.decoded.jti,
  //     expireAt: new Date(req.decoded.exp * 1000)
  //   }

  // })

}

res.status(200).json({ message: "User logged out successfully" });

};


