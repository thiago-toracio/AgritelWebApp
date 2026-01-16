/**
 * Auth Service
 * Handles authentication with the new .NET 10 API
 */

export interface LoginRequest {
  email: string;
  password: string;
}

export interface User {
  name: string;
  email: string;
  id: string;
}

export interface LoginResponse {
  authenticated: boolean;
  message: string;
  user?: User;
}

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5032';

export class AuthService {
  private storageKey = 'monitoramento_user';

  async login(credentials: LoginRequest): Promise<LoginResponse> {
    const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        Email: credentials.email,
        Password: credentials.password,
      }),
    });

    const data = await response.json();

    if (response.ok && data.authenticated) {
      this.saveUser(data.user);
    }

    return data;
  }

  saveUser(user: User): void {
    localStorage.setItem(this.storageKey, JSON.stringify(user));
  }

  getUser(): User | null {
    const stored = localStorage.getItem(this.storageKey);
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch {
        return null;
      }
    }
    return null;
  }

  isAuthenticated(): boolean {
    return this.getUser() !== null;
  }

  logout(): void {
    localStorage.removeItem(this.storageKey);
  }
}

export const authService = new AuthService();
