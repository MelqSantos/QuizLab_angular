import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';

export interface Quiz {
  id?: string;
  title: string;
  className: string;
  theme: string;
  createdBy: string;
  createdAt?: Date;
}

@Injectable({
  providedIn: 'root'
})
export class QuizService {

  private API = 'http://localhost:8080/quizzes';

  constructor(private http: HttpClient) {}

  createQuiz(quiz: Quiz): Observable<Quiz> {
    return this.http.post<Quiz>(`${this.API}`, quiz).pipe(
      catchError((error: HttpErrorResponse) => {
        let errorMessage = 'Erro ao criar quiz.';

        if (error.status === 0) {
          errorMessage = 'Não foi possível conectar ao servidor.';
        }

        if (error.status === 400) {
          errorMessage = error.error?.message || 'Dados inválidos.';
        }

        if (error.status === 401) {
          errorMessage = 'Você não tem permissão para criar quizzes.';
        }

        if (error.status === 500) {
          errorMessage = 'Erro interno do servidor.';
        }

        console.error('Create quiz error:', error);
        return throwError(() => ({ message: errorMessage, error }));
      })
    );
  }

  getQuizzesByTeacher(userId: string): Observable<Quiz[]> {
    return this.http.get<Quiz[]>(`${this.API}`).pipe(
      catchError((error: HttpErrorResponse) => {
        let errorMessage = 'Erro ao buscar quizzes.';

        if (error.status === 0) {
          errorMessage = 'Não foi possível conectar ao servidor.';
        }

        if (error.status === 404) {
          errorMessage = 'Nenhum quiz encontrado.';
        }

        console.error('Get quizzes error:', error);
        return throwError(() => ({ message: errorMessage, error }));
      })
    );
  }

  getAllQuizzes(): Observable<Quiz[]> {
    return this.http.get<Quiz[]>(`${this.API}`).pipe(
      catchError((error: HttpErrorResponse) => {
        let errorMessage = 'Erro ao buscar quizzes.';

        if (error.status === 0) {
          errorMessage = 'Não foi possível conectar ao servidor.';
        }

        console.error('Get all quizzes error:', error);
        return throwError(() => ({ message: errorMessage, error }));
      })
    );
  }

  deleteQuiz(quizId: string): Observable<void> {
    return this.http.delete<void>(`${this.API}/${quizId}`).pipe(
      catchError((error: HttpErrorResponse) => {
        let errorMessage = 'Erro ao deletar quiz.';

        if (error.status === 0) {
          errorMessage = 'Não foi possível conectar ao servidor.';
        }

        if (error.status === 404) {
          errorMessage = 'Quiz não encontrado.';
        }

        console.error('Delete quiz error:', error);
        return throwError(() => ({ message: errorMessage, error }));
      })
    );
  }
}
