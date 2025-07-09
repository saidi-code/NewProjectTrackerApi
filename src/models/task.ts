import mongoose from "mongoose";
import { ITask } from "../types";
const taskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
      maxlength: [100, "Title cannot exceed 100 characters"],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [1000, "Description cannot exceed 1000 characters"],
    },
    status: {
      type: String,
      enum: ["backlog", "todo", "in-progress", "review", "done"],
      default: "todo",
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high", "critical"],
      default: "medium",
    },
    dueDate: {
      type: Date,
      validate: {
        validator: function (this: ITask, value: Date) {
          // Due date must be in the future when set
          return !value || value > new Date();
        },
        message: "Due date must be in the future",
      },
    },
    completed: {
      type: Boolean,
      default: false,
    },
    completedAt: {
      type: Date,
      validate: {
        validator: function (this: ITask, value: Date) {
          // completedAt must be after task creation if completed
          if (!this.createdAt) return false;
          return !this.completed || value > this.createdAt;
        },
        message: "Completion date must be after creation",
      },
    },
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: true,
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    labels: [
      {
        type: String,
        trim: true,
        maxlength: [20, "Labels cannot exceed 20 characters"],
      },
    ],
    estimatedHours: {
      type: Number,
      min: [0.25, "Minimum 15 minutes (0.25 hours)"],
      max: [200, "Maximum 200 hours per task"],
      set: (val: number) => Math.round(val * 4) / 4, // Round to nearest 0.25
    },
    actualHours: {
      type: Number,
      min: [0, "Cannot be negative"],
      default: 0,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtuals
taskSchema.virtual("isOverdue").get(function () {
  if (!this.dueDate) return false;
  return !this.completed && this.dueDate < new Date();
});
// Virtual for progress percentage
taskSchema.virtual("progress").get(function (this: ITask) {
  if (!this.estimatedHours || this.estimatedHours === 0) return 0;
  if (!this.actualHours || this.actualHours === 0) return 0;
  return Math.min(
    100,
    Math.round((this.actualHours / this.estimatedHours) * 100)
  );
});

// Auto-set completedAt when task is marked complete
taskSchema.pre<ITask>("save", function (next) {
  if (this.isModified("completed") && this.completed) {
    this.completedAt = new Date();
  }
  next();
});

// Indexes
taskSchema.index({ project: 1 });
taskSchema.index({ assignedTo: 1 });
taskSchema.index({ status: 1 });
taskSchema.index({ priority: 1 });
taskSchema.index({ dueDate: 1 });

// Update completedAt when task is completed
taskSchema.pre("save", function (next) {
  if (this.isModified("completed") && this.completed) {
    this.completedAt = new Date();
  }
  next();
});

const Task = mongoose.model("Task", taskSchema);
export default Task;
