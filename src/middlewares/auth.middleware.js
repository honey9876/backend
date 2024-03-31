import { ApiError } from "../utils/ApiError.js";
import { asyncHandeler } from "../utils/asyncHandler.js"
import { Jwt } from "jsonwebtoken";
import { User } from "../models/user.model.js";

export const verifyJWT = asyncHandeler(async(req, _, next) => {
 try {
    const token = req.cookies?.accessToken || req.header
       ("AuthoriZation")?.replace("Bearer ", "")
   
       if (!token) {
           throw new ApiError(401, "unauthorized is require")
           
       }
       
   
      const decodedToken = Jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
       
     const user = await User.findById(decodedToken?._id).select
      ("-password -refreshToken")
   
   
      if (!user) {
   
       throw new  ApiError(402, "invlaid acces token")
       
      }
   
      req.user = user;
      next()
    } catch (error) {

    throw new ApiError(401, error?.message || "invalid access token" )
    
    }

}) 