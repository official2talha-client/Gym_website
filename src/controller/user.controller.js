import {asyncHandler} from '../utils/asyncHandler.js'
import {ApiError} from '../utils/apiError.js'
import {ApiResponse} from '../utils/apiRespose.js'
import {User} from '../models/user.model.js'
import jwt from 'jsonwebtoken'
import mongoose from 'mongoose'


const generateAccessAndRefreshTokens = async (userId)=>{
try {
  const user= await User.findById(userId);
  const accessToken=user.generateAccessToken();
  const refreshToken=user.generateRefreshToken();



user.refreshToken=refreshToken;
 await user.save({validateBeforeSave: false});//it dont validate any field before save the refresh token

 return {accessToken,refreshToken}

} catch (error) {
  throw new ApiError(500,"something went wrong while generating refresh token")
}
}


const registerUser = asyncHandler(async(req,res)=>{

const {fullName,userName,email,password,phone} = req.body;

const existingUser = await User.findOne({
    $or:[
        {email,phone},
    ],
})

if (existingUser) {
    if (existingUser.email === email) {
      throw new ApiError(409, "Email already exists");
    }

    if (existingUser.phone === phone) {
      throw new ApiError(409, "Phone number already exists");
    }

  }

  const user = await User.create({
    fullName,
    userName,
    email,
    password,
    phone
  })


  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  )

  
  if(!createdUser){
    throw new ApiError (500,"user registration failed")
  }

  return res.status(201)
  .json(
    new ApiResponse(200,createdUser,"user created successfully")
  )

});

const loginUser = asyncHandler(async (req, res) => {
  const { emailOrPhone, password } = req.body;

  if (!emailOrPhone || !password) {
    throw new ApiError(400, "Email/phone and password are required");
  }

  const user = await User.findOne({
    $or: [
      { email: emailOrPhone.toLowerCase().trim() },
      { phone: emailOrPhone.trim() },
    ],
  });

  if (!user) {
    throw new ApiError(401, "Invalid credentials");
  }

  const correctPassword = await user.isPasswordCorrect(password);

  if (!correctPassword) {
    throw new ApiError(401, "Invalid credentials");
  }

  // Generate Tokens
  const { accessToken, refreshToken } =
    await generateAccessAndRefreshTokens(user._id);

  // Remove Sensitive Fields
  const loggedInUser = await User.findById(user._id)
    .select("-password -refreshToken");

  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .cookie("accessToken", accessToken, {
      ...options,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    })
    .cookie("refreshToken", refreshToken, {
      ...options,
      maxAge: 30 * 24 * 60 * 60 * 1000,
    })
    .json(
      new ApiResponse(
        200,
        {
          user: loggedInUser,
          accessToken,
          refreshToken,
        },
        "User logged in successfully"
      )
    );
});

const  refreshAccessToken= asyncHandler(async(req,res)=>{

  const incomingRefreshToken= req.cookies.refreshToken || req.body.refreshToken

  

  if(!incomingRefreshToken){
    throw new ApiError(401,"unauthorized request");
  }
try {
  
  const decodedToken= jwt.verify(incomingRefreshToken,process.env.REFRESH_TOKEN_SECRET);
  
  
  const user=await User.findById(decodedToken?._id);
  
  if(!user){
      throw new ApiError(404,"Invalid refresh token");
  
  }
  
  if(incomingRefreshToken !== user?.refreshToken){
      throw new ApiError(404,"Refresh Token is Expired or Used");
  
  }
  
  const options={
    httpOnly:true,
    secure:true,
    // sameSite: "none",
  }
  
  const {accessToken,refreshToken}=await generateAccessAndRefreshTokens(user._id);


  user.refreshToken = refreshToken;
  await user.save({validateBeforeSave:false})

  
  return res.status(200)
  .cookie("accessToken",accessToken,{
   ...options,
     maxAge: 7 * 24 * 60 * 60 * 1000
  })
  .cookie("refreshToken",refreshToken,{
    ...options,
      maxAge: 30 * 24 * 60 * 60 * 1000


  })
  .json(
    new ApiResponse(
      200,{accessToken,refreshToken},
      "Access Token Refreshed"
    )
  )
} catch (error) {
  throw new ApiError(401,"Invalid refresh token")
  
}





});

const getCurrentUser=asyncHandler(async(req,res)=>{



  return res.status(200)
  .json(
    new ApiResponse(200,req.user,"current user fetched successfully")
  )

});

const logoutUser = asyncHandler(async (req, res) => {

    // Remove Refresh Token from DB

    await User.findByIdAndUpdate(
        req.user._id,
        {
            $unset: {
                refreshToken: 1
            }
        },
        {
            new: true
        }
    );

    const options = {
        httpOnly: true,
        secure: true,
        // sameSite: "none"
    };

    return res
        .status(200)
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json(
            new ApiResponse(
                200,
                {},
                "User logged out successfully"
            )
        );

});

const changePassword = asyncHandler(async (req, res) => {

    const {
        oldPassword,
        newPassword
    } = req.body;
    

    const user = await User.findById(req.user._id);

    if (!user) {
        throw new ApiError(404, "User not found");
    }

    const isPasswordCorrect = await user.isPasswordCorrect(oldPassword);

    if (!isPasswordCorrect) {
        throw new ApiError(400, "Old password is incorrect");
    }

    // Prevent same password
    if (oldPassword === newPassword) {
        throw new ApiError(
            400,
            "New password cannot be the same as old password"
        );
    }

    user.password = newPassword;

    await user.save();

    return res.status(200).json(
        new ApiResponse(
            200,
            {},
            "Password changed successfully"
        )
    );

});


export {registerUser,loginUser,getCurrentUser,refreshAccessToken,changePassword,logoutUser}
