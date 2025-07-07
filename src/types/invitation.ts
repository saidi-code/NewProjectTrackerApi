export interface IInvitation {
  project: string; // Project ID
  email: string;
  role: "owner" | "admin" | "manager" | "member" | "viewer";
  token: string;
  tokenExpires: Date;
  status: "pending" | "accepted" | "rejected" | "expired";
  invitedBy: string; // User ID
  acceptedAt?: Date;
  rejectedAt?: Date;
}

export type InvitationResponse = Omit<IInvitation, "project" | "invitedBy"> & {
  project: {
    _id: string;
    title: string;
  };
  invitedBy: {
    _id: string;
    name: string;
    email: string;
  };
};
