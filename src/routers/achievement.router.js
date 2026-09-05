import { Router } from "express";

import {verifyJWT } from "../middlwares/auth.middleware.js";

import { validate } from "../middlwares/validate.middleware.js";

import {
  createAchievementSchema,
} from "../validators/achivement.validator.js";

import {
  createAchievement,
  getAchievements,
  getAchievementById,
  deleteAchievement,
} from "../controller/achievement.controller.js";

const router = Router();

router.use(verifyJWT);

router.post(
  "/",
  validate(createAchievementSchema),
  createAchievement
);

router.get(
  "/",
  getAchievements
);

router.get(
  "/:id",
  getAchievementById
);

router.delete(
  "/:id",
  deleteAchievement
);

export default router;