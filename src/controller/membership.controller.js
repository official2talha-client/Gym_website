import mongoose from "mongoose";
import {asyncHandler} from '../utils/asyncHandler.js'
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiRespose.js";
import Membership from '../models/membership.model.js'
import Purchase from "../models/purchase.model.js";
import {User} from '../models/user.model.js'
import Plan from '../models/plan.model.js'

export const createMembership = asyncHandler(async (req, res) => {
  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    const {
      purchaseId,
      startDate,
      endDate,
      cardNumber,
    } = req.body;

    // =========================
    // 1. Find Purchase
    // =========================

    const purchase = await Purchase.findById(purchaseId)
      .populate("user", "fullName userName email membershipCard")
      .populate("plan", "name totalCharge duration")
      .session(session);

    if (!purchase) {
      throw new ApiError(404, "Purchase request not found");
    }

    // =========================
    // 2. Check Purchase Status
    // =========================

    if (purchase.status !== "pending") {
      throw new ApiError(
        400,
        `Purchase is already ${purchase.status}`
      );
    }

    // =========================
    // 3. Validate Dates
    // =========================

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      throw new ApiError(400, "Invalid membership dates");
    }

    if (end <= start) {
      throw new ApiError(
        400,
        "End date must be greater than start date"
      );
    }

    // =========================
    // 4. Get User
    // =========================

    const user = await User.findById(purchase.user._id)
      .session(session);

    if (!user) {
      throw new ApiError(404, "User not found");
    }

    // =========================
    // 5. Determine Card Number
    // =========================

    let finalCardNumber = user.membershipCard;
    

    // First membership → admin provides card
    if (!finalCardNumber) {
      if (!cardNumber) {
        throw new ApiError(
          400,
          "Membership card number is required for first membership"
        );
      }

      finalCardNumber = cardNumber;

      user.membershipCard = cardNumber;
      

      await user.save({ session });
    }

    // =========================
    // 6. Create Membership
    // =========================

    const membership = await Membership.create(
      [
        {

          user: purchase.user._id,
          plan: purchase.plan._id,
          purchase: purchase._id,
          cardNumber: finalCardNumber,
          amount:purchase.plan.totalCharge,

          startDate: start,
          endDate: end,

          status: "active",
        },
      ],
      { session }
    );

    // =========================
    // 7. Accept Purchase
    // =========================

    purchase.status = "accepted";
    purchase.startDate = start;
    purchase.endDate = end;
    purchase.approvedAt = new Date();

    await purchase.save({ session });

    // =========================
    // 8. Commit Transaction
    // =========================

    await session.commitTransaction();

    return res.status(201).json(
      new ApiResponse(
        201,
        membership[0],
        "Membership created and purchase accepted successfully"
      )
    );
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    await session.endSession();
  }
});

// ofline 

export const createManualMembership = asyncHandler(async (req, res) => {
  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    const {
      user,
      plan,
      cardNumber,
      startDate,
      endDate,
    } = req.body;

    const existingUser = await User.findById(user).session(session);

    if (!existingUser) {
      throw new ApiError(404, "User not found");
    }

    const existingPlan = await Plan.findById(plan).session(session);

    if (!existingPlan) {
      throw new ApiError(404, "Plan not found");
    }

    let finalCardNumber = existingUser.membershipCard;

    // First membership → admin must provide card
    if (!finalCardNumber) {
      if (!cardNumber) {
        throw new ApiError(
          400,
          "Membership card number is required"
        );
      }

      finalCardNumber = cardNumber;

      existingUser.membershipCard = cardNumber;

      await existingUser.save({ session });
    }

    const [membership] = await Membership.create(
      [
        {
          user: existingUser._id,
          plan: existingPlan._id,
          purchase: null,
          cardNumber: finalCardNumber,
          amount: existingPlan.totalCharge,
          startDate,
          endDate,
          status: "active",
        },
      ],
      { session }
    );

    await session.commitTransaction();

    return res.status(201).json(
      new ApiResponse(
        201,
        membership,
        "Membership created successfully"
      )
    );
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    await session.endSession();
  }
});

// GET MEMBERSHIP BY ID

