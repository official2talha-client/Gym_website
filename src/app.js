import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();

app.use(cors({
    origin:["http://localhost:5174"],
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
import adminRouter from './routers/admin.router.js'
import personalInfoRouter from './routers/personalInfo.router.js'
import achievementRouter from './routers/achievement.router.js'
import purchaseRouter from './routers/purchase.router.js'
import membershipRouter from './routers/membership.route.js'




app.use("/api/v1/users",userRouter);
app.use("/api/v1/plans",planRouter);
app.use("/api/v1/trainers",trainerRouter);
app.use("/api/v1/exercises",exerciseRouter);
app.use("/api/v1/userInfo",personalInfoRouter);
app.use("/api/v1/achievements",achievementRouter);
app.use("/api/v1/purchases",purchaseRouter);
app.use("/api/v1/memberships",membershipRouter);

app.use("/api/v1/admin",adminRouter);








export  {app};