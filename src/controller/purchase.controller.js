import {asyncHandler} from '../utils/asyncHandler.js'
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiRespose.js";
import Purchase from '../models/purchase.model.js'
import mongoose from 'mongoose';

export const createPurchase = asyncHandler(async (req, res) => {
  const { plan } = req.body;

  if (!mongoose.Types.ObjectId.isValid(plan)) {
    throw new ApiError(400, "Invalid plan ID");
  }

  const purchase = await Purchase.create({
    user: req.user._id,
    plan,
  });

  return res.status(201).json(
    new ApiResponse(
      201,
      purchase,
      "Membership request submitted successfully"
    )
  );
});

// ======================================================
// GET PURCHASE BY ID
// ======================================================

export const getPurchaseById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(400, "Invalid purchase ID");
  }

  const purchase = await Purchase.findById(id)
    .populate("user", "fullName userName email phone")
    .populate("plan");

  if (!purchase) {
    throw new ApiError(404, "Purchase not found");
  }

  return res.status(200).json(
    new ApiResponse(
      200,
      purchase,
      "Purchase fetched successfully"
    )
  );
});

// ======================================================
// GET ALL PURCHASES
// Admin
// ======================================================

export const getAllPurchases = asyncHandler(async (req, res) => {
  const purchases = await Purchase.find()
    .populate("user", "fullName userName email phone")
    .populate("plan")
    .sort({ createdAt: -1 });

  return res.status(200).json(
    new ApiResponse(
      200,
      purchases,
      "Purchases fetched successfully"
    )
  );
});

// ======================================================
// DELETE PURCHASE
// ======================================================

export const deletePurchase = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(400, "Invalid purchase ID");
  }

  const purchase = await Purchase.findById(id);

  if (!purchase) {
    throw new ApiError(404, "Purchase not found");
  }

  // Don't delete an accepted purchase because
  // it represents membership history.
  if (purchase.status === "accepted") {
    throw new ApiError(
      400,
      "Accepted purchase cannot be deleted"
    );
  }

  await Purchase.findByIdAndDelete(id);

  return res.status(200).json(
    new ApiResponse(
      200,
      null,
      "Purchase deleted successfully"
    )
  );
});


// purchase status change 

export const changePurchaseStatus = asyncHandler(
  async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new ApiError(400, "Invalid purchase ID");
    }

    if (!["rejected"].includes(status)) {
      throw new ApiError(
        400,
        "Only rejected status can be manually set"
      );
    }

    const purchase = await Purchase.findById(id);

    if (!purchase) {
      throw new ApiError(404, "Purchase not found");
    }

    if (purchase.status !== "pending") {
      throw new ApiError(
        400,
        "Only pending purchases can be rejected"
      );
    }

    purchase.status = "rejected";
    purchase.rejectedAt = new Date();

    await purchase.save();

    return res.status(200).json(
      new ApiResponse(
        200,
        purchase,
        "Purchase rejected successfully"
      )
    );
  }
);


// ======================================================
// GET PURCHASES OF SPECIFIC USER
// Admin
// ======================================================

export const getUserPurchases = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(userId)) {
    throw new ApiError(400, "Invalid user ID");
  }

  const purchases = await Purchase.find({
    user: userId,
  })
    .populate(
      "user",
      "fullName userName email phone"
    )
    .populate(
      "plan"
    )
    .sort({ createdAt: -1 });

  return res.status(200).json(
    new ApiResponse(
      200,
      purchases,
      "User purchases fetched successfully"
    )
  );
});


// ======================================================
// GET LOGGED-IN USER'S OWN PURCHASES
// User
// ======================================================

export const getMyPurchases = asyncHandler(async (req, res) => {

  const purchases = await Purchase.find({
    user: req.user._id,
  })
    .populate(
      "plan"
    )
    .sort({ createdAt: -1 });

  return res.status(200).json(
    new ApiResponse(
      200,
      purchases,
      "Your purchases fetched successfully"
    )
  );
});



