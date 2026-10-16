import multer from "multer";
import fs from "node:fs";
import { resolve } from "node:path";
import {randomUUID} from "node:crypto"

export const multerLocal = ({customPath="General", customTypes = []})=>{

const fullPath = `uploads/${customPath}`
if(!fs.existsSync(fullPath)){
    fs.mkdirSync(fullPath,{recursive: true})
}

const storage = multer.diskStorage({
    destination: function(req,file,cb){
        cb(null, resolve(fullPath) )
    },
    filename: function(req,file,cb){ 
        console.log(file);
               
              cb(null, randomUUID() + "-" + file.originalname )  

    }
});

function fileFilter (req,file,cb){

if(!customTypes.includes(file.mimetype)){
         console.log(file.mimetype);
     cb(new Error("Invalid file!"))

     
} else {
    cb(null,true)
}

} 

    const upload = multer ({storage: storage, fileFilter})

    return upload
}



