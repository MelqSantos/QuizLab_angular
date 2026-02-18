import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, tap, catchError, throwError } from 'rxjs';

interface LoginResponse {
  token: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: 'ALUNO' | 'PROFESSOR';
  };
}

interface SignupRequest {
  name: string;
  email: string;
  password: string;
  role: 'ALUNO' | 'PROFESSOR';
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private API = 'http://localhost:8080/users';

  constructor(private http: HttpClient) {}

  login(email: string, password: string): Observable<LoginResponse> {

    return this.http.post<LoginResponse>(`${this.API}/login`, {
      email,
      password
    }).pipe(

      tap(response => {
        document.cookie = `token=${response.token}; path=/;`;
        document.cookie = `userId=${response.user.id}; path=/;`;
        document.cookie = `role=${response.user.role}; path=/;`;
        document.cookie = `name=${response.user.name}; path=/;`;
      }),

      catchError((error: HttpErrorResponse) => {
        let errorMessage = 'Erro inesperado. Tente novamente.';

        if (error.status === 0) {
          errorMessage = 'Não foi possível conectar ao servidor.';
        }

        if (error.status === 401) {
          errorMessage = 'Email ou senha inválidos.';
        }

        if (error.status === 500) {
          errorMessage = 'Erro interno do servidor.';
        }

        console.error('Login error:', error);
        return throwError(() => new Error(errorMessage));
      })
    );
  }

  signup(data: SignupRequest): Observable<LoginResponse> {

    return this.http.post<LoginResponse>(`${this.API}`, data).pipe(

      tap(response => {
        if (response?.token) {
          document.cookie = `token=${response.token}; path=/;`;
          document.cookie = `userId=${response.user.id}; path=/;`;
          document.cookie = `role=${response.user.role}; path=/;`;
          document.cookie = `name=${response.user.name}; path=/;`;
        }
      }),

      catchError((error: HttpErrorResponse) => {
        let errorMessage = 'Erro inesperado. Tente novamente.';

        if (error.status === 0) {
          errorMessage = 'Não foi possível conectar ao servidor.';
        }

        if (error.status === 400) {
          errorMessage = error.error?.message || 'Dados inválidos. Verifique os campos.';
        }

        if (error.status === 409) {
          errorMessage = 'Email já cadastrado. Tente outro.';
        }

        if (error.status === 500) {
          errorMessage = 'Erro interno do servidor.';
        }

        console.error('Signup error:', error);
        return throwError(() => new Error(errorMessage));
      })
    );
  }

  getToken(): string | null {
    const match = document.cookie.match(/(^| )token=([^;]+)/);
    return match ? match[2] : null;
  }

  getUserId(): string | null {
    const match = document.cookie.match(/(^| )userId=([^;]+)/);
    return match ? match[2] : null;
  }

  getRole(): string | null {
    const match = document.cookie.match(/(^| )role=([^;]+)/);
    return match ? match[2] : null;
  }

  getName(): string | null {
    const match = document.cookie.match(/(^| )name=([^;]+)/);
    return match ? match[2] : null;
  }

  isTeacher(): boolean {
    return this.getRole() === 'PROFESSOR';
  }

  isStudent(): boolean {
    return this.getRole() === 'ALUNO';
  }

  logout() {
    document.cookie = 'token=; Max-Age=0; path=/;';
    document.cookie = 'userId=; Max-Age=0; path=/;';
    document.cookie = 'role=; Max-Age=0; path=/;';
    document.cookie = 'name=; Max-Age=0; path=/;';
  }
}