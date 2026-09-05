import {asyncHandler} from '../utils/asyncHandler.js'
import {ApiError} from '../utils/apiError.js'
import {ApiResponse} from '../utils/apiRespose.js'
import {User} from '../models/user.model.js'
import Purchase from '../models/purchase.model.js'
import jwt from 'jsonwebtoken'
import mongoose from 'mongoose'


const getAllUsers = asyncHandler(async (req, res) => {
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;

  const skip = (page - 1) * limit;

  const users = await User.find()
    .select("-password -refreshToken")
    .skip(skip)
    .limit(limit);

  const totalUsers = await User.countDocuments();

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        users,
        pagination: {
          total: totalUsers,
          page,
          limit,
          pages: Math.ceil(totalUsers / limit),
        },
      },
      "Users fetched successfully"
    )
  );
});

const getUserById = asyncHandler(async (req, res) => {

    const { id } = req.params;

    const user = await User.findById(id)
        .select("-password -refreshToken")
       

    if (!user) {
        throw new ApiError(
            404,
            "User not found"
        );
    }

    return res.status(200).json(
        new ApiResponse(
            200,
            user,
            "User fetched successfully"
        )
    );

});

const changeUserStatus = asyncHandler(async (req, res) => {

    const { id } = req.params;
    const { status } = req.body;

    const user = await User.findByIdAndUpdate(
        id,
        {
            status
        },
        {
            new: true,
            runValidators: true
        }
    ).select("-password -refreshToken");

    if (!user) {
        throw new ApiError(404, "User not found");
    }

    return res.status(200).json(
        new ApiResponse(
            200,
            user,
            "User status updated successfully"
        )
    );

});

const getAllPurchases = asyncHandler(async (req, res) => {
  const { status } = req.query;

  const filter = {};

  if (status) {
    filter.status = status;
  }

  const purchases = await Purchase.find(filter)
    .populate("user", "fullName email membershipCardId")
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

const updatePurchaseStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const { status, membershipCardId } = req.body;
  console.log(req.body);
  

  const purchase = await Purchase.findById(id)
   .populate({
  path: "user",
  select:
    "fullName userName email status membershipCardId",
})
.populate({
  path: "plan",
  select: "name duration",
});

  if (!purchase) {
    throw new ApiError(404, "Purchase not found");
  }

  if (purchase.status !== "pending") {
    throw new ApiError(
      400,
      "Purchase has already been processed"
    );
  }

  if (status === "rejected") {
    purchase.status = "rejected";

    await purchase.save();

    return res.status(200).json(
      new ApiResponse(
        200,
        purchase,
        "Purchase rejected successfully"
      )
    );
  }

  if (!membershipCardId) {
    throw new ApiError(
      400,
      "Membership card ID is required"
    );
  }

  const existingCard = await User.findOne({
    membershipCardId,
  });

  if (existingCard) {
    throw new ApiError(
      409,
      "Membership card ID already exists"
    );
  }

  const startDate = new Date();

  const endDate = new Date(startDate);

  endDate.setMonth(
    endDate.getMonth() + purchase.plan.duration
  );

  purchase.status = "accepted";
  purchase.startDate = startDate;
  purchase.endDate = endDate;
  purchase.approvedAt = new Date();

  await purchase.save();

  purchase.user.membershipCardId = membershipCardId;

  await purchase.user.save({
    validateBeforeSave: false,
  });

  return res.status(200).json(
    new ApiResponse(
      200,
      purchase,
      "Purchase accepted successfully"
    )
  );
});

const getPurchaseStatistics = asyncHandler(
  async (req, res) => {
    const [
      total,
      accepted,
      rejected,
      pending,
    ] = await Promise.all([
      Purchase.countDocuments(),
      Purchase.countDocuments({
        status: "accepted",
      }),
      Purchase.countDocuments({
        status: "rejected",
      }),
      Purchase.countDocuments({
        status: "pending",
      }),
    ]);

    return res.status(200).json(
      new ApiResponse(
        200,
        {
          total,
          accepted,
          rejected,
          pending,
        },
        "Statistics fetched successfully"
      )
    );
  }
);

export {getAllUsers,getUserById,changeUserStatus,getAllPurchases,getPurchaseStatistics,updatePurchaseStatus}
