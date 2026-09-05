import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiRespose.js";
import PersonalInfo from "../models/personalInfo.model.js";

const createUserInfo = asyncHandler(async (req, res) => {
  const { age, weight, height, goal } = req.body;

  const existingInfo = await PersonalInfo.findOne({
    user: req.user._id,
  });

  if (existingInfo) {
    throw new ApiError(
      409,
      "Personal information already exists"
    );
  }

  const personalInfo = await PersonalInfo.create({
    user: req.user._id,
    age,
    weight,
    height,
    goal,
  });

  return res.status(201).json(
    new ApiResponse(
      201,
      personalInfo,
      "Personal information created successfully"
    )
  );
});

const getUserInfo = asyncHandler(async (req, res) => {
  const personalInfo = await PersonalInfo.findOne({
    user: req.user._id,
  }).populate(
    "user",
    "fullName userName email membershipCardId"
  );

  if (!personalInfo) {
    throw new ApiError(
      404,
      "Personal information not found"
    );
  }

  return res.status(200).json(
    new ApiResponse(
      200,
      personalInfo,
      "Personal information fetched successfully"
    )
  );
});

const updateUserInfo = asyncHandler(async (req, res) => {
  const { age, weight, height, goal } = req.body;

  const updateFields = {};

  if (age !== undefined) {
    updateFields.age = age;
  }

  if (weight !== undefined) {
    updateFields.weight = weight;
  }

  if (height !== undefined) {
    updateFields.height = height;
  }

  if (goal !== undefined) {
    updateFields.goal = goal;
  }

  const personalInfo =
    await PersonalInfo.findOneAndUpdate(
      {
        user: req.user._id,
      },
      {
        $set: updateFields,
      },
      {
        new: true,
        runValidators: true,
      }
    );

  if (!personalInfo) {
    throw new ApiError(
      404,
      "Personal information not found"
    );
  }

  return res.status(200).json(
    new ApiResponse(
      200,
      personalInfo,
      "Personal information updated successfully"
    )
  );
});

export {
  createUserInfo,
  getUserInfo,
  updateUserInfo,
};