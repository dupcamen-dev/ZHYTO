export type UserRole = 'user' | 'admin';

export interface Profile {
  id: string;
  role: UserRole;
  created_at: string;
}

export interface User {
  id: string;
  email: string;
  profile?: Profile;
}

export interface SignUpInput {
  email: string;
  password: string;
  name: string;
}

export interface SignInInput {
  email: string;
  password: string;
}
