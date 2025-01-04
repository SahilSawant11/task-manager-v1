export type Issue = {
  id: number;
  description: string;
  status: string;
  priority: string;
  assignedTo: string;
  devNote: string;
  category: string;
  teamLead: string;
  date: string;
  attachments: string[];
  comments: Comment[];
  project: string;
  example: string;
  reportedBy: string;
  resolutionDate: string;
}

export type Comment = {
  id: number;
  author: string;
  content: string;
  createdAt: string;
}

