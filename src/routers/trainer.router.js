import { Router } from "express";

import {
  createTrainer,
  getAllTrainers,
  getTrainerById,
  updateTrainer,
  deleteTrainer,
  filterTrainers,
} from "../controller/trainer.controller.js";

import {verifyJWT} from "../middlwares/auth.middleware.js";
// import verifyAdmin from "../middlewares/admin.middleware.js";
import {validate} from "../middlwares/validate.middleware.js";
import {upload} from "../middlwares/multer.middleware.js";

import {
 trainerValidationSchema,updateTrainerSchema
} from "../validators/trainer.validator.js";

const router = Router();

/* ---------- Public Routes ---------- */

// Get all trainers
router.get("/get-all", getAllTrainers);

router.get("/filter", filterTrainers);

// Get single trainer
router.get("/get-byId/:id", getTrainerById);

/* ---------- Admin Routes ---------- */

// Create trainer
router.post(
  "/",
  verifyJWT,
//   verifyAdmin,
  upload.single("image"),
  validate(trainerValidationSchema),
  createTrainer
);

// Update trainer
router.patch(
  "/update/:id",
  verifyJWT,
//   verifyAdmin,
  upload.single("image"),
  validate(updateTrainerSchema),
  updateTrainer
);

// Delete trainer
router.delete(
  "/delete/:id",
  verifyJWT,
//   verifyAdmin,
  deleteTrainer
);

export default router;