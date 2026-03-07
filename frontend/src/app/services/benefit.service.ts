import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { 
  Benefit, 
  BenefitRequest, 
  TransferRequest, 
  TransferResponse 
} from '../models/benefit.model';

@Injectable({
  providedIn: 'root'
})
export class BenefitService {
  
  private readonly API_URL = 'http://localhost:8080/api/v1/beneficios';

  constructor(private http: HttpClient) { }

  getAll(): Observable<Benefit[]> {
    return this.http.get<Benefit[]>(this.API_URL)
      .pipe(catchError(this.handleError));
  }

  getAllActive(): Observable<Benefit[]> {
    return this.http.get<Benefit[]>(`${this.API_URL}/ativos`)
      .pipe(catchError(this.handleError));
  }

  getById(id: number): Observable<Benefit> {
    return this.http.get<Benefit>(`${this.API_URL}/${id}`)
      .pipe(catchError(this.handleError));
  }

  create(request: BenefitRequest): Observable<Benefit> {
    return this.http.post<Benefit>(this.API_URL, request)
      .pipe(catchError(this.handleError));
  }

  update(id: number, request: BenefitRequest): Observable<Benefit> {
    return this.http.put<Benefit>(`${this.API_URL}/${id}`, request)
      .pipe(catchError(this.handleError));
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/${id}`)
      .pipe(catchError(this.handleError));
  }

  transfer(request: TransferRequest): Observable<TransferResponse> {
    return this.http.post<TransferResponse>(`${this.API_URL}/transferir`, request)
      .pipe(catchError(this.handleError));
  }

  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'Erro desconhecido';
    
    if (error.error instanceof ErrorEvent) {
      errorMessage = `Erro: ${error.error.message}`;
    } else {
      if (error.error && error.error.message) {
        errorMessage = error.error.message;
      } else {
        errorMessage = `Código: ${error.status}\nMensagem: ${error.message}`;
      }
    }
    
    console.error('Erro na requisição:', errorMessage);
    return throwError(() => new Error(errorMessage));
  }
}
