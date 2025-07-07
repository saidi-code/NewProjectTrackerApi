export interface IActivity {
  action:
    | "create"
    | "update"
    | "delete"
    | "comment"
    | "status-change"
    | "assignment";
  entityType: "project" | "task" | "invitation" | "user";
  entityId: string;
  performedBy: string; // User ID
  project?: string; // Project ID
  details?: {
    oldValue?: any;
    newValue?: any;
    field?: string;
  };
  message?: string;
}

export type ActivityResponse = Omit<IActivity, "performedBy" | "project"> & {
  performedBy: {
    _id: string;
    name: string;
    avatar?: string;
  };
  project?: {
    _id: string;
    title: string;
  };
};
