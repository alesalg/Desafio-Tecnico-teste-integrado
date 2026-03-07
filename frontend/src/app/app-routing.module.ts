import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { BenefitListComponent } from './components/benefit-list/benefit-list.component';
import { BenefitFormComponent } from './components/benefit-form/benefit-form.component';
import { TransferComponent } from './components/transfer/transfer.component';

const routes: Routes = [
  { path: '', redirectTo: '/beneficios', pathMatch: 'full' },
  { path: 'beneficios', component: BenefitListComponent },
  { path: 'beneficios/novo', component: BenefitFormComponent },
  { path: 'beneficios/editar/:id', component: BenefitFormComponent },
  { path: 'beneficios/transferir', component: TransferComponent },
  { path: '**', redirectTo: '/beneficios' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
