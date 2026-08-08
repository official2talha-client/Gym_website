import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();

app.use(cors({
    origin: process.env.CORS_ORIGIN || "*",
    credentials: true,
}));
app.use(express.json({limit: "16kb"}));

app.use(express.urlencoded({ extended: true }));

app.use(express.static("public"));

app.use(cookieParser());


import userRouter from './routers/user.router.js'
import planRouter from './routers/plan.router.js'
import trainerRouter from './routers/trainer.router.js'
import exerciseRouter from './routers/exercise.router.js'



app.use("/api/v1/users",userRouter);
app.use("/api/v1/plans",planRouter);
app.use("/api/v1/trainers",trainerRouter);
app.use("/api/v1/exercises",exerciseRouter);







export  {app};