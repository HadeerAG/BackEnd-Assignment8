import { Router } from "express"
import * as US from "./user.service.js"
import { authentication } from "../../common/middleware/authentication.js";
import { authorization } from "../../common/middleware/authorization.js";
import { RoleEnum } from "../../common/enum/user.enum.js";
import { Validation } from "../../common/middleware/validation.js";
import * as UV from "./user.validation.js";
import { multerLocal } from "../../common/middleware/multer.js";
import { multer_enum } from "../../common/enum/multer.enum.js";


const userRouter = Router({strict: true})



userRouter.post("/signUp",
    
    multerLocal({customPath: "users", customTypes:multer_enum.images}).fields([
        {name: "profileImage"},
        {name: "coverImages"}]),
    Validation(UV.signupSchema),
     US.signUp);
userRouter.post("/signup/gmail", US.signUpWithGmail)
userRouter.post("/signIn",Validation(UV.signinSchema), US.signIn);
userRouter.post("/refresh-token",Validation(UV.refreshTokenSchema), US.refreshToken);
userRouter.get("/profile", authentication, authorization(Object.values(RoleEnum)) ,US.getProfile);
userRouter.get("/share-profile/:id" ,Validation(UV.shareProfileSchema),US.shareProfile);
userRouter.patch("/update-profile",Validation(UV.updateProfileSchema),authentication,US.updateProfile);
userRouter.patch("/update-password",Validation(UV.updatePasswordSchema),authentication,US.updatePassword);
userRouter.patch("/forget-password",Validation(UV.forgetPasswordSchema),US.forgetPassword);
userRouter.patch("/reset-password",Validation(UV.resetPasswordSchema),US.resetPassword);
userRouter.patch("/confirmEmail",Validation(UV.confirmEmailSchema),US.confirmEmail);
userRouter.patch("/resendOTP",Validation(UV.reSendOTPSchema),US.resendOtp);
userRouter.patch("/logout",authentication,US.logout);













export default userRouter