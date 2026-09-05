import { Router } from "express";

import {
  createUserInfo,
  getUserInfo,
  updateUserInfo,
} from "../controller/personalInfo.controller.js";

import {validate} from '../middlwares/validate.middleware.js'

import { verifyJWT } from "../middlwares/auth.middleware.js";

import {createPersonalInfoSchema,updatePersonalInfoSchema} from '../validators/personalInfo.validator.js'

const router = Router();

router.use(verifyJWT);

router.post("/",validate(createPersonalInfoSchema) ,createUserInfo);

router.get("/", getUserInfo);

router.patch(
  "/",
  validate(updatePersonalInfoSchema),
  updateUserInfo
);
export default router;