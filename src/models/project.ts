import mongoose from "mongoose";

const teamMemberSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  role: {
    type: String,
    enum: ["owner", "admin", "manager", "member", "viewer"],
    required: true,
  },
  joinedAt: {
    type: Date,
    default: Date.now,
  },
  addedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
});

const projectSchema = new mongoose.Schema(
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
      enum: ["planning", "active", "on-hold", "completed", "archived"],
      default: "planning",
    },
    startDate: Date,
    endDate: Date,
    tags: [
      {
        type: String,
        trim: true,
        maxlength: [20, "Tags cannot exceed 20 characters"],
      },
    ],
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    team: [teamMemberSchema],
    settings: {
      taskAssignment: {
        type: String,
        enum: ["anyone", "managers-only", "specific-roles"],
        default: "managers-only",
      },
      visibility: {
        type: String,
        enum: ["private", "team-only", "public"],
        default: "private",
      },
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtuals
projectSchema.virtual("taskCount", {
  ref: "Task",
  localField: "_id",
  foreignField: "project",
  count: true,
});

projectSchema.virtual("completedTaskCount", {
  ref: "Task",
  localField: "_id",
  foreignField: "project",
  match: { completed: true },
  count: true,
});

// Indexes
projectSchema.index({ createdBy: 1 });
projectSchema.index({ status: 1 });
projectSchema.index({ "team.user": 1 });
projectSchema.index({ endDate: 1 });

const Project = mongoose.model("Project", projectSchema);
export default Project;
