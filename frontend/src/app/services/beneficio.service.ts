import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { 
  Beneficio, 
  BeneficioRequest, 
  TransferenciaRequest, 
  TransferenciaResponse 
} from '../models/beneficio.model';

@Injectable({
  providedIn: 'root'
})
export class BeneficioService {
  
  private readonly API_URL = 'http://localhost:8080/api/v1/beneficios';

  constructor(private http: HttpClient) { }

  getAll(): Observable<Beneficio[]> {
    return this.http.get<Beneficio[]>(this.API_URL)
      .pipe(catchError(this.handleError));
  }

  getAllAtivos(): Observable<Beneficio[]> {
    return this.http.get<Beneficio[]>(`${this.API_URL}/ativos`)
      .pipe(catchError(this.handleError));
  }

  getById(id: number): Observable<Beneficio> {
    return this.http.get<Beneficio>(`${this.API_URL}/${id}`)
      .pipe(catchError(this.handleError));
  }

  create(request: BeneficioRequest): Observable<Beneficio> {
    return this.http.post<Beneficio>(this.API_URL, request)
      .pipe(catchError(this.handleError));
  }

  update(id: number, request: BeneficioRequest): Observable<Beneficio> {
    return this.http.put<Beneficio>(`${this.API_URL}/${id}`, request)
      .pipe(catchError(this.handleError));
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/${id}`)
      .pipe(catchError(this.handleError));
  }

  transferir(request: TransferenciaRequest): Observable<TransferenciaResponse> {
    return this.http.post<TransferenciaResponse>(`${this.API_URL}/transferir`, request)
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
