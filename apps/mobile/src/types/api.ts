// Type definitions for API requests and responses
// TODO: Generate these from OpenAPI spec once backend implements invite endpoints
// Command: npx openapi-typescript ./apps/mobile/openapi.json --output ./apps/mobile/src/types/api-types.ts

export interface LoginRequest {
  phone: string;
}

export interface LoginResponse {
  token: string;
  expiresIn: number;
}

export interface CreateInviteRequest {
  guestName: string;
  phone: string;
  allowedPlusOnes: number;
  eventId: string;
}

export interface CreateInviteResponse {
  inviteId: string;
  qrCodeUrl: string;
  rsvpUrl: string;
}

export interface InviteDetails {
  inviteId: string;
  guestName: string;
  phone: string;
  allowedPlusOnes: number;
  rsvpStatus: 'pending' | 'accepted' | 'declined';
  checkedIn: boolean;
}

export interface PlusOne {
  name: string;
  phone: string;
}

export interface SubmitRsvpRequest {
  attending: boolean;
  plusOnes: PlusOne[];
  parkingRequired: boolean;
}

export interface SubmitRsvpResponse {
  success: boolean;
  message: string;
}

export interface CheckInRequest {
  scannedAt: string;
  scannedBy: string;
}

export interface CheckInResponse {
  success: boolean;
  guestName: string;
  allowedPlusOnes: number;
  checkedInCount: number;
}

export interface ApiError {
  message: string;
  statusCode: number;
  details?: Record<string, unknown>;
}
