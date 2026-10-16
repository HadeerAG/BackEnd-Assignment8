import { Router } from "express"
import * as US from "./user.service.js"
import { authentication } from "../../common/middleware/authentication.js";
import { authorization } from "../../common/middleware/authorization.js";
import { RoleEnum } from "../../common/enum/user.enum.js";
import { Validation } from "../../common/middleware/validation.js";
import { refreshTokenSchema, shareProfileSchema, signinSchema, signupSchema, updatePasswordSchema, updateProfileSchema } from "./user.validation.js";
import { multerLocal } from "../../common/middleware/multer.js";


const userRouter = Router()



userRouter.post("/signUp",
    
    multerLocal({customPath: "users", customTypes: ["image/jpg", "image/jpeg", "image/png"]}).fields([
        {name: "profileImage"},
        {name: "coverImages"}]),
    Validation(signupSchema),
     US.signUp);
userRouter.post("/signup/gmail", US.signUpWithGmail)
userRouter.post("/signIn",Validation(signinSchema), US.signIn);
userRouter.post("/refresh-token",Validation(refreshTokenSchema), US.refreshToken);
userRouter.get("/profile", authentication, authorization(Object.values(RoleEnum)) ,US.getProfile);
userRouter.get("/share-profile/:id" ,Validation(shareProfileSchema),US.shareProfile);
userRouter.patch("/update-profile",Validation(updateProfileSchema),authentication,US.updateProfile);
userRouter.patch("/update-password",Validation(updatePasswordSchema),authentication,US.updatePassword);
userRouter.patch("/logout",authentication,US.logout);













export default userRouter