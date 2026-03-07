import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { BenefitService } from '../../services/benefit.service';
import { ConfirmDialogComponent } from '../confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-benefit-form',
  templateUrl: './benefit-form.component.html',
  styleUrls: ['./benefit-form.component.scss']
})
export class BenefitFormComponent implements OnInit {
  
  form!: FormGroup;
  isEditMode = false;
  benefitId?: number;
  loading = false;
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private benefitService: BenefitService,
    private router: Router,
    private route: ActivatedRoute,
    private dialog: MatDialog
  ) { }

  ngOnInit(): void {
    this.initForm();
    
    this.benefitId = Number(this.route.snapshot.paramMap.get('id'));
    if (this.benefitId) {
      this.isEditMode = true;
      this.loadBenefit();
    }
  }

  initForm(): void {
    this.form = this.fb.group({
      nome: ['', [Validators.required, Validators.maxLength(100)]],
      descricao: ['', Validators.maxLength(255)],
      valor: ['', [Validators.required, Validators.min(0.01)]],
      ativo: [true]
    });
  }

  loadBenefit(): void {
    if (this.benefitId) {
      this.loading = true;
      this.benefitService.getById(this.benefitId).subscribe({
        next: (benefit) => {
          this.form.patchValue(benefit);
          this.loading = false;
        },
        error: (error) => {
          this.errorMessage = error.message;
          this.loading = false;
        }
      });
    }
  }

  onSubmit(): void {
    if (this.form.valid) {
      this.loading = true;
      this.errorMessage = '';
      
      const request = this.form.value;
      
      const observable = this.isEditMode && this.benefitId
        ? this.benefitService.update(this.benefitId, request)
        : this.benefitService.create(request);

      observable.subscribe({
        next: () => {
          const dialogRef = this.dialog.open(ConfirmDialogComponent, {
            width: '400px',
            data: {
              title: 'Sucesso',
              message: `Benefício ${this.isEditMode ? 'atualizado' : 'criado'} com sucesso!`,
              confirmText: 'OK',
              cancelText: ''
            }
          });

          dialogRef.afterClosed().subscribe(() => {
            this.router.navigate(['/beneficios']);
          });
        },
        error: (error) => {
          this.errorMessage = error.message;
          this.loading = false;
        }
      });
    }
  }

  cancel(): void {
    this.router.navigate(['/beneficios']);
  }

  hasError(fieldName: string, errorType: string): boolean {
    const field = this.form.get(fieldName);
    return !!(field && field.hasError(errorType) && (field.dirty || field.touched));
  }
}
