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
    if (fs.existsSync(localFilePath)) {
        fs.unlinkSync(localFilePath);
    }
    throw new ApiError(
        500,
        error.message || "Cloudinary upload failed"
    );
}

}

//DELETE CLOUDINARY
const deleteCloudinary=async(image)=>{
   try {
        if (!image) {
            throw new ApiError(404, "Image Invalid")
        }
        //delete the file on cloudinary
        const publicId = extractPublicId(image);

        const response = await cloudinary.uploader.destroy(publicId);
        if(response.result != 'ok'){
            throw new ApiError(404, "Old File Deletion Failed from Cloudinary")
        }

        // file has been deleted successfully
        return 1;

    } catch (error) {
        return null;
    }
}

export {deleteCloudinary,uploadCloudinary}