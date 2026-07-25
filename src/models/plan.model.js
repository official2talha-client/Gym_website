  import mongoose, { Schema } from "mongoose";

const planSchema = new Schema(
  {
    image: {
      type: String,
      required: [true, "Plan image is required"],
      trim: true,
    },

    name: {
      type: String,
      required: [true, "Plan name is required"],
      trim: true,
      minlength: 3,
      maxlength: 100,
    },

    duration: {
      type: String,
      required: [true, "Duration is required"],
      trim: true,
    },

    type: {
      type: String,
      enum: ["premium", "normal","exclusive"],
      default: "normal",
    },

    subscriptionCharge: {
      type: Number,
      required: true,
      min: [0, "Subscription charge cannot be negative"],
    },

    enrollmentCharge: {
      type: Number,
      required: true,
      min: [0, "Enrollment charge cannot be negative"],
    },

    totalCharge: {
      type: Number,
      min: 0,
    },

    usage: [
      {
        type: String,
        trim: true,
      },
    ],

    restriction: [
      {
        type: String,
        trim: true,
      },
    ],

    treadmillUsageTime: {
      type: String,
      required: true,
      trim: true,
    },

    gender: {
      type: String,
      enum: ["male", "female", "both"],
      default: "both",
    },
  },
  {
    timestamps: true,
  }
);

// Automatically calculate total charge
planSchema.pre("save", function (next) {
  this.totalCharge =
    this.subscriptionCharge + this.enrollmentCharge;

  next();
});

const Plan = mongoose.model("Plan", planSchema);

export default Plan;