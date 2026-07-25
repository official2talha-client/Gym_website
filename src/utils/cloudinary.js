import {v2 as cloudinary} from 'cloudinary'
import dotenv from 'dotenv'
dotenv.config()

import fs from 'fs'
import { ApiError } from './apiError.js'

cloudinary.config({
    cloud_name:process.env.CLOUDINARY_CLOUD_NAME,
    api_key:process.env.CLOUDINARY_API_KEY,
    api_secret:process.env.CLOUDINARY_API_SECRET,
    secure:true
});




const uploadCloudinary = async(localFilePath)=>{

try {
    if(!localFilePath) return null;

    const response = await cloudinary.uploader.upload(localFilePath,{resource_type:'auto'});


    fs.unlinkSync(localFilePath);

    return response;

    
} catch (error) {
    if(error)
    {fs.unlinkSync(localFilePath); 
        throw new ApiError(500,error)
    }

}

}

export default uploadCloudinary;