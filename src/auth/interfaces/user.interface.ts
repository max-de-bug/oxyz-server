export interface AuthenticatedUser {
  id: string;
  email: string;
  name?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

// Extend Express Request to include user
