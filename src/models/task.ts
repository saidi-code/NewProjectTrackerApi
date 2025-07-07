import mongoose from "mongoose";

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
    dueDate: Date,
    completed: {
      type: Boolean,
      default: false,
    },
    completedAt: Date,
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: true,
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
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
    estimatedHours: Number,
    actualHours: Number,
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
