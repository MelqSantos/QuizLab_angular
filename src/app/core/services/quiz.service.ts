export interface QuizFilter {
    title?: string;
    class_name?: string;
    theme?: string;
    is_active?: boolean;
    author?: string;
}

// Existing interfaces
export interface Quiz {
    id?: string;
    title: string;
    class_name: string;
    theme: string;
    author?: string;
    is_active?: boolean;
    created_by: string;
    created_at?: Date;
}
import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';

export interface Quiz {
    id?: string;
    title: string;
    class_name: string;
    theme: string;
    author?: string;
    is_active?: boolean;
    created_by: string;
    created_at?: Date;
}

export interface Alternative {
    id?: string;
    text: string;
    is_correct: boolean;
}

export interface Question {
    id?: string;
    statement: string;
    points: number;
    penalty: number;
    alternatives: Alternative[];
}

export interface Answer {
    questionId: string;
    alternativeId: string;
    alternativeText: string;
}

export interface AnswerResult {
    questionId: string;
    alternativeId: string;
    alternativeText: string;
    correct: boolean;
    scoreChange: number;
}

export interface AnswerError {
    questionId: string;
    alternativeId: string;
    error: string;
    status: string;
}

export interface SubmitQuizResult {
    totalScoreChange: number;
    successCount: number;
    errorCount: number;
    answers: AnswerResult[];
    errors?: AnswerError[];
}


@Injectable({
    providedIn: 'root'
})
export class QuizService {

    private API = 'http://localhost:8080/quizzes';

    constructor(private http: HttpClient) { }

    createQuiz(quiz: Quiz): Observable<Quiz> {
        // normalize payload keys to match backend expectations (camelCase for some fields)
        const payload = {
            title: quiz.title,
            className: (quiz as any).className ?? (quiz as any).class_name,
            theme: quiz.theme,
            is_active: (quiz as any).is_active ?? true,
            createdBy: (quiz as any).createdBy ?? (quiz as any).created_by
        };

        return this.http.post<Quiz>(`${this.API}`, payload).pipe(
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
        return this.http.get<Quiz[]>(`${this.API}?createdBy=${userId}`).pipe(
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

    getQuestions(quizId: string): Observable<Question[]> {
        return this.http.get<Question[]>(`${this.API}/${quizId}/questions`).pipe(
            catchError((error: HttpErrorResponse) => {
                let errorMessage = 'Erro ao buscar perguntas.';

                if (error.status === 0) {
                    errorMessage = 'Não foi possível conectar ao servidor.';
                }

                if (error.status === 404) {
                    errorMessage = 'Nenhuma pergunta encontrada.';
                }

                console.error('Get questions error:', error);
                return throwError(() => ({ message: errorMessage, error }));
            })
        );
    }

    saveQuestions(quizId: string, questions: Question[]): Observable<void> {
        const payload = { questions };
        return this.http.patch<void>(`${this.API}/${quizId}/questions`, payload).pipe(
            catchError((error: HttpErrorResponse) => {
                let errorMessage = 'Erro ao salvar perguntas.';

                if (error.status === 0) {
                    errorMessage = 'Não foi possível conectar ao servidor.';
                }

                console.error('Save questions error:', error);
                return throwError(() => ({ message: errorMessage, error }));
            })
        );
    }

    joinQuiz(quizId: string): Observable<{ sessionId: string }> {
        return this.http.post<{ sessionId: string }>(`${this.API}/${quizId}/join`, {}).pipe(
            catchError((error: HttpErrorResponse) => {
                let errorMessage = 'Erro ao participar do quiz.';

                if (error.status === 0) {
                    errorMessage = 'Não foi possível conectar ao servidor.';
                }

                if (error.status === 404) {
                    errorMessage = 'Quiz não encontrado.';
                }

                console.error('Join quiz error:', error);
                return throwError(() => ({ message: errorMessage, error }));
            })
        );
    }

    submitAnswers(quizId: string, answers: Answer[]): Observable<SubmitQuizResult> {
        const payload = { answers };
        return this.http.post<SubmitQuizResult>(`${this.API}/${quizId}/answers`, payload).pipe(
            catchError((error: HttpErrorResponse) => {
                let errorMessage = 'Erro ao submeter respostas.';

                if (error.status === 0) {
                    errorMessage = 'Não foi possível conectar ao servidor.';
                }

                console.error('Submit answers error:', error);
                return throwError(() => ({ message: errorMessage, error }));
            })
        );
    }
}
