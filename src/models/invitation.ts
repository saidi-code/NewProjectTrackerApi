import mongoose from "mongoose";

const invitationSchema = new mongoose.Schema(
  {
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: true,
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      match: [/\S+@\S+\.\S+/, "Please use a valid email address"],
    },
    role: {
      type: String,
      enum: ["owner", "admin", "manager", "member", "viewer"],
      required: true,
    },
    token: {
      type: String,
      required: true,
    },
    tokenExpires: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "accepted", "rejected", "expired"],
      default: "pending",
    },
    invitedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    acceptedAt: Date,
    rejectedAt: Date,
  },
  { timestamps: true }
);

// Indexes
invitationSchema.index({ token: 1 }, { unique: true });
invitationSchema.index({ email: 1, project: 1 });
invitationSchema.index({ status: 1, tokenExpires: 1 });

const Invitation = mongoose.model("Invitation", invitationSchema);
export default Invitation;
