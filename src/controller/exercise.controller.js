import Exercise from "../models/exercise.model.js";
import { exerciseValidationSchema,updateExerciseSchema } from "../validators/exercise.validator.js";

import {asyncHandler} from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import {ApiResponse} from "../utils/apiRespose.js";

import {deleteCloudinary,uploadCloudinary} from "../utils/cloudinary.js";



const createExercise = asyncHandler(async (req, res) => {
  const thumbnailFile = req.files?.thumbnail?.[0];
  const videoFile = req.files?.video?.[0];

  if (!thumbnailFile) {
    throw new ApiError(400, "Thumbnail is required.");
  }

  if (!videoFile) {
    throw new ApiError(400, "Video is required.");
  }

  const validatedData = exerciseValidationSchema.parse(req.body);

  const thumbnail = await uploadCloudinary(thumbnailFile.path);

  if (!thumbnail) {
    throw new ApiError(500, "Failed to upload thumbnail.");
  }

  const video = await uploadCloudinary(videoFile.path);

  if (!video) {
    throw new ApiError(500, "Failed to upload video.");
  }

  const exercise = await Exercise.create({
    ...validatedData,

    thumbnail:thumbnail.url,

    video:video.url,
  });

  return res.status(201).json(
    new ApiResponse(
      201,
      exercise,
      "Exercise created successfully."
    )
  );
});


const updateExercise = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const exercise = await Exercise.findById(id);

  if (!exercise) {
    throw new ApiError(404, "Exercise not found.");
  }

  // Validate only provided fields
  const validatedData = updateExerciseSchema.parse(req.body);

  // Update thumbnail if provided
  if (req.files?.thumbnail?.[0]) {
    // Delete old thumbnail from Cloudinary
    await deleteCloudinary(exercise.thumbnail);

    // Upload new thumbnail
    const uploadedThumbnail = await uploadCloudinary(
      req.files.thumbnail[0].path
    );

    if (!uploadedThumbnail) {
      throw new ApiError(500, "Thumbnail upload failed.");
    }

    exercise.thumbnail = uploadedThumbnail.url;
  }

  // Update only text fields
  exercise.name = validatedData.name ?? exercise.name;
  exercise.bodyPart = validatedData.bodyPart ?? exercise.bodyPart;
  exercise.targetMuscle =
    validatedData.targetMuscle ?? exercise.targetMuscle;
  exercise.secondaryMuscles =
    validatedData.secondaryMuscles ?? exercise.secondaryMuscles;
  exercise.equipment =
    validatedData.equipment ?? exercise.equipment;
  exercise.difficulty =
    validatedData.difficulty ?? exercise.difficulty;
  exercise.description =
    validatedData.description ?? exercise.description;
  exercise.duration =
    validatedData.duration ?? exercise.duration;

  // Video is NOT updated
  // exercise.video remains unchanged

  await exercise.save();

  return res.status(200).json(
    new ApiResponse(
      200,
      exercise,
      "Exercise updated successfully."
    )
  );
});

export const deleteExercise = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const exercise = await Exercise.findById(id);

  if (!exercise) {
    throw new ApiError(404, "Exercise not found.");
  }

  // Delete thumbnail
  if (exercise.thumbnail) {
    await deleteCloudinary(exercise.thumbnail);
  }

  // Delete video
  if (exercise.video) {
    await deleteCloudinary(exercise.video);
  }

  await exercise.deleteOne();

  return res.status(200).json(
    new ApiResponse(
      200,
      null,
      "Exercise deleted successfully."
    )
  );
});

export const getExerciseById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const exercise = await Exercise.findById(id);

  if (!exercise) {
    throw new ApiError(404, "Exercise not found.");
  }

  return res.status(200).json(
    new ApiResponse(
      200,
      exercise,
      "Exercise fetched successfully."
    )
  );
});

export const getAllExercises = asyncHandler(async (req, res) => {
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 9;
  const skip = (page - 1) * limit;

  const { search } = req.query;

  const query = {};

  if (search) {
    query.$or = [
      {
        name: {
          $regex: search,
          $options: "i",
        },
      },
      {
        equipment: {
          $regex: search,
          $options: "i",
        },
      },
    ];
  }

  const [exercises, total] = await Promise.all([
    Exercise.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),

    Exercise.countDocuments(query),
  ]);

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        exercises,
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
      "Exercises fetched successfully."
    )
  );
});

export const filterExercises = asyncHandler(async (req, res) => {
  const {
    bodyPart,
    equipment,
    difficulty,
    page = 1,
    limit = 12,
  } = req.query;

  if (!bodyPart) {
    throw new ApiError(
      400,
      "bodyPart query is required."
    );
  }

  const query = {
    bodyPart: {
      $regex: bodyPart,
      $options: "i",
    },
  };

  if (equipment) {
    query.equipment = {
      $regex: equipment,
      $options: "i",
    };
  }

  if (difficulty) {
    query.difficulty = difficulty;
  }

  const skip = (Number(page) - 1) * Number(limit);

  const [exercises, total] = await Promise.all([
    Exercise.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit)),

    Exercise.countDocuments(query),
  ]);

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        exercises,
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages: Math.ceil(total / limit),
      },
      "Exercises filtered successfully."
    )
  );
});



export {createExercise,updateExercise}