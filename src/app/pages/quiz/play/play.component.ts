import { Component, OnInit, ChangeDetectionStrategy, signal, ChangeDetectorRef } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatRadioModule } from '@angular/material/radio';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { ToolbarComponent } from '../../../shared/components/toolbar/toolbar.component';
import { QuizService, Question, SubmitQuizResult } from '../../../core/services/quiz.service';
import { ToasterService } from '../../../shared/services/toaster.service';

interface QuizPlayState {
    currentQuestionIndex: number;
    answers: { [questionId: string]: { alternativeId: string; alternativeText: string } };
    showResult: boolean;
    resultAnimationState: 'none' | 'correct' | 'incorrect';
}

@Component({
    selector: 'app-quiz-play',
    standalone: true,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        ToolbarComponent,
        MatCardModule,
        MatFormFieldModule,
        MatRadioModule,
        MatButtonModule,
        MatIconModule,
        MatProgressBarModule
    ],
    templateUrl: './play.component.html',
    styleUrls: ['./play.component.scss']
})
export class QuizPlayComponent implements OnInit {
    loading = signal(false);
    quizId = '';
    quizTitle = '';
    questions = signal<Question[]>([]);
    playState = signal<QuizPlayState>({
        currentQuestionIndex: 0,
        answers: {},
        showResult: false,
        resultAnimationState: 'none'
    });
    quizCompleted = signal(false);
    finalResult = signal<SubmitQuizResult | null>(null);

    form!: FormGroup;

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private fb: FormBuilder,
        private quizService: QuizService,
        private toaster: ToasterService,
        private cd: ChangeDetectorRef,
        private location: Location
    ) {}

    ngOnInit() {
        this.quizId = this.route.snapshot.paramMap.get('id') || '';
        if (!this.quizId) {
            this.toaster.error('Quiz inválido');
            this.router.navigate(['/dashboard']);
            return;
        }

        this.loadQuiz();
    }

    loadQuiz() {
        this.loading.set(true);
        this.quizService.getQuestions(this.quizId).subscribe({
            next: (questions) => {
                this.questions.set(questions);
                this.initForm();
                this.loading.set(false);
            },
            error: (err) => {
                this.toaster.error(err?.message || 'Erro ao carregar quiz');
                this.loading.set(false);
                this.location.back();
            }
        });
    }

    private initForm() {
        this.form = this.fb.group({
            answer: ['', Validators.required]
        });
    }

    get currentQuestion(): Question | null {
        const questions = this.questions();
        const state = this.playState();
        if (state.currentQuestionIndex < questions.length) {
            return questions[state.currentQuestionIndex];
        }
        return null;
    }

    selectAnswer(alternativeId: string, text: string) {
        const question = this.currentQuestion;
        if (!question || !question.id) return;

        // update answers
        const newAnswers = { ...this.playState().answers };
        newAnswers[question.id] = { alternativeId, alternativeText: text };

        // check if correct
        const isCorrect = question.alternatives.some(alt => alt.text === text && alt.is_correct);
        
        // show animation
        this.playState.update(state => ({
            ...state,
            answers: newAnswers,
            showResult: true,
            resultAnimationState: isCorrect ? 'correct' : 'incorrect'
        }));

        // trigger animation
        this.cd.markForCheck();

        // auto-advance after 1.5s
        setTimeout(() => {
            this.playState.update(state => ({
                ...state,
                showResult: false,
                resultAnimationState: 'none'
            }));
            this.nextQuestion();
        }, 1500);
    }

    nextQuestion() {
        const state = this.playState();
        const questions = this.questions();

        if (state.currentQuestionIndex < questions.length - 1) {
            this.playState.update(s => ({
                ...s,
                currentQuestionIndex: s.currentQuestionIndex + 1
            }));
            this.form.reset();
        } else {
            this.submitQuiz();
        }
    }

    goBack() {
        this.location.back();
    }

    submitQuiz() {
        const state = this.playState();
        const questions = this.questions();

        // convert answers to format expected by backend
        const answersPayload = questions
            .filter(q => q.id && state.answers[q.id])
            .map(q => ({
                questionId: q.id!,
                alternativeId: state.answers[q.id!].alternativeId,
                alternativeText: state.answers[q.id!].alternativeText
            }));

        this.loading.set(true);
        this.quizService.submitAnswers(this.quizId, answersPayload).subscribe({
            next: (result) => {
                // Show errors if they exist
                if (result.errors && result.errors.length > 0) {
                    // Show summary toast
                    this.toaster.warning(
                        `${result.errorCount} erros encontrados durante a submissão.`
                    );

                    // Show individual error toasts
                    result.errors.forEach(error => {
                        this.toaster.error(`${error.error} (Status: ${error.status})`);
                    });
                }

                // Show success message if there are correct answers
                if (result.successCount > 0) {
                    this.toaster.success(
                        `${result.successCount} resposta(s) processada(s) com sucesso!`
                    );
                }

                this.quizCompleted.set(true);
                this.finalResult.set(result);
                this.loading.set(false);
            },
            error: (err) => {
                this.toaster.error(err?.message || 'Erro ao submeter respostas');
                this.loading.set(false);
            }
        });
    }

    progressPercentage(): number {
        const state = this.playState();
        const questions = this.questions();
        return (state.currentQuestionIndex / questions.length) * 100;
    }

    getCorrectAnswersCount(): number {
        const result = this.finalResult();
        if (!result) return 0;
        return result.answers.filter(a => a.correct).length;
    }

    getTotalAnswersCount(): number {
        const result = this.finalResult();
        if (!result) return 0;
        return result.answers.length;
    }

    getPercentage(): number {
        const total = this.getTotalAnswersCount();
        const correct = this.getCorrectAnswersCount();
        if (total === 0) return 0;
        return (correct / total) * 100;
    }
}
