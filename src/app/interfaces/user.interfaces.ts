export interface UserProfile {
  uuid_usuario: string;
  displayName: string;
  primaryEmail: string;
  avatarUrl: string | null;
  birthDate: string | null;
  createdAt: string;
}

export interface UpdateProfilePayload {
  displayName?: string;
  avatarUrl?: string;
  birthDate?: string;
}
