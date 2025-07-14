import mongoose from "mongoose";
import { IProject, ITask, TeamMember } from "../types";
const teamMemberSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    index: 1,
  },
  email: {
    // Add this field
    type: String,
    required: false,
    lowercase: true,
    trim: true,
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

const projectSchema = new mongoose.Schema<IProject>(
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
      index: 1,
    },
    startDate: {
      type: Date,
      required: [true, "Start date is required"],
      validate: {
        validator: function (this: IProject, value: Date) {
          // End date must be after start date if both exist
          return !this.endDate || value < this.endDate;
        },
        message: "Start date must be before end date",
      },
      index: 1,
    },
    endDate: {
      type: Date,
      validate: {
        validator: function (this: IProject, value: Date) {
          // End date must be after start date if both exist
          return !this.startDate || value > this.startDate;
        },
        message: "End date must be after start date",
      },
      index: 1,
    },
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
      index: 1,
    },
    team: {
      members: [teamMemberSchema],
    },
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
projectSchema.methods.getAdminIds = function () {
  return this.team.members
    .filter((member: TeamMember) =>
      ["owner", "admin", "manager"].includes(member.role)
    )
    .map((member: TeamMember) => member.user);
};

projectSchema.methods.getTaskAssignees = function (taskId: string) {
  return this.tasks
    .filter((task: ITask) => task._id.equals(taskId))
    .flatMap((task: ITask) => task.assignedTo);
};
// Indexes
projectSchema.index({ createdBy: 1 });
projectSchema.index({ status: 1 });
projectSchema.index({ "team.user": 1 });
projectSchema.index({ endDate: 1 });

const Project = mongoose.model("Project", projectSchema);
export default Project;
