import mongoose,{Schema} from 'mongoose'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'



const userSchema = new Schema({

      fullName:{
        type:String,
        required:true,
        trim:true,
        minlength:3,
        maxlength:100,
        match: [/^[a-zA-Z ]+$/, "Full name can contain only letters and spaces"],

    },

     userName:{
        type:String,
        required:true,
        trim:true,
        minlength:2,
        maxlength:50,
         match: [
        /^[a-zA-Z0-9_]+$/,
        "Username can contain only letters, numbers and underscore (_)",
      ],
    },

    email:{
        type:String,
        lowercase:true,
        trim:true,
        required:true,
        sparse:true,
        unique:true,
         match: [
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        "Please provide a valid email address",
      ],
        
    },

    password:{
        type:String,
        required:true,
    },

    membershipCard:{
        type:String,
        required:true,

    },

      role:{
        type:String,
        enum:["admin","user"],
        default:"user"
    },

    status:{
        type:String,
        enum:["active","freeze"],
        default:"active"
    },



     refreshToken: {
        type:String
    },

  
},
{timestamps:true}
);

userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;

  this.password = await bcrypt.hash(this.password, 10);
});

userSchema.methods.isPasswordCorrect = async function (password) {

    return await bcrypt.compare(password,this.password)
    
}

// tokens 

userSchema.methods.generateAccessToken = function (){
    return jwt.sign(
        {
            _id:this._id,
            userName:this.userName,
            fullName:this.fullName
        },
        process.env.ACCESS_TOKEN_SECRET,
        {expiresIn:process.env.ACCESS_TOKEN_EXPIRE}
    )
}

userSchema.methods.generateRefreshToken = function (){
    return jwt.sign(
        {
            _id:this._id,
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn:process.env.REFRESH_TOKEN_EXPIRE
        }
    )
}


export const User = mongoose.model("User",userSchema);

