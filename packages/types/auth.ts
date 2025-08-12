export interface AuthenticatedUser {
  id: string;
  name: unknown;
  email: string;
  role?: string | null;
}
