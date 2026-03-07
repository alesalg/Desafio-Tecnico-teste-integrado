import { Component, OnInit } from '@angular/core';
import { Benefit } from '../../models/benefit.model';
import { BenefitService } from '../../services/benefit.service';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmDialogComponent } from '../confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-benefit-list',
  templateUrl: './benefit-list.component.html',
  styleUrls: ['./benefit-list.component.scss']
})
export class BenefitListComponent implements OnInit {
  
  benefits: Benefit[] = [];
  loading = false;
  errorMessage = '';
  showOnlyActive = false;

  constructor(
    private benefitService: BenefitService,
    private router: Router,
    private dialog: MatDialog
  ) { }

  ngOnInit(): void {
    this.loadBenefits();
  }

  loadBenefits(): void {
    this.loading = true;
    this.errorMessage = '';

    const observable = this.showOnlyActive 
      ? this.benefitService.getAllActive()
      : this.benefitService.getAll();

    observable.subscribe({
      next: (data) => {
        this.benefits = data;
        this.loading = false;
      },
      error: (error) => {
        this.errorMessage = error.message;
        this.loading = false;
      }
    });
  }

  toggleOnlyActive(): void {
    this.showOnlyActive = !this.showOnlyActive;
    this.loadBenefits();
  }

  create(): void {
    this.router.navigate(['/beneficios/novo']);
  }

  edit(id: number): void {
    this.router.navigate(['/beneficios/editar', id]);
  }

  transfer(): void {
    this.router.navigate(['/beneficios/transferir']);
  }

  delete(id: number, nome: string): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        title: '',
        message: `Tem certeza que deseja deletar o benefício "${nome}"?`,
        confirmText: 'OK',
        cancelText: 'Cancelar'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.benefitService.delete(id).subscribe({
          next: () => {
            this.loadBenefits();
            this.showSuccessDialog('Benefício deletado com sucesso!');
          },
          error: (error) => {
            this.showErrorDialog(`Erro ao deletar: ${error.message}`);
          }
        });
      }
    });
  }

  private showSuccessDialog(message: string): void {
    this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        title: 'Sucesso',
        message: message,
        confirmText: 'OK',
        cancelText: ''
      }
    });
  }

  private showErrorDialog(message: string): void {
    this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        title: 'Erro',
        message: message,
        confirmText: 'OK',
        cancelText: ''
      }
    });
  }

  formatValue(value: number): string {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  }
}
