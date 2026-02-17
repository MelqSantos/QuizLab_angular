import { Component, OnInit, signal, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDividerModule } from '@angular/material/divider';
import { AuthService } from '../../core/services/auth.service';
import { QuizService, Quiz } from '../../core/services/quiz.service';
import { ToasterService } from '../../shared/services/toaster.service';
import { ToolbarComponent } from '../../shared/components/toolbar/toolbar.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ToolbarComponent,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatSelectModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    MatDividerModule
  ],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  loading = signal(false);
  showCreateForm = signal(false);
  quizzes = signal<Quiz[]>([]);
  isTeacher: boolean = false;
  userId: string | null = '';

  form = this.fb.group({
    title: ['', [Validators.required, Validators.minLength(3)]],
    className: ['', [Validators.required, Validators.minLength(2)]],
    theme: ['', [Validators.required, Validators.minLength(2)]]
  });

  constructor(
    private authService: AuthService,
    private quizService: QuizService,
    private router: Router,
    private fb: FormBuilder,
    private toaster: ToasterService
  ) {}

  ngOnInit() {
    this.isTeacher = this.authService.isTeacher();
    this.userId = this.authService.getUserId();

    if (!this.userId) {
      this.router.navigate(['/login']);
      return;
    }

    if (this.isTeacher) {
      this.loadTeacherQuizzes();
    } else {
      this.loadAllQuizzes();
    }
  }

  get title() {
    return this.form.get('title');
  }

  get className() {
    return this.form.get('className');
  }

  get theme() {
    return this.form.get('theme');
  }

  loadTeacherQuizzes() {
    if (!this.userId) return;

    this.loading.set(true);
    this.quizService.getQuizzesByTeacher(this.userId).subscribe({
      next: (quizzes) => {
        this.quizzes.set(quizzes);
        this.loading.set(false);
      },
      error: () => {
        this.quizzes.set([]);
        this.loading.set(false);
      }
    });
  }

  loadAllQuizzes() {
    this.loading.set(true);
    this.quizService.getAllQuizzes().subscribe({
      next: (quizzes) => {
        this.quizzes.set(quizzes);
        this.loading.set(false);
      },
      error: () => {
        this.quizzes.set([]);
        this.loading.set(false);
      }
    });
  }

  toggleCreateForm() {
    this.showCreateForm.update(value => !value);
    if (this.showCreateForm()) {
      this.form.reset();
    }
  }

  createQuiz() {
    if (this.form.invalid || !this.userId) return;

    this.loading.set(true);

    const { title, className, theme } = this.form.value;

    const newQuiz: Quiz = {
      title: title!,
      className: className!,
      theme: theme!,
      createdBy: this.userId
    };

    this.quizService.createQuiz(newQuiz).subscribe({
      next: (quiz) => {
        this.quizzes.update(quizzes => [quiz, ...quizzes]);
        this.showCreateForm.set(false);
        this.form.reset();
        this.loading.set(false);
        this.toaster.success('Quiz criado com sucesso!');
      },
      error: (err) => {
        this.toaster.error(err.message || 'Erro ao criar quiz');
        this.loading.set(false);
      }
    });
  }

  deleteQuiz(quizId: string | undefined) {
    if (!quizId) return;

    if (!confirm('Tem certeza que deseja deletar este quiz?')) return;

    this.loading.set(true);
    this.quizService.deleteQuiz(quizId).subscribe({
      next: () => {
        this.quizzes.update(quizzes => quizzes.filter(q => q.id !== quizId));
        this.loading.set(false);
        this.toaster.success('Quiz deletado com sucesso!');
      },
      error: (err) => {
        this.toaster.error('Erro ao deletar quiz');
        this.loading.set(false);
      }
    });
  }
}