import mongoose, { Schema } from "mongoose";

const trainerSchema = new Schema(
  {
    image: {
      type: String,
      required: [true, "Trainer image is required"],
      trim: true,
    },

    name: {
      type: String,
      required: [true, "Trainer name is required"],
      trim: true,
      minlength: 3,
      maxlength: 100,
    },

    shift: {
      type: String,
      enum: ["morning", "evening", "full-day"],
      required: true,
    },

    timeRange: {
      type: String,
      required: [true, "Time range is required"],
      trim: true,
    },

    achievements: [
      {
        type: String,
        trim: true,
      },
    ],

    age: {
      type: Number,
      required: true,
      min: [10, "Trainer must be at least 18 years old"],
      max: [80, "Invalid age"],
    },

     experience: {
      type: Number,
      required: true,
      min: [0, "Trainer experience can't be 0"],
    },

    gender: {
      type: String,
      enum: ["male", "female"],
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const Trainer = mongoose.model("Trainer", trainerSchema);

export default Trainer;