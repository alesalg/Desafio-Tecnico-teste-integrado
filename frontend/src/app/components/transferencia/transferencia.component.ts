import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Beneficio } from '../../models/beneficio.model';
import { BeneficioService } from '../../services/beneficio.service';

@Component({
  selector: 'app-transferencia',
  templateUrl: './transferencia.component.html',
  styleUrls: ['./transferencia.component.scss']
})
export class TransferenciaComponent implements OnInit {
  
  form!: FormGroup;
  beneficios: Beneficio[] = [];
  loading = false;
  errorMessage = '';
  successMessage = '';
  fromBeneficio?: Beneficio;
  toBeneficio?: Beneficio;

  constructor(
    private fb: FormBuilder,
    private beneficioService: BeneficioService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.initForm();
    this.loadBeneficios();
  }

  initForm(): void {
    this.form = this.fb.group({
      fromId: ['', Validators.required],
      toId: ['', Validators.required],
      valor: ['', [Validators.required, Validators.min(0.01)]]
    });
  }

  loadBeneficios(): void {
    this.beneficioService.getAllAtivos().subscribe({
      next: (data) => {
        this.beneficios = data;
      },
      error: (error) => {
        this.errorMessage = error.message;
      }
    });
  }

  onFromChange(): void {
    const fromId = this.form.get('fromId')?.value;
    this.fromBeneficio = this.beneficios.find(b => b.id === Number(fromId));
  }

  onToChange(): void {
    const toId = this.form.get('toId')?.value;
    this.toBeneficio = this.beneficios.find(b => b.id === Number(toId));
  }

  onSubmit(): void {
    if (this.form.valid) {
      this.loading = true;
      this.errorMessage = '';
      this.successMessage = '';

      const request = {
        fromId: Number(this.form.value.fromId),
        toId: Number(this.form.value.toId),
        valor: Number(this.form.value.valor)
      };

      this.beneficioService.transferir(request).subscribe({
        next: (response) => {
          this.successMessage = response.mensagem;
          this.loading = false;
          
          setTimeout(() => {
            this.router.navigate(['/beneficios']);
          }, 2000);
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

  formatarValor(valor: number): string {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(valor);
  }

  idsIguais(): boolean {
    const fromId = this.form.get('fromId')?.value;
    const toId = this.form.get('toId')?.value;
    return fromId && toId && fromId === toId;
  }

  valorExcedeSaldo(): boolean {
    if (!this.fromBeneficio) return false;
    const valor = this.form.get('valor')?.value;
    return valor && valor > this.fromBeneficio.valor;
  }
}
