import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { Benefit } from '../../models/benefit.model';
import { BenefitService } from '../../services/benefit.service';
import { ConfirmDialogComponent } from '../confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-transfer',
  templateUrl: './transfer.component.html',
  styleUrls: ['./transfer.component.scss']
})
export class TransferComponent implements OnInit {
  
  form!: FormGroup;
  benefits: Benefit[] = [];
  loading = false;
  errorMessage = '';
  successMessage = '';
  fromBenefit?: Benefit;
  toBenefit?: Benefit;

  constructor(
    private fb: FormBuilder,
    private benefitService: BenefitService,
    private router: Router,
    private dialog: MatDialog
  ) { }

  ngOnInit(): void {
    this.initForm();
    this.loadBenefits();
  }

  initForm(): void {
    this.form = this.fb.group({
      fromId: ['', Validators.required],
      toId: ['', Validators.required],
      valor: ['', [Validators.required, Validators.min(0.01)]]
    });
  }

  loadBenefits(): void {
    this.benefitService.getAllActive().subscribe({
      next: (data) => {
        this.benefits = data;
      },
      error: (error) => {
        this.errorMessage = error.message;
      }
    });
  }

  onFromChange(): void {
    const fromId = this.form.get('fromId')?.value;
    this.fromBenefit = this.benefits.find(b => b.id === Number(fromId));
  }

  onToChange(): void {
    const toId = this.form.get('toId')?.value;
    this.toBenefit = this.benefits.find(b => b.id === Number(toId));
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

      this.benefitService.transfer(request).subscribe({
        next: (response) => {
          this.loading = false;
          
          const dialogRef = this.dialog.open(ConfirmDialogComponent, {
            width: '400px',
            data: {
              title: 'Sucesso',
              message: response.mensagem,
              confirmText: 'OK',
              cancelText: ''
            }
          });

          dialogRef.afterClosed().subscribe(() => {
            this.router.navigate(['/beneficios']);
          });
        },
        error: (error) => {
          this.loading = false;
          
          this.dialog.open(ConfirmDialogComponent, {
            width: '400px',
            data: {
              title: 'Erro',
              message: error.message,
              confirmText: 'OK',
              cancelText: ''
            }
          });
        }
      });
    }
  }

  cancel(): void {
    this.router.navigate(['/beneficios']);
  }

  formatValue(value: number): string {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  }

  sameIds(): boolean {
    const fromId = this.form.get('fromId')?.value;
    const toId = this.form.get('toId')?.value;
    return fromId && toId && fromId === toId;
  }

  valueExceedsBalance(): boolean {
    if (!this.fromBenefit) return false;
    const value = this.form.get('valor')?.value;
    return value && value > this.fromBenefit.valor;
  }
}
