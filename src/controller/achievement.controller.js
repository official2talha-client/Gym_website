import Achievement  from "../models/achivement.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiRespose.js";

const createAchievement = asyncHandler(
  async (req, res) => {
    const achievement =
      await Achievement.create({
        ...req.body,
        user: req.user._id,
      });

    return res.status(201).json(
      new ApiResponse(
        201,
        achievement,
        "Achievement created successfully"
      )
    );
  }
);

const getAchievements = asyncHandler(
  async (req, res) => {
    const achievements =
      await Achievement.find({
        user: req.user._id,
      }).sort({
        createdAt: -1,
      });

    return res.status(200).json(
      new ApiResponse(
        200,
        achievements,
        "Achievements fetched successfully"
      )
    );
  }
);

const getAchievementById = asyncHandler(
  async (req, res) => {
    const { id } = req.params;

    const achievement =
      await Achievement.findOne({
        _id: id,
        user: req.user._id,
      });

    if (!achievement) {
      throw new ApiError(
        404,
        "Achievement not found"
      );
    }

    return res.status(200).json(
      new ApiResponse(
        200,
        achievement,
        "Achievement fetched successfully"
      )
    );
  }
);

const deleteAchievement = asyncHandler(
  async (req, res) => {
    const { id } = req.params;

    const achievement =
      await Achievement.findOneAndDelete({
        _id: id,
        user: req.user._id,
      });

    if (!achievement) {
      throw new ApiError(
        404,
        "Achievement not found"
      );
    }

    return res.status(200).json(
      new ApiResponse(
        200,
        {},
        "Achievement deleted successfully"
      )
    );
  }
);

export {
  createAchievement,
  getAchievements,
  getAchievementById,
  deleteAchievement,
};