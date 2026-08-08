import mongoose from "mongoose";
import Plan from "../models/plan.model.js";
import {asyncHandler} from '../utils/asyncHandler.js'
import {ApiError} from '../utils/apiError.js'
import {ApiResponse} from '../utils/apiRespose.js'
import {
  planValidationSchema,
  updatePlanSchema,
} from "../validators/plan.validator.js";


const createPlan = asyncHandler(async (req, res) => {
  const validatedData = planValidationSchema.parse(req.body);

  const existingPlan = await Plan.findOne({
    name: validatedData.name,
  });

  if (existingPlan) {
    throw new ApiError(409, "Plan already exists");
  }

  const plan = await Plan.create(validatedData);

  const createdPlan = await Plan.findById(plan._id);

  if (!createdPlan) {
    throw new ApiError(500, "Failed to create plan");
  }

  return res.status(201).json(
    new ApiResponse(
      201,
      createdPlan,
      "Plan created successfully"
    )
  );
});

const getAllPlans = asyncHandler(async (req, res) => {
  const plans = await Plan.find().sort({ createdAt: -1 });

  if (!plans.length) {
    throw new ApiError(404, "No plans found");
  }

  return res.status(200).json(
    new ApiResponse(
      200,
      plans,
      "Plans fetched successfully"
    )
  );
});

const getPlanById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(400, "Invalid plan ID");
  }

  const plan = await Plan.findById(id);

  if (!plan) {
    throw new ApiError(404, "Plan not found");
  }

  return res.status(200).json(
    new ApiResponse(
      200,
      plan,
      "Plan fetched successfully"
    )
  );
});

const updatePlan = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(400, "Invalid plan ID");
  }

  const validatedData = updatePlanSchema.parse(req.body);

  const plan = await Plan.findById(id);

  if (!plan) {
    throw new ApiError(404, "Plan not found");
  }

  Object.assign(plan, validatedData);

  await plan.save();

  const updatedPlan = await Plan.findById(id);

  return res.status(200).json(
    new ApiResponse(
      200,
      updatedPlan,
      "Plan updated successfully"
    )
  );
});

const deletePlan = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(400, "Invalid plan ID");
  }

  const plan = await Plan.findById(id);

  if (!plan) {
    throw new ApiError(404, "Plan not found");
  }

  await plan.deleteOne();

  return res.status(200).json(
    new ApiResponse(
      200,
      {},
      "Plan deleted successfully"
    )
  );
});

const filterPlans = asyncHandler(async (req, res) => {
  const { gender, type, duration } = req.query;

  const filter = {};

  if (gender) {
    filter.gender = gender;
  }

  if (type) {
    filter.type = type;
  }

  if (duration) {
    filter.duration = duration;
  }

  const plans = await Plan.find(filter).sort({
    createdAt: -1,
  });

  if (!plans.length) {
    throw new ApiError(
      404,
      "No plans found with the given filters"
    );
  }

  return res.status(200).json(
    new ApiResponse(
      200,
      plans,
      "Plans fetched successfully"
    )
  );
});


export {
  createPlan,
  getAllPlans,
  getPlanById,
  updatePlan,
  deletePlan,
  filterPlans,
};