export const getMembershipById = asyncHandler(async (req, res) => {

  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(400, "Invalid membership ID");
  }

  const membership = await Membership.findById(id)
    .populate(
      "user",
      "fullName userName email phone"
    )
    .populate(
      "plan"
    )
    .populate(
      "purchase"
    );

  if (!membership) {
    throw new ApiError(
      404,
      "Membership not found"
    );
  }

  return res.status(200).json(
    new ApiResponse(
      200,
      membership,
      "Membership fetched successfully"
    )
  );
});

// GET ALL MEMBERSHIPS
// Admin
export const getAllMemberships = asyncHandler(async (req, res) => {

  const memberships = await Membership.find()
    .populate(
      "user",
      "fullName userName email phone"
    )
    .populate(
      "plan"
    )
    .populate(
      "purchase"
    )
    .sort({ createdAt: -1 });

  return res.status(200).json(
    new ApiResponse(
      200,
      memberships,
      "Memberships fetched successfully"
    )
  );
});

// GET ALL MEMBERSHIPS OF A USER

export const getUserMemberships = asyncHandler(async (req, res) => {

  const { userId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(userId)) {
    throw new ApiError(
      400,
      "Invalid user ID"
    );
  }

  const memberships = await Membership.find({
    user: userId,
  })
    .populate(
      "plan"
    )
    .populate(
      "purchase"
    )
    .sort({ createdAt: -1 });

  return res.status(200).json(
    new ApiResponse(
      200,
      memberships,
      "User memberships fetched successfully"
    )
  );
});

// GET CURRENT USER MEMBERSHIP

export const getMyMembership = asyncHandler(async (req, res) => {

  const membership = await Membership.findOne({
    user: req.user._id,
  })
    .populate(
      "plan"
    )
    .populate(
      "purchase"
    );

  if (!membership) {
    throw new ApiError(
      404,
      "Membership not found"
    );
  }

  return res.status(200).json(
    new ApiResponse(
      200,
      membership,
      "Membership fetched successfully"
    )
  );
});

// update 
// startDate
// endDate
// status

export const updateMembership = asyncHandler(async (req, res) => {

  const { id } = req.params;

  const {
    startDate,
    endDate,
    status,
  } = req.body;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(
      400,
      "Invalid membership ID"
    );
  }

  const membership = await Membership.findById(id);

  if (!membership) {
    throw new ApiError(
      404,
      "Membership not found"
    );
  }

  // --------------------------------------------------
  // Update dates
  // --------------------------------------------------

  if (startDate !== undefined) {
    const start = new Date(startDate);

    if (isNaN(start.getTime())) {
      throw new ApiError(
        400,
        "Invalid start date"
      );
    }

    membership.startDate = start;
  }

  if (endDate !== undefined) {
    const end = new Date(endDate);

    if (isNaN(end.getTime())) {
      throw new ApiError(
        400,
        "Invalid end date"
      );
    }

    membership.endDate = end;
  }

  // --------------------------------------------------
  // Validate date relationship
  // --------------------------------------------------

  if (membership.endDate <= membership.startDate) {
    throw new ApiError(
      400,
      "End date must be after start date"
    );
  }

  // --------------------------------------------------
  // Update status
  // --------------------------------------------------

  if (status !== undefined) {

    const allowedStatuses = [
      "active",
      "expired",
      "suspended",
    ];

    if (!allowedStatuses.includes(status)) {
      throw new ApiError(
        400,
        "Invalid membership status"
      );
    }

    membership.status = status;
  }

  await membership.save();

  return res.status(200).json(
    new ApiResponse(
      200,
      membership,
      "Membership updated successfully"
    )
  );
});

// DELETE MEMBERSHIP

export const deleteMembership = asyncHandler(async (req, res) => {

  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(
      400,
      "Invalid membership ID"
    );
  }

  const membership = await Membership.findById(id);

  if (!membership) {
    throw new ApiError(
      404,
      "Membership not found"
    );
  }

  await Membership.findByIdAndDelete(id);

  return res.status(200).json(
    new ApiResponse(
      200,
      null,
      "Membership deleted successfully"
    )
  );
});