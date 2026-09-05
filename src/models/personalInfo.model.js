import mongoose, { Schema } from "mongoose";

const personalInfoSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },

    age: {
      type: Number,
      min: 0,
    },

    weight: {
      type: Number,
      min: 0,
    },

    height: {
      type: Number,
      min: 0,
    },

    goal: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

const PersonalInfo =  mongoose.model(
  "PersonalInfo",
  personalInfoSchema
);

export default PersonalInfo