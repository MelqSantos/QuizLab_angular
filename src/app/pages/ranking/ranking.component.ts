
import { Component, ChangeDetectionStrategy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ToolbarComponent } from '../../shared/components/toolbar/toolbar.component';
import { inject } from '@angular/core';
import { QuizService, Quiz, RankingAluno } from '../../core/services/quiz.service';

@Component({
  selector: 'app-ranking',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatIconModule,
    MatFormFieldModule,
    MatSelectModule,
    MatProgressSpinnerModule,
    ToolbarComponent
  ],
  templateUrl: './ranking.component.html',
  styleUrls: ['./ranking.component.scss']
})
export class RankingComponent {
  private quizService = inject(QuizService);

  readonly loadingQuizzes = signal(true);
  readonly loadingRanking = signal(false);
  readonly errorQuizzes = signal<string | null>(null);
  readonly errorRanking = signal<string | null>(null);
  readonly quizzes = signal<Quiz[]>([]);
  readonly ranking = signal<RankingAluno[]>([]);
  readonly selectedQuizId = signal<string | null>(null);

  constructor() {
    this.quizService.getAllQuizzes().subscribe({
      next: (data) => {
        this.quizzes.set(data);
        this.loadingQuizzes.set(false);
      },
      error: (err) => {
        this.errorQuizzes.set(err?.message || 'Erro ao carregar quizzes.');
        this.loadingQuizzes.set(false);
      }
    });
  }

  onQuizChange(quizId: string): void {
    this.selectedQuizId.set(quizId);
    this.ranking.set([]);
    this.errorRanking.set(null);
    this.loadingRanking.set(true);

    this.quizService.getRanking(quizId).subscribe({
      next: (data) => {
        this.ranking.set(data);
        this.loadingRanking.set(false);
      },
      error: (err) => {
        this.errorRanking.set(err?.message || 'Erro ao carregar ranking.');
        this.loadingRanking.set(false);
      }
    });
  }
}
