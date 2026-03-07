import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { ReactiveFormsModule } from '@angular/forms';
import { MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BenefitListComponent } from './components/benefit-list/benefit-list.component';
import { BenefitFormComponent } from './components/benefit-form/benefit-form.component';
import { TransferComponent } from './components/transfer/transfer.component';
import { ConfirmDialogComponent } from './components/confirm-dialog/confirm-dialog.component';

@NgModule({
  declarations: [
    AppComponent,
    BenefitListComponent,
    BenefitFormComponent,
    TransferComponent,
    ConfirmDialogComponent
  ],
  imports: [
    BrowserModule,
    CommonModule,
    BrowserAnimationsModule,
    AppRoutingModule,
    HttpClientModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
