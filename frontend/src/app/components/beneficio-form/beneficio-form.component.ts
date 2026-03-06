import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { BeneficioService } from '../../services/beneficio.service';

@Component({
  selector: 'app-beneficio-form',
  templateUrl: './beneficio-form.component.html',
  styleUrls: ['./beneficio-form.component.scss']
})
export class BeneficioFormComponent implements OnInit {
  
  form!: FormGroup;
  isEditMode = false;
  beneficioId?: number;
  loading = false;
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private beneficioService: BeneficioService,
    private router: Router,
    private route: ActivatedRoute
  ) { }

  ngOnInit(): void {
    this.initForm();
    
    this.beneficioId = Number(this.route.snapshot.paramMap.get('id'));
    if (this.beneficioId) {
      this.isEditMode = true;
      this.loadBeneficio();
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

  loadBeneficio(): void {
    if (this.beneficioId) {
      this.loading = true;
      this.beneficioService.getById(this.beneficioId).subscribe({
        next: (beneficio) => {
          this.form.patchValue(beneficio);
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
      
      const observable = this.isEditMode && this.beneficioId
        ? this.beneficioService.update(this.beneficioId, request)
        : this.beneficioService.create(request);

      observable.subscribe({
        next: () => {
          alert(`Benefício ${this.isEditMode ? 'atualizado' : 'criado'} com sucesso!`);
          this.router.navigate(['/beneficios']);
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
