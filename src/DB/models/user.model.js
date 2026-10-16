import mongoose from "mongoose";
import { GenderEnum, ProviderEnum, RoleEnum } from "../../common/enum/user.enum.js";

const userSchema = new mongoose.Schema({
fName: {
        type: String,
        required: true,
        trim: true,
        minLength: 2,
        maxLength: 15,

    },
lName: {
        type: String,
        required: function () {
    return this.provider == ProviderEnum.system
  },
        trim: true,
        minLength: 2,
        maxLength: 15,
        
    },
email:{
    type: String,
    unique: true,
    required: true,
    lowercase: true,
    trim: true
},
password:{
  type: String,  
  required: function () {
    return this.provider == ProviderEnum.system
  },
  trim: true
},
cPassword:{
  type: String,  
  required: function () {
    return this.provider == ProviderEnum.system
  },
  trim: true
},
age:{
    type: Number,
    required: function () {
    return this.provider == ProviderEnum.system
  },
    min:20,
    max:70
},
gender:{
    type: String,
    enum:Object.values(GenderEnum),
    default: GenderEnum.male,

},
phone: String,
profileImage: String,
coverImages: [String],
role:{
    type: String,
    enum: Object.values(RoleEnum),
    default: RoleEnum.user
},
provider:{
    type:String,
    enum:Object.values(ProviderEnum),
    default: ProviderEnum.system
},
isConfirmed:{
    type: Boolean,
    default:false
},
changeCredentialAt: Date

},{
    timestamps:true,
    strict:true,
    strictQuery: true,
    toJSON:{virtuals:true},
    toObject:{virtuals:true}
});

const userModel = mongoose.models.User || mongoose.model("User", userSchema);

export default userModel