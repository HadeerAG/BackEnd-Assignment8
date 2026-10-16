import joi from "joi"
import { GenderEnum } from "../../common/enum/user.enum.js"
import { generalRules } from "../../common/utilities/generalRules.js";


export const signupSchema = {
    body: joi.object({
    fName: joi.string().min(2).max(10).required(),
    lName: joi.string().required(),
    email: generalRules.email.required(),
    password: joi.string().required(),
    cPassword: joi.string().valid(joi.ref("password")).required(),
    age: joi.number().integer().positive().required(),
    gender: joi.string().valid(...Object.values(GenderEnum)),
    phone: joi.string()    
}),

files: joi.object({
    profileImage: joi.array().items(generalRules.file.required()).required(),
    coverImages: joi.array().items(generalRules.file.required()).messages({"any.required":"file is required"}),
    

})

};

export const signinSchema = {
    body: joi.object({
    email: joi.string().email({tlds: {allow:true}}).required(),
    password: joi.string().required(),  
}),

};

export const refreshTokenSchema = {
    headers: generalRules.token.required()

};

export const shareProfileSchema = {
        params: joi.object({
    id: generalRules.id.required()
}).required(),

};

export const updateProfileSchema = {
    body: joi.object({
    fName: joi.string().min(2).max(10),
    lName: joi.string(),
    age: joi.number().integer().positive(),
    gender: joi.string().valid(...Object.values(GenderEnum)),
    phone: joi.string()    
}),
};

export const updatePasswordSchema ={ 
body: joi.object({
    oldPassword: joi.string().required(),
    newPassword: joi.string().required(),
    cNewPassword: joi.string().valid(joi.ref("newPassword")),
}),
}