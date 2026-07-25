import mongoose from "mongoose";
import { DB_NAME } from "../constrains.js";

const connectDB = async () => {    

    try {

        const connectionInstance = await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`);
        
        console.log(`MongoDB connected !! DB HOST : ${connectionInstance.connection.host}`);

    } catch (error) {
        console.log("Error connecting to MongoDB:", error);
        process.exit(1); // Exit the process with an error code
    }

}

export default connectDB;