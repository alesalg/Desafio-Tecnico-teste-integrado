import { Component, OnInit } from '@angular/core';
import { Beneficio } from '../../models/beneficio.model';
import { BeneficioService } from '../../services/beneficio.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-beneficio-list',
  templateUrl: './beneficio-list.component.html',
  styleUrls: ['./beneficio-list.component.scss']
})
export class BeneficioListComponent implements OnInit {
  
  beneficios: Beneficio[] = [];
  loading = false;
  errorMessage = '';
  showApenasAtivos = false;

  constructor(
    private beneficioService: BeneficioService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.loadBeneficios();
  }

  loadBeneficios(): void {
    this.loading = true;
    this.errorMessage = '';

    const observable = this.showApenasAtivos 
      ? this.beneficioService.getAllAtivos()
      : this.beneficioService.getAll();

    observable.subscribe({
      next: (data) => {
        this.beneficios = data;
        this.loading = false;
      },
      error: (error) => {
        this.errorMessage = error.message;
        this.loading = false;
      }
    });
  }

  toggleApenasAtivos(): void {
    this.showApenasAtivos = !this.showApenasAtivos;
    this.loadBeneficios();
  }

  criar(): void {
    this.router.navigate(['/beneficios/novo']);
  }

  editar(id: number): void {
    this.router.navigate(['/beneficios/editar', id]);
  }

  transferir(): void {
    this.router.navigate(['/beneficios/transferir']);
  }

  deletar(id: number, nome: string): void {
    if (confirm(`Tem certeza que deseja deletar o benefício "${nome}"?`)) {
      this.beneficioService.delete(id).subscribe({
        next: () => {
          this.loadBeneficios();
          alert('Benefício deletado com sucesso!');
        },
        error: (error) => {
          alert(`Erro ao deletar: ${error.message}`);
        }
      });
    }
  }

  formatarValor(valor: number): string {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(valor);
  }
}
