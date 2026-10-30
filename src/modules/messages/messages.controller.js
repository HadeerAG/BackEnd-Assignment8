import { Router } from "express";
import { multerLocal } from "../../common/middleware/multer.js";
import { multer_enum } from "../../common/enum/multer.enum.js";
import { Validation } from "../../common/middleware/validation.js";
import * as MV from "./message.validation.js";
import * as MS from "./messages.service.js";
import { authentication } from "../../common/middleware/authentication.js";

export const messageRouter = Router({strict: true})

messageRouter.post("/",
    multerLocal({
        customPath:"messages",
        customTypes: multer_enum.images
    }).array("attachments",3),
    Validation(MV.createMessageSchema),
    MS.createMessage
)
messageRouter.get("/",authentication,MS.getMessages);
messageRouter.get("/:id",authentication,MS.getMessageById);