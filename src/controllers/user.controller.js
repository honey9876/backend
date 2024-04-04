import {asyncHandler} from "../utils/asyncHandler.js";
import {ApiError} from "../utils/ApiError.js"
import {User} from "../models/user.model.js"
import {uploadOnCloudinary} from "../utils/cloudinary.js"

import { ApiResponse } from "../utils/ApiResponse.js";
import  Jwt  from "jsonwebtoken";


const generateAccessAndRefereshTokens = async(userId) => {
  try {
   const user = await User.findById(userId)
   const accessToken =  user.generateAccessToken()
   const refreshToken = user.generateRefreshToken()

     
   user.refreshToken = refreshToken
   await user.save({validateBeforeSave: false})

   return {accessToken, refreshToken}

  } catch (error) {
    throw new ApiError(500, "Something went wrong while generating refersh and access token")

    
  }
}


const registerUser = asyncHandler( async (req, res) => {
     
// get user details from frontend
    // validation - not empty
    // check if user already exists: username, email
    // check for images, check for avatar
    // upload them to cloudinary, avatar
    // create user object - create entry in db
    // remove password and refresh token field from response
    // check for user creation
    // return res


const {fullNane, email, username, password } = req.body
    // console.log("email:", email);

    if (
        [fullNane, email, username, password].some((field) =>
         field.trim() === "" )
    ) {
        throw new ApiError(400, "full name is required")
    }

   const existedUser = await User.findOne({
        $or: [{ username }, { email }]
    })

    if (existedUser) {
        throw new ApiError(409, "User with emai; or username alredy exists ")    
    }
    // console.log(req.files);

   const avatarLocalPath =  req.files?.avatar[0]?.path;
  //  const coverImageLocalPath = req.files?.coverImage[0]?.path;
   
  let coverImageLocalPath;
  if (req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
    
    coverImageLocalPath = req.files.coverImage[0].path
  }


    if (!avatarLocalPath) {
        throw new ApiError(400< "Avator file is required")    
    }

  const avatar = await  uploadOnCloudinary(avatarLocalPath)
  const coverImage = await uploadOnCloudinary(coverImageLocalPath)
   
  if (!avatar) {
    throw new ApiError(400< "Avator file is required")
  }

  const user = await User.create({
    fullNane,
    avatar: avatar.url,
    coverImage: coverImage?.url || "",
    email,
    password,
    username: username.toLowerCase()
  })

  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  )

  if (!createdUser) {
    throw new ApiError(500, "something went worng")
    
  }

  return res.status(201).json(
    new ApiResponse(200, createdUser, "user register succse fully")
  )

})


const LoginUser = asyncHandler(async(req, res) => {

   const {email, username, password} = req.body
   console.log(email);

   if(!username && !email) {
    throw new ApiError(400, "user oe password is required")
  }

 const user = await User.findOne({
    $or: [{username}, {email}]
  })

  if (!user) {
     throw new ApiError(404, "User does not exits")
  }

 const isPasswordValid = await user.isPasswordCorrect
 (password)

 if (!isPasswordValid) {
  throw new ApiError(401, "not correct pass")

 }
 const {accessToken, refreshToken} = await 
 generateAccessAndRefereshTokens(user._id)

 const loggedInUser = awaitUser.findById(user._id).
 select("-password -refreshToken")

  const options = {
    httpOnly: true,
    secure: true

  }
  return res
  .status(200)
  .cookie("accessToken",accessToken, options)
  .cookie("refreshToken", refreshToken, options)
  .json(
    new ApiResponse(
      200,{
        user: loggedInUser,accessToken,
        refreshToken
      },
         "User login succesefullly"
    )
  )

})

const logoutUser = asyncHandler(async(req, res) => {
 await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        refreshToken: undefined

      }
    },
    {
      new: true
    }
  )
  const options = {
    httpOnly: true,
    secure: true

  }
  return res
  .status(200)
  .clearCookie("accessToken", options)
  .clearCookie("refreshToken", options)
  .json(new ApiResponse(200, {}, "User logged out"))
  

 

})

