// ===== MULTI-PROVIDER AUTHENTICATION INTERFACES =====

/**
 * Supported OAuth providers
 */
export type AuthProvider = 'microsoft' | 'google' | 'apple' | 'linkedin' | 'email';

/**
 * Provider-specific scopes for OAuth
 */
export const PROVIDER_SCOPES = {
  microsoft: [
    'openid',
    'profile',
    'email',
    'User.Read',
    'offline_access'   // For refresh tokens
  ]
} as const;

/**
 * Linked OAuth account
 */
export interface LinkedAccount {
  provider: AuthProvider;
  providerId: string;           // User ID from provider
  email?: string;               // Email from provider (may be corporate)
  name?: string;                // Name from provider
  accessToken?: string;         // OAuth access token (for API calls)
  refreshToken?: string;        // OAuth refresh token
  tokenExpiresAt?: Date;        // Token expiration
  linkedAt: Date;               // When account was linked
  lastSyncAt?: Date;            // Last data sync
  scopes?: string[];            // Granted scopes
  profileData?: Record<string, unknown>;  // Raw profile data from provider
}

/**
 * Unified user entity
 * Personal email is the primary identifier
 */
export interface AppUser {
  id: string;                   // UUID from Supabase
  personalEmail: string;        // Primary identifier (personal email)
  displayName: string;          // Display name
  avatarUrl?: string;           // Profile picture URL
  
  // Linked OAuth accounts
  linkedAccounts: LinkedAccount[];
  
  // CV sync status
  cvSyncEnabled: boolean;       // Auto-sync CV from LinkedIn
  lastCvSync?: Date;            // Last CV sync timestamp
  
  // Account metadata
  createdAt: Date;
  updatedAt: Date;
  emailVerified: boolean;
  isActive: boolean;
}

/**
 * Auth state for frontend
 */
export interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: AppUser | null;
  error: string | null;
}

/**
 * OAuth callback response from backend
 */
export interface OAuthCallbackResponse {
  success: boolean;
  token: string;                // JWT access token
  refreshToken?: string;        // Refresh token
  user: AppUser;
  isNewUser: boolean;           // True if user was just created
  needsEmailConfirmation: boolean; // True if personal email not set
  linkedAccount: LinkedAccount; // The account that was just linked
}

/**
 * Link account response (for adding providers to existing account)
 */
export interface LinkAccountResponse {
  success: boolean;
  linkedAccount: LinkedAccount;
  message?: string;
}

/**
 * Microsoft user info (from Graph API)
 */
export interface MicrosoftUserInfo {
  id: string;
  displayName: string;
  givenName?: string;
  surname?: string;
  mail?: string;
  userPrincipalName: string;    // Usually corporate email
  jobTitle?: string;
  officeLocation?: string;
  mobilePhone?: string;
}

/**
 * Auth action types for UI state management
 */
export type AuthAction = 
  | 'login'           // New user login/signup
  | 'link'            // Link additional provider to existing account
  | 'refresh'         // Refresh token
  | 'sync';           // Sync data from provider

/**
 * Pending auth operation (stored in session during OAuth flow)
 */
export interface PendingAuthOperation {
  action: AuthAction;
  provider: AuthProvider;
  returnUrl?: string;
  existingUserId?: string;      // For link operations
  timestamp: number;
}
