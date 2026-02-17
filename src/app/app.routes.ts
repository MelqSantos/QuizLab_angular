import { Routes } from '@angular/router';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { LoginComponent } from './pages/login/login/login.component';
import { SignupComponent } from './pages/login/signup/signup.component';
import { RankingComponent } from './pages/ranking/ranking.component';
import { QuestionsComponent } from './pages/quiz/questions/questions.component';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'signup', component: SignupComponent },
  { path: 'dashboard', component: DashboardComponent },
  { path: 'quiz/:id/questions', component: QuestionsComponent },
  { path: 'ranking', component: RankingComponent }
];