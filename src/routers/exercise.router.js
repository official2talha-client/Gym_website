import express from "express";

import {
  createExercise,
  updateExercise,
  deleteExercise,
  getAllExercises,
  getExerciseById,
  filterExercises,
  getFilterFields
} from "../controller/exercise.controller.js";

import { verifyJWT } from "../middlwares/auth.middleware.js";
// import   from "../middlwares/admin.middleware.js";
import {upload} from "../middlwares/multer.middleware.js";

const router = express.Router();


// Get all exercises
router.get("/", getAllExercises);

// Filter exercises
router.get("/filter", filterExercises);

router.get("/filter-fields", getFilterFields);

// Get exercise by ID
router.get("/:id", getExerciseById);


// Create Exercise
router.post(
  "/",
  verifyJWT,
  upload.fields([
    {
      name: "thumbnail",
      maxCount: 1,
    },
    {
      name: "video",
      maxCount: 1,
    },
  ]),
  createExercise
);

// Update Exercise
router.patch(
  "/:id",
  verifyJWT,
  upload.fields([
    {
      name: "thumbnail",
      maxCount: 1,
    },
  ]),
  updateExercise
);

// Delete Exercise
router.delete(
  "/:id",
  verifyJWT,
//   isAdmin,
  deleteExercise
);

export default router;