import { Routes } from '@angular/router';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { LoginComponent } from './pages/login/login/login.component';
import { SignupComponent } from './pages/login/signup/signup.component';
import { RankingComponent } from './pages/ranking/ranking.component';
import { QuestionsComponent } from './pages/quiz/questions/questions.component';
import { QuizPlayComponent } from './pages/quiz/play/play.component';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'signup', component: SignupComponent },
  { path: 'dashboard', component: DashboardComponent },
  { path: 'quiz/:id/questions', component: QuestionsComponent },
  { path: 'quiz/:id/play', component: QuizPlayComponent },
  { path: 'ranking', component: RankingComponent }
];