import mongoose, { Schema } from "mongoose";

const exerciseSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, "Exercise name is required"],
      trim: true,
      minlength: 2,
      maxlength: 100,
    },

    bodyPart: {
      type: String,
      required: true,
      
    },

    targetMuscle: {
      type: String,
      required: true,
      trim: true,
    },

    secondaryMuscles: [
      {
        type: String,
        trim: true,
      },
    ],

    equipment: {
      type: String,
      required: true,
     
    },

    difficulty: {
      type: String,
      required: true,
      enum: ["beginner", "intermediate", "advanced"],
    },

    description: {
      type: String,
      required: true,
      trim: true,
      maxlength: 1000,
    },

    thumbnail: {
      type: String,
      required: true,
      trim: true,
    },

    video: {
      type: String,
      required: true,
      trim: true,
    },

    duration: {
      type: String,
      trim: true,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

exerciseSchema.index({ bodyPart: 1 });
exerciseSchema.index({ difficulty: 1 });
exerciseSchema.index({ equipment: 1 });

const Exercise = mongoose.model("Exercise", exerciseSchema);

export default Exercise;