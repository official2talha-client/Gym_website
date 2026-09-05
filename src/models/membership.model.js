import mongoose, { Schema } from "mongoose";

const membershipSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    plan: {
      type: Schema.Types.ObjectId,
      ref: "Plan",
      required: true,
    },

    purchase: {
      type: Schema.Types.ObjectId,
      ref: "Purchase",
      default:null
    },

    cardNumber: {
      type: String,
      required: true,
      trim: true,
    },

    amount: {
      type: Number,
      required: true,
      min: 0,
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