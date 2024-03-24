import mongoose, {Schema} from "mongoose";
import { Jwt } from "jsonwebtoken";
import bcrypt from "bcrypt"
const userSchema = new Schema(
    {
        username: {
            type: String,
            require: true,
            unique: true,
            lowercase: true,
            trim: true,
            index: true,

        },

        email: {
            type: String,
            require: true,
            unique: true,
            lowercase: true,
            trim: true,
        

        },
        fullName: {
            type: String,
            require: true,
            // lowercase: true,
            trim: true,
            index: true

        },
        avatar: {
            type: String,
            require: true,
             
        },
        coverImage: {
            type: String,

        },
        watchHistory:[
            {
                type: Schema.Types.ObjectId,
                ref: "Video"
            }
        ],
        password:{
            type: String,
            require: [true, 'password is required']
        },
        refreshTock: {
            type: String
        }
    },
    {
        timestamps: true
    }
)


userSchema.pre("save", async function (next) {
    if(this,isModified("password")) return next();

    this.password =  await bcrypt.hash(this.password, 10)
    next()
}) 
userSchema.method.isPasswordCorrect = async function
(password){
    return await bcrypt.compare(password,this.password)

}
userSchema.methods.generateAccessToken = function(){
   return Jwt.sign(
        {
            _id:this.id,
            email: this.email,
            username: this.username,
            fullName: this.fullName
        },
        process.env.ACCESS_TOKEN_SECRAT,
        {
          expiresIn: process.env.ACCESS_TOKEN_EXPIRY
        }
    )
}
userSchema.methods.generateRefreshToken = function(){
    return Jwt.sign(
        {
            _id:this.id,

        },
        process.env.REFRESH_TOKEN_SECRAT,
        {
          expiresIn: process.env.REFRESH_TOKEN_EXPIRY
        }
    )
}

export const User = mongoose.model("User", userSchema)