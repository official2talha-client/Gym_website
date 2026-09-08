import {asyncHandler} from '../utils/asyncHandler.js'
import {ApiError} from '../utils/apiError.js'
import {ApiResponse} from '../utils/apiRespose.js'
import {User} from '../models/user.model.js'
import Purchase from '../models/purchase.model.js'
import Membership from '../models/membership.model.js'
import Business from '../models/business.model.js'

// business controllers

const createBusiness = asyncHandler(async (req, res) => {
  const owner = req.user._id;

  // Check if owner already has a business
  const existingBusiness = await Business.findOne({ owner });

  if (existingBusiness) {
    throw new ApiError(
      409,
      "You already have a business"
    );
  }

  const {
    name,
    logo,
    phone,
    email,
    address,
    weekdays,
  } = req.body;

  if (!name) {
    throw new ApiError(400, "Business name is required");
  }
  if (!address) {
    throw new ApiError(400, "Business address is required");
  }

  const business = await Business.create({
    owner,
    name,
    logo,
    phone,
    email,
    address,
    weekdays,
  });

  return res.status(201).json(
    new ApiResponse(
      201,
      business,
      "Business created successfully"
    )
  );
});


const getMyBusiness = asyncHandler(async (req, res) => {
  const business = await Business.findOne({
    owner: req.user._id,
  }).populate("owner", "fullName userName email phone");

  if (!business) {
    throw new ApiError(
      404,
      "Business not found"
    );
  }

  return res.status(200).json(
    new ApiResponse(
      200,
      business,
      "Business data fetched successfully"
    )
  );
});

const updateBusiness = asyncHandler(async (req, res) => {
  const {
    name,
    logo,
    phone,
    email,
    address,
    weekdays,
  } = req.body;

  const business = await Business.findOneAndUpdate(
    {
      owner: req.user._id,
    },
    {
      $set: {
        ...(name !== undefined && { name }),
        ...(logo !== undefined && { logo }),
        ...(phone !== undefined && { phone }),
        ...(email !== undefined && { email }),
        ...(address !== undefined && { address }),
        ...(weekdays !== undefined && { weekdays }),
      },
    },
    {
      new: true,
      runValidators: true,
    }
  );

  if (!business) {
    throw new ApiError(
      404,
      "Business not found"
    );
  }

  return res.status(200).json(
    new ApiResponse(
      200,
      business,
      "Business updated successfully"
    )
  );
});



// users controller 

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

})

// purchase 

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

// dashboard datas 

const getTotalRevenue = asyncHandler(async (req, res) => {
  const result = await Membership.aggregate([
    {
      $lookup: {
        from: "plans",
        localField: "plan",
        foreignField: "_id",
        as: "planDetails",
      },
    },
    {
      $unwind: "$planDetails",
    },
    {
      $group: {
        _id: null,
        totalRevenue: {
          $sum: "$planDetails.totalCharge",
        },
        totalMemberships: {
          $sum: 1,
        },
      },
    },
  ]);

  const revenue = result[0] || {
    totalRevenue: 0,
    totalMemberships: 0,
  };

  return res.status(200).json(
    new ApiResponse(
      200,
      revenue,
      "Total revenue calculated successfully"
    )
  );
});

const getNewUsers = asyncHandler(async (req, res) => {
  const thirtyDaysAgo = new Date();

  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const [newUsers, totalUsers, activeUsers] = await Promise.all([
    // New users in last 30 days
    User.countDocuments({
      createdAt: {
        $gte: thirtyDaysAgo,
      },
    }),

    // Total users
    User.countDocuments(),

    // Active users
    User.countDocuments({
      status: "active",
    }),
  ]);

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        totalUsers,
        newUsers,
        activeUsers,
        period: "last 30 days",
      },
      "User statistics fetched successfully"
    )
  );
});


const getAdminActionRecords = asyncHandler(async (req, res) => {
  const today = new Date();

  // Start of today
  const startOfToday = new Date(today);
  startOfToday.setHours(0, 0, 0, 0);

  // 10 days from today
  const tenDaysFromNow = new Date(startOfToday);
  tenDaysFromNow.setDate(tenDaysFromNow.getDate() + 10);
  tenDaysFromNow.setHours(23, 59, 59, 999);

  const [pendingPurchases, expiringMemberships] = await Promise.all([
    // Pending purchase requests
    Purchase.find({ status: "pending" })
      .populate("user", "fullName userName phone email")
      .populate("plan", "name totalCharge duration")
      .sort({ requestedAt: -1 })
      .lean(),

    // Memberships expiring within next 10 days
    Membership.find({
      status: "active",
      endDate: {
        $gte: startOfToday,
        $lte: tenDaysFromNow,
      },
    })
      .populate("user", "fullName userName phone email")
      .populate("plan", "name totalCharge duration")
      .sort({ endDate: 1 })
      .lean(),
  ]);

  // Add daysLeft to each membership
  const membershipsWithDaysLeft = expiringMemberships.map((membership) => {
    const endDate = new Date(membership.endDate);

    const differenceInMs =
      endDate.getTime() - startOfToday.getTime();

    const daysLeft = Math.ceil(
      differenceInMs / (1000 * 60 * 60 * 24)
    );

    return {
      ...membership,
      daysLeft,
    };
  });

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        pendingPurchases: {
          count: pendingPurchases.length,
          records: pendingPurchases,
        },

        expiringMemberships: {
          count: membershipsWithDaysLeft.length,
          records: membershipsWithDaysLeft,
        },
      },
      "Admin action records fetched successfully"
    )
  );
});


export {getAllUsers,getUserById,changeUserStatus,getPurchaseStatistics,getTotalRevenue,getNewUsers,createBusiness,getMyBusiness,updateBusiness,getAdminActionRecords}
