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

const {fullName,userName,email,password} = req.body;

const existingUser = await User.findOne({
    $or:[
        {email},
    ],
})

if (existingUser) {
    if (existingUser.email === email) {
      throw new ApiError(409, "Email already exists");
    }

  }

  const user = await User.create({
    fullName,
    userName,
    email,
    password
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

    const { email, password } = req.body;

    // Find User

    const user = await User.findOne({ email });
    

    if (!user) {
        throw new ApiError(404, "User does not exist");
    }


    const correctPassword = await user.isPasswordCorrect(password);

    if (!correctPassword) {
        throw new ApiError(404, "Invalid password");
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
        // sameSite: "none"
    };

    return res
        .status(200)
        .cookie("accessToken", accessToken, {
            ...options,
            maxAge: 7 * 24 * 60 * 60 * 1000
        })
        .cookie("refreshToken", refreshToken, {
            ...options,
            maxAge: 30 * 24 * 60 * 60 * 1000
        })
        .json(
            new ApiResponse(
                200,
                {
                    user: loggedInUser,
                    accessToken,
                    refreshToken
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

const getAllUsers = asyncHandler(async (req, res) => {

    const users = await User.find()
        .select("-password -refreshToken")
        

    return res.status(200).json(
        new ApiResponse(
            200,
            users,
            "Users fetched successfully"
        )
    );

});

const getUserById = asyncHandler(async (req, res) => {

    const { id } = req.params;

    const user = await User.findById(id)
        .select("-password -refreshToken")
       

    if (!user) {
        throw new ApiError(
            404,
            "User not found"
        );
    }

    return res.status(200).json(
        new ApiResponse(
            200,
            user,
            "User fetched successfully"
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

const changeUserStatus = asyncHandler(async (req, res) => {

    const { id } = req.params;
    const { status } = req.body;

    const user = await User.findByIdAndUpdate(
        id,
        {
            status
        },
        {
            new: true,
            runValidators: true
        }
    ).select("-password -refreshToken");

    if (!user) {
        throw new ApiError(404, "User not found");
    }

    return res.status(200).json(
        new ApiResponse(
            200,
            user,
            "User status updated successfully"
        )
    );

});

export {registerUser,loginUser,getCurrentUser,getAllUsers,getUserById,refreshAccessToken,changePassword,changeUserStatus,logoutUser}