const refreshAccessToken = asyncHandler(async (req, res)=> {
   const incomingRefersf = req.cookie.
    refreshToken || req.body.refreshToken

    if (!incomingRefersfToken) {
           throw new ApiError(401, "unauthorised request")
      
    }
   
  try {
    const decodedToken =  Jwt.verify(
      incomingRefersf,
      process.env.REFRESH_TOKEN_SECRTE
     ) 
  
    const user = await User.findById(decodedToken?._id)
      
    if (!user) {
      throw new ApiError(401, "invalid refresh token")
  
    }
  
     if (incomingRefersf !== user?.refreshToken) {
      throw new ApiError(401, "refresh token is exp.. use")
        
    }
  
    const options = {
      httpOnly: true,
      secure: true
    }
     const {accessToken, newRefreshToken} = await generateAccessAndRefereshTokens(user._id)
  
      return res 
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", newRefreshToken, options)
      .json(
        new ApiResponse(
          200,
          {accessToken, refreshToken: newRefreshToken },
          "access token successs refresh"
  
        )
      )
  } catch (error) {
    throw new ApiError(401, error?.message || "Invalid regresh token")
    
  }
  
})

const changeCurrentPassword = asyncHandler(async(req, res) => {
   const {oldPassword, newPassword,} = req.body

   await User.findById(req.user?._id)
   const isPasswordCorrect = await user.isPasswordCorrect(oldPassword)


   if (!isPasswordCorrect) {
    throw new ApiError(400, "invalid your password")
    
   }


    user.password = newPassword
     await user.save({validateBeforeSave: false})



     return res.
     status(200)
     .json(new ApiResponse(200, {}, "password changr succcsefullt"))

})

const getCurrentUser = asyncHandler(async(req, res) => {
  return res.
  status(200)
  .json(new ApiResponse (
    200,
     "current user fatch succfelly"))
})

const updateAccountDetails = asyncHandler(async(req, res) => {
  const {fullName, email} = req.body

  if (!fullName || !email) {
    throw new ApiError(400, "all field required")
    
  }
   const user = await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        fullName,
        email: email
      }
    } ,
    {new: true}

  ).select("-password")
  

  return res
  .status(200)
  .json(new ApiResponse(200, "account details succcesefully"))



});

const updateUserAvatar = asyncHandler(async(req, res) => {
    
  const avatarLocalPath = req.file?.path

   if (!avatarLocalPath) {
      throw new ApiError(400, "Avater file is misssing")

   }

   const avatar = await uploadOnCloudinary
   (avatarLocalPath)

   if (!avatar.url) {
       throw new ApiError(400, "error while uploding on avater")

   }

   const user = await User.findByIdAndUpdate(
    req.user?._id,
    { 
      $set: {
        avatar: avatar.url
      }
    },
    {new: true}
   ).select("-password")


   return res
   .status(200)
   .json(
    new ApiResponse(200, user, "avater image update succfully")
  )

})

const updateUserCoverImage = asyncHandler(async(req, res) => {
  const coverImageLocalPath = req.file?.path

  if (!avatarLocalPath) {
     throw new ApiError(400, "cover image  is misssing")

  }

  const coverImage = await uploadOnCloudinary
  (coverImageLocalPathLocalPath)

  if (!coverImage.url) {
      throw new ApiError(400, "error while uploding the avatar")


  }

 const user = await User.findByIdAndUpdate(
   req.user?._id,
   { 
     $set: {
       coverImage: coverImage.url
     }
   },
   {new: true}
  ).select("-password")

  return res
  .status(200)
  .json(
    new ApiResponse(200, user, "cover image update succfully")
  )


})


export {
    registerUser,
    LoginUser,
    logoutUser,
    refreshAccessToken,
    changeCurrentPassword,
    getCurrentUser,
    updateAccountDetails,
    updateUserAvatar,
    updateUserCoverImage
}