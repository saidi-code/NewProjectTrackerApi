import mongoose from "mongoose";

const activitySchema = new mongoose.Schema(
  {
    action: {
      type: String,
      required: true,
      enum: [
        "create",
        "update",
        "delete",
        "comment",
        "status-change",
        "assignment",
      ],
    },
    entityType: {
      type: String,
      required: true,
      enum: ["project", "task", "invitation", "user"],
    },
    entityId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    performedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
    },
    details: {
      oldValue: mongoose.Schema.Types.Mixed,
      newValue: mongoose.Schema.Types.Mixed,
      field: String,
    },
    message: String,
  },
  { timestamps: true }
);

// Indexes
activitySchema.index({ entityType: 1, entityId: 1 });
activitySchema.index({ performedBy: 1 });
activitySchema.index({ project: 1 });
activitySchema.index({ createdAt: -1 });

const Activity = mongoose.model("Activity", activitySchema);
export default Activity;
