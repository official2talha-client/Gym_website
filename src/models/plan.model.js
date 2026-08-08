  import mongoose, { Schema } from "mongoose";

const planSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, "Plan name is required"],
      trim: true,
      minlength: 3,
      maxlength: 100,
    },

     description: {
      type: String,
      required: [true, "Plan description is required"],
      trim: true,
      minlength: 2,
      maxlength: 300,
    },

    duration: {
      type: String,
      required: [true, "Duration is required"],
      trim: true,
    },

    type: {
      type: String,
      enum: ["elegant", "basic","elite"],
      default: "basic",
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
planSchema.pre("save", function () {
  this.totalCharge =
    this.subscriptionCharge + this.enrollmentCharge;

});

const Plan = mongoose.model("Plan", planSchema);

export default Plan;