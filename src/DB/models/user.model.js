import mongoose from "mongoose";

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
    return this.provider == "system"? true: false
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
    return this.provider == "system"
  },
  trim: true
},
age:{
    type: Number,
    required: function () {
    return this.provider == "system"? true: false
  },
    min:20,
    max:70
},
gender:{
    type: String,
    enum:["male","female"],
    default:"male",

},
phone: String,
profileImage: String,
provider:{
    type:String,
    enum:["system","google"],
    default:"system"
},
isConfirmed:{
    type: Boolean,
    default:false
}

},{
    timestamps:true,
    strict:true,
    strictQuery: true,
    toJSON:{virtuals:true},
    toObject:{virtuals:true}
});

const userModel = mongoose.models.User || mongoose.model("User", userSchema);

export default userModel