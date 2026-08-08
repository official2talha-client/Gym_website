import {asyncHandler} from '../utils/asyncHandler.js';
import {ApiError} from '../utils/apiError.js';
import {ApiResponse} from '../utils/apiRespose.js';
import {uploadCloudinary} from '../utils/cloudinary.js'
import mongoose from 'mongoose';
import Trainer from '../models/trainer.model.js';

const createTrainer = asyncHandler(async (req, res) => {
  const {
    name,
    shift,
    timeRange,
    achievements,
    age,
    experience,
    gender,
  } = req.body;

  if (!req.file) {
    throw new ApiError(400, "Trainer image is required");
  }

  const existingTrainer = await Trainer.findOne({
    name: {
      $regex: new RegExp(`^${name}$`, "i"),
    },
  });

  if (existingTrainer) {
    throw new ApiError(409, "Trainer already exists");
  }

  const uploadedImage = await uploadCloudinary(req.file.path);

  if (!uploadedImage || !uploadedImage.url) {
    throw new ApiError(500, "Failed to upload trainer image");
  }

  const trainer = await Trainer.create({
    image: uploadedImage.url,
    name,
    shift,
    timeRange,
    achievements,
    age,
    experience,
    gender,
  });

  const createdTrainer = await Trainer.findById(trainer._id);

  if (!createdTrainer) {
    throw new ApiError(500, "Failed to create trainer");
  }

  return res.status(201).json(
    new ApiResponse(
      201,
      createdTrainer,
      "Trainer created successfully"
    )
  );
});

const updateTrainer = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(400, "Invalid trainer ID");
  }

  const trainer = await Trainer.findById(id);

  if (!trainer) {
    throw new ApiError(404, "Trainer not found");
  }

  if (req.body.name) {
    const existingTrainer = await Trainer.findOne({
      name: {
        $regex: new RegExp(`^${req.body.name}$`, "i"),
      },
      _id: { $ne: id },
    });

    if (existingTrainer) {
      throw new ApiError(409, "Trainer name already exists");
    }
  }

  // Upload new image if provided
  if (req.file) {
    const uploadedImage = await uploadCloudinary(req.file.path);

    if (!uploadedImage || !uploadedImage.url) {
      throw new ApiError(500, "Failed to upload trainer image");
    }

    req.body.image = uploadedImage.url;
  }

  Object.assign(trainer, req.body);

  await trainer.save();

  return res.status(200).json(
    new ApiResponse(
      200,
      trainer,
      "Trainer updated successfully"
    )
  );
});

const getAllTrainers = asyncHandler(async (req, res) => {
  const trainers = await Trainer.find().sort({
    createdAt: -1,
  });

  return res.status(200).json(
    new ApiResponse(
      200,
      trainers,
      "Trainers fetched successfully"
    )
  );
});

const getTrainerById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(400, "Invalid trainer ID");
  }

  const trainer = await Trainer.findById(id);

  if (!trainer) {
    throw new ApiError(404, "Trainer not found");
  }

  return res.status(200).json(
    new ApiResponse(
      200,
      trainer,
      "Trainer fetched successfully"
    )
  );
});

const deleteTrainer = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(400, "Invalid trainer ID");
  }

  const trainer = await Trainer.findById(id);

  if (!trainer) {
    throw new ApiError(404, "Trainer not found");
  }

  await trainer.deleteOne();

  return res.status(200).json(
    new ApiResponse(
      200,
      {},
      "Trainer deleted successfully"
    )
  );
});

const filterTrainers = asyncHandler(async (req, res) => {
  const { gender, shift } = req.query;

  const filter = {};

  if (gender) {
    filter.gender = gender;
  }

  if (shift) {
    filter.shift = shift;
  }

  const trainers = await Trainer.find(filter).sort({
    createdAt: -1,
  });


  return res.status(200).json(
    new ApiResponse(
      200,
      trainers,
      "Trainers fetched successfully"
    )
  );
});

export {
  createTrainer,
  getAllTrainers,
  getTrainerById,
  updateTrainer,
  deleteTrainer,
  filterTrainers,
};