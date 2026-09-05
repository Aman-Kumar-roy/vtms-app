import axios, { AxiosInstance } from 'axios';
import {
  LoginRequest,
  LoginResponse,
  User,
  SellerListResponse,
  SellerDetailResponse,
  CreateSellerRequest,
  UpdateSellerRequest,
  TransactionListResponse,
  CreateTransactionRequest,
  UpdateTransactionRequest,
  SummaryReportResponse,
  TankSummaryReportResponse,
  ServerReceipt,
} from '../types';

export class VTMSMobileApiClient {
  private client: AxiosInstance;
  private token: string | null = null;

  constructor(baseURL: string = 'http://localhost:5000/api/v1') {
    this.client = axios.create({
      baseURL,
      timeout: 15000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.client.interceptors.request.use((config) => {
      if (this.token && config.headers) {
        config.headers.Authorization = `Bearer ${this.token}`;
      }
      return config;
    });
  }

  public setToken(token: string | null) {
    this.token = token;
  }

  public setBaseURL(baseURL: string) {
    this.client.defaults.baseURL = baseURL;
  }

  // ==========================================
  // Auth
  // ==========================================
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    const res = await this.client.post<LoginResponse>('/auth/login', credentials);
    if (res.data?.data?.token) {
      this.setToken(res.data.data.token);
    }
    return res.data;
  }

  async getMe(): Promise<{ success: boolean; data: { user: User } }> {
    const res = await this.client.get('/auth/me');
    return res.data;
  }

  async getUsers(): Promise<{ success: boolean; data: { users: User[] } }> {
    const res = await this.client.get('/auth/users');
    return res.data;
  }

  async createUser(data: { name: string; email: string; password: string; role?: 'admin' | 'manager' }) {
    const res = await this.client.post('/auth/users', data);
    return res.data;
  }

  async deleteUser(id: string) {
    const res = await this.client.delete(`/auth/users/${id}`);
    return res.data;
  }

  // ==========================================
  // Sellers / Vendors
  // ==========================================
  async getSellers(params?: { page?: number; limit?: number; search?: string }): Promise<SellerListResponse> {
    const res = await this.client.get<SellerListResponse>('/sellers', { params });
    return res.data;
  }

  async getSellerById(id: string, params?: { page?: number; limit?: number }): Promise<SellerDetailResponse> {
    const res = await this.client.get<SellerDetailResponse>(`/sellers/${id}`, { params });
    return res.data;
  }

  async createSeller(data: CreateSellerRequest) {
    const res = await this.client.post('/sellers', data);
    return res.data;
  }

  async updateSeller(id: string, data: UpdateSellerRequest) {
    const res = await this.client.put(`/sellers/${id}`, data);
    return res.data;
  }

  async deleteSeller(id: string) {
    const res = await this.client.delete(`/sellers/${id}`);
    return res.data;
  }

  // ==========================================
  // Transactions (Deliveries & Payments)
  // ==========================================
  async getTransactions(params?: {
    page?: number;
    limit?: number;
    type?: 'DELIVERY' | 'PAYMENT';
    sellerId?: string;
    search?: string;
  }): Promise<TransactionListResponse> {
    const res = await this.client.get<TransactionListResponse>('/transactions', { params });
    return res.data;
  }

  async createTransaction(data: CreateTransactionRequest) {
    const res = await this.client.post('/transactions', data);
    return res.data;
  }

  async getTransactionReceipt(id: string): Promise<{ success: boolean; data: { receipt: ServerReceipt } }> {
    const res = await this.client.get(`/transactions/${id}/receipt`);
    return res.data;
  }

  async updateTransaction(id: string, data: UpdateTransactionRequest) {
    const res = await this.client.put(`/transactions/${id}`, data);
    return res.data;
  }

  async deleteTransaction(id: string) {
    const res = await this.client.delete(`/transactions/${id}`);
    return res.data;
  }

  // ==========================================
  // Reports
  // ==========================================
  async getSummaryReport(): Promise<SummaryReportResponse> {
    const res = await this.client.get<SummaryReportResponse>('/reports/summary');
    return res.data;
  }

  async getTankSummaryReport(): Promise<TankSummaryReportResponse> {
    const res = await this.client.get<TankSummaryReportResponse>('/reports/tank-summary');
    return res.data;
  }
}

export const vtmsApi = new VTMSMobileApiClient();
