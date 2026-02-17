import { Component, OnInit, ChangeDetectionStrategy, signal, ChangeDetectorRef } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, FormArray, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatSelectModule } from '@angular/material/select';
import { ToolbarComponent } from '../../../shared/components/toolbar/toolbar.component';
import { QuizService } from '../../../core/services/quiz.service';
import { ToasterService } from '../../../shared/services/toaster.service';

export interface Alternative {
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

@Component({
    selector: 'app-quiz-questions',
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
        MatDividerModule,
        MatSelectModule
    ],
    templateUrl: './questions.component.html',
    styleUrls: ['./questions.component.scss']
})
export class QuestionsComponent implements OnInit {
    loading = signal(false);
    quizId = '';
    minQuestions = 3;
    maxQuestions = 5;
    isReadOnly = signal(false);
    noQuestions = signal(false);

    form = this.fb.group({
        questions: this.fb.array([])
    });

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private fb: FormBuilder,
        private quizService: QuizService,
        private toaster: ToasterService,
        private cd: ChangeDetectorRef,
        private location: Location
    ) { }

    ngOnInit() {
        this.quizId = this.route.snapshot.paramMap.get('id') || '';
        const mode = this.route.snapshot.queryParamMap.get('mode');
        this.isReadOnly.set(mode === 'view');

        if (!this.quizId) {
            this.toaster.error('Quiz inválido');
            this.router.navigate(['/dashboard']);
            return;
        }

        this.loadQuestions();
    }

    get questionsArray(): FormArray {
        return this.form.get('questions') as FormArray;
    }

    getQuestionGroup(index: number): FormGroup {
        return this.questionsArray.at(index) as FormGroup;
    }

    getAlternativesArray(index: number): FormArray {
        return this.getQuestionGroup(index).get('alternatives') as FormArray;
    }

    private createQuestionGroup(q?: Question) {
        const group = this.fb.group({
            id: [q?.id || null],
            statement: [q?.statement || '', [Validators.required, Validators.minLength(5)]],
            points: [q?.points ?? 10, [Validators.required, Validators.min(1)]],
            penalty: [q?.penalty ?? 0, [Validators.required, Validators.min(0)]],
            alternatives: this.fb.array((q?.alternatives || []).map(a => this.fb.group({
                text: [a.text || '', Validators.required],
                is_correct: [!!a.is_correct]
            })))
        });

        // ensure at least 3 alternatives
        const altArray = group.get('alternatives') as FormArray;
        while (altArray.length < 3) {
            altArray.push(this.fb.group({ text: ['', Validators.required], is_correct: [false] }));
        }

        return group;
    }

    loadQuestions() {
        this.loading.set(true);
        this.quizService.getQuestions(this.quizId).subscribe({
            next: (questions) => {
                this.questionsArray.clear();
                // cap at maxQuestions
                const list = questions.slice(0, this.maxQuestions);
                if (list.length === 0 && this.isReadOnly()) {
                    // no questions and readonly -> show message
                    this.noQuestions.set(true);
                } else {
                    this.noQuestions.set(false);
                    for (const q of list) {
                        this.questionsArray.push(this.createQuestionGroup(q));
                    }

                    // ensure minimum number of question slots (only for edit)
                    if (!this.isReadOnly()) {
                        while (this.questionsArray.length < this.minQuestions) {
                            this.questionsArray.push(this.createQuestionGroup());
                        }
                    }
                }

                // disable form in read-only mode
                if (this.isReadOnly()) {
                    this.form.disable();
                } else {
                    this.form.enable();
                }

                this.loading.set(false);
            },
            error: (err) => {
                // if no questions exist
                this.questionsArray.clear();
                if (this.isReadOnly()) {
                    this.noQuestions.set(true);
                } else {
                    this.noQuestions.set(false);
                    for (let i = 0; i < this.minQuestions; i++) {
                        this.questionsArray.push(this.createQuestionGroup());
                    }
                }
                // ensure form disabled if readonly
                if (this.isReadOnly()) {
                    this.form.disable();
                } else {
                    this.form.enable();
                }
                this.loading.set(false);
            }
        });
    }

    addQuestion() {
        if (this.questionsArray.length >= this.maxQuestions) return;
        this.questionsArray.push(this.createQuestionGroup());
    }

    removeQuestion(index: number) {
        if (this.questionsArray.length <= this.minQuestions) {
            this.toaster.warning(`O quiz precisa ter ao menos ${this.minQuestions} perguntas.`);
            return;
        }
        this.questionsArray.removeAt(index);
    }

    addAlternative(qIndex: number) {
        const altArray = this.questionsArray.at(qIndex).get('alternatives') as FormArray;
        if (altArray.length >= 5) return;
        altArray.push(this.fb.group({ text: ['', Validators.required], is_correct: [false] }));
    }

    removeAlternative(qIndex: number, aIndex: number) {
        const altArray = this.questionsArray.at(qIndex).get('alternatives') as FormArray;
        if (altArray.length <= 2) return; // minimum 2 alternatives
        altArray.removeAt(aIndex);
    }

    setCorrectAlternative(qIndex: number, aIndex: number) {
        const altArray = this.questionsArray.at(qIndex).get('alternatives') as FormArray;
        const current = altArray.at(aIndex).get('is_correct')?.value;
        if (current) {
            // if already selected, unselect all
            altArray.controls.forEach((ctrl) => ctrl.get('is_correct')!.setValue(false, { emitEvent: true }));
        } else {
            // select only the clicked one
            altArray.controls.forEach((ctrl, idx) => ctrl.get('is_correct')!.setValue(idx === aIndex, { emitEvent: true }));
        }
        // ensure view updates under OnPush
        this.cd.markForCheck();
    }

    saveAll() {
        if (this.form.invalid) {
            this.toaster.error('Preencha corretamente todas as perguntas e alternativas.');
            return;
        }

        const payload: Question[] = this.questionsArray.controls.map(g => ({
            id: g.get('id')?.value,
            statement: g.get('statement')?.value,
            points: g.get('points')?.value,
            penalty: g.get('penalty')?.value,
            alternatives: (g.get('alternatives') as FormArray).controls.map(a => ({
                text: a.get('text')?.value,
                is_correct: !!a.get('is_correct')?.value
            }))
        }));

        this.loading.set(true);

        // send as bulk update if endpoint exists, otherwise POST/PUT per question
        this.quizService.saveQuestions(this.quizId, payload).subscribe({
            next: () => {
                this.toaster.success('Perguntas salvas com sucesso!');
                this.loading.set(false);
                this.router.navigate(['/dashboard']);
            },
            error: (err) => {
                this.toaster.error(err?.message || 'Erro ao salvar perguntas');
                this.loading.set(false);
            }
        });
    }

    goBack() {
        this.location.back();
    }
}
