import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";


const verifyAdmin = asyncHandler(async(req,res,next)=>{
    

    const isAdmin = req.user.role === "admin";

    const isOwner = req.user.email === process.env.ADMIN_EMAIL;

if(!isAdmin || !isOwner){
    throw new ApiError(403,"Forbidden")
}


next()


})

export {verifyAdmin}