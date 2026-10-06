import { compareSync, hashSync } from "bcrypt"

export const Hash = async(plainText,saltRounds=12)=>{

    return  hashSync(plainText,saltRounds)

};

export const Compare = async(plainText, cipherText)=>{

    return  compareSync(plainText,cipherText)

}
