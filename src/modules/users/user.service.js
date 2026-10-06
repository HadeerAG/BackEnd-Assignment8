import { decrypt, Encrypt } from '../../common/security/encrypt.js';
import { Compare, Hash } from '../../common/security/hash.js';
import * as dbService from '../../DB/db.service.js';
import userModel from './../../DB/models/user.model.js';
import jwt from "jsonwebtoken"
import {OAuth2Client} from 'google-auth-library';




const client = new OAuth2Client();

export const signUp = async(req,res,next)=>{

const {fName, lName, email, password, age, gender, phone}= req.body;

if (await userModel.findOne({email: email.toLowerCase()})) {
 
   throw new Error("Email already exist",{cause:409})
}

const user = await dbService.create({model:userModel,data:{fName, lName, email, password: await Hash(password), age, gender, phone:Encrypt(phone)}});
res.status(201).json({message:"Account created successfully", userData: user});
    
}

export const signUpWithGmail = async (req,res,next)=>{
    const { idToken } = req.body;




  const decoded = await client.verifyIdToken({
      idToken,
      audience: "238573037375-r1fll9funmqitpdn6p3pcbni27flouko.apps.googleusercontent.com",  

  });
  const {email_verified,family_name, given_name, picture, email} = decoded.getPayload();

  let user = await userModel.findOne({email: email.toLowerCase()});

  if (!user) {
 
 user =  await dbService.create({
    data:{
        fName: given_name,
        lName: family_name, 
        email,
        profileImage: picture,
        isConfirmed:email_verified,
        provider:"google"
        },
    model: userModel
   })
};

if(user.provider == "system"){
    throw new Error("Please login with system only",{cause:400})
}


        const access_token = jwt.sign({id: user._id, email: user.email},"hadeer123",{
            expiresIn: "1 day"
        });
        const refresh_token = jwt.sign({id: user._id},"hadeer",{
            expiresIn: "5d"
        })

       return res.status(200).json({message:"done", tokens:{refresh_token, access_token}});



    console.log({payload});
    

}


export const signIn =  async(req,res,next)=>{

        const {email, password} = req.body

        const user = await dbService.findOne({
            model : userModel,
            filter: {email: email.toLowerCase(), provider:"system"}
        });

        if (!user) {
            throw new Error("email not exist",{cause:404})         
        };

        // if(user.isConfirmed !== true){
        //     return res.status(400).json({message: "email not confirmed"}); 
        // }

        if(!await Compare(password,user.password)){
            throw new Error("Invalid password",{cause:400})
        };

        const access_token = jwt.sign({id: user._id, email: user.email},"hadeer123",{
            expiresIn: "1 day"
        });
        const refresh_token = jwt.sign({id: user._id},"hadeer",{
            expiresIn: "5d"
        })

       return res.status(200).json({message:"done", tokens:{refresh_token, access_token}});
}

// Get Profile

export const getProfile =  async(req,res,next)=>{

        const { authorization } = req.headers

        if (!authorization) {
            throw new Error("You have no authorization",{cause:404})         
        };

        const decoded = jwt.verify(authorization,"hadeer123");

        const user = await dbService.findOne({
            model : userModel,
            filter: {email: decoded.email.toLowerCase(), provider:"system"}
        });

        if (!user) {
            throw new Error("email not exist",{cause:404})         
        };





       return res.status(200).json({message:"done", user});
}