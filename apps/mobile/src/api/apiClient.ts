import axios, { AxiosInstance, AxiosError } from 'axios';
import { REACT_NATIVE_API_URL } from '@env';
import type {
  LoginRequest,
  LoginResponse,
  CreateInviteRequest,
  CreateInviteResponse,
  InviteDetails,
  SubmitRsvpRequest,
  SubmitRsvpResponse,
  CheckInRequest,
  CheckInResponse,
  ApiError,
} from '../types/api';

// API client configuration
const API_BASE_URL = REACT_NATIVE_API_URL || 'http://localhost:5000';

class ApiClient {
  private client: AxiosInstance;
  private authToken: string | null = null;

  constructor(baseURL: string) {
    this.client = axios.create({
      baseURL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor to add auth token
    this.client.interceptors.request.use(
      (config) => {
        if (this.authToken) {
          config.headers.Authorization = `Bearer ${this.authToken}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response,
      (error: AxiosError<ApiError>) => {
        const apiError: ApiError = {
          message: error.response?.data?.message || error.message || 'An error occurred',
          statusCode: error.response?.status || 500,
          details: error.response?.data?.details,
        };
        return Promise.reject(apiError);
      }
    );
  }

  /**
   * Set authentication token for subsequent requests
   */
  setAuthToken(token: string | null) {
    this.authToken = token;
  }

  /**
   * Clear authentication token
   */
  clearAuthToken() {
    this.authToken = null;
  }

  // ============================================
  // Auth Endpoints
  // ============================================

  /**
   * Login with phone number
   * TODO: Update endpoint once backend implements auth
   */
  async login(data: LoginRequest): Promise<LoginResponse> {
    const response = await this.client.post<LoginResponse>('/api/auth/login', data);
    return response.data;
  }

  // ============================================
  // Invite Endpoints
  // ============================================

  /**
   * Create a new invite
   * TODO: Update endpoint once backend implements invite endpoints
   */
  async createInvite(data: CreateInviteRequest): Promise<CreateInviteResponse> {
    const response = await this.client.post<CreateInviteResponse>('/api/invites', data);
    return response.data;
  }

  /**
   * Get invite details by ID
   */
  async getInvite(inviteId: string): Promise<InviteDetails> {
    const response = await this.client.get<InviteDetails>(`/api/invites/${inviteId}`);
    return response.data;
  }

  /**
   * Submit RSVP for an invite
   */
  async submitRsvp(inviteId: string, data: SubmitRsvpRequest): Promise<SubmitRsvpResponse> {
    const response = await this.client.post<SubmitRsvpResponse>(
      `/api/invites/${inviteId}/rsvp`,
      data
    );
    return response.data;
  }

  /**
   * Check in a guest using their invite
   */
  async checkInGuest(inviteId: string, data: CheckInRequest): Promise<CheckInResponse> {
    const response = await this.client.post<CheckInResponse>(
      `/api/invites/${inviteId}/checkin`,
      data
    );
    return response.data;
  }

  // ============================================
  // Health Check (for testing connectivity)
  // ============================================

  /**
   * Check API health/connectivity
   */
  async healthCheck(): Promise<{ status: string }> {
    const response = await this.client.get<{ status: string }>('/health');
    return response.data;
  }
}

// Export singleton instance
export const apiClient = new ApiClient(API_BASE_URL);

// Export helper functions
export const setAuthToken = (token: string | null) => apiClient.setAuthToken(token);
export const clearAuthToken = () => apiClient.clearAuthToken();
