import mongoose, { Schema } from "mongoose";

const membershipSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    plan: {
      type: Schema.Types.ObjectId,
      ref: "Plan",
      required: true,
    },

    purchase: {
      type: Schema.Types.ObjectId,
      ref: "Purchase",
      required: true,
      unique: true,
    },

    cardNumber: {
      type: String,
      required: true,
      trim: true,
    },

    startDate: {
      type: Date,
      required: true,
    },

    endDate: {
      type: Date,
      required: true,
    },

    status: {
      type: String,
      enum: ["active", "expired", "suspended"],
      default: "active",
    },
  },
  {
    timestamps: true,
  }
);

const Membership = mongoose.model(
  "Membership",
  membershipSchema
);

export default Membership;