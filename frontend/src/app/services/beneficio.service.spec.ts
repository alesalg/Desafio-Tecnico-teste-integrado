import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { BenefitService } from './benefit.service';
import { Benefit, BenefitRequest, TransferRequest, TransferResponse } from '../models/benefit.model';

describe('BenefitService', () => {
  let service: BenefitService;
  let httpMock: HttpTestingController;
  const API_URL = 'http://localhost:8080/api/v1/beneficios';

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [BenefitService]
    });
    service = TestBed.inject(BenefitService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getAll', () => {
    it('should return all beneficios', () => {
      const mockBenefits: Benefit[] = [
        { id: 1, nome: 'Beneficio 1', descricao: 'Desc 1', valor: 100, ativo: true, version: 1 },
        { id: 2, nome: 'Beneficio 2', descricao: 'Desc 2', valor: 200, ativo: true, version: 1 }
      ];

      service.getAll().subscribe(benefits => {
        expect(benefits.length).toBe(2);
        expect(benefits).toEqual(mockBenefits);
      });

      const req = httpMock.expectOne(API_URL);
      expect(req.request.method).toBe('GET');
      req.flush(mockBenefits);
    });

    it('should handle error on getAll', () => {
      service.getAll().subscribe({
        next: () => fail('should have failed'),
        error: (error) => {
          expect(error.message).toBeTruthy();
        }
      });

      const req = httpMock.expectOne(API_URL);
      req.flush('Error', { status: 500, statusText: 'Server Error' });
    });
  });

  describe('getAllActive', () => {
    it('should return only active beneficios', () => {
      const mockBenefits: Benefit[] = [
        { id: 1, nome: 'Beneficio 1', descricao: 'Desc 1', valor: 100, ativo: true, version: 1 }
      ];

      service.getAllActive().subscribe(benefits => {
        expect(benefits.length).toBe(1);
        expect(benefits[0].ativo).toBe(true);
      });

      const req = httpMock.expectOne(`${API_URL}/ativos`);
      expect(req.request.method).toBe('GET');
      req.flush(mockBenefits);
    });
  });

  describe('getById', () => {
    it('should return a beneficio by id', () => {
      const mockBenefit: Benefit = {
        id: 1,
        nome: 'Beneficio 1',
        descricao: 'Desc 1',
        valor: 100,
        ativo: true,
        version: 1
      };

      service.getById(1).subscribe(benefit => {
        expect(benefit).toEqual(mockBenefit);
      });

      const req = httpMock.expectOne(`${API_URL}/1`);
      expect(req.request.method).toBe('GET');
      req.flush(mockBenefit);
    });
  });

  describe('create', () => {
    it('should create a new beneficio', () => {
      const request: BenefitRequest = {
        nome: 'Novo Beneficio',
        descricao: 'Nova Desc',
        valor: 150,
        ativo: true
      };

      const mockResponse: Benefit = {
        id: 3,
        ...request,
        version: 1
      };

      service.create(request).subscribe(benefit => {
        expect(benefit).toEqual(mockResponse);
      });

      const req = httpMock.expectOne(API_URL);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(request);
      req.flush(mockResponse);
    });
  });

  describe('update', () => {
    it('should update an existing beneficio', () => {
      const request: BenefitRequest = {
        nome: 'Beneficio Atualizado',
        descricao: 'Desc Atualizada',
        valor: 200,
        ativo: true
      };

      const mockResponse: Benefit = {
        id: 1,
        ...request,
        version: 2
      };

      service.update(1, request).subscribe(benefit => {
        expect(benefit).toEqual(mockResponse);
      });

      const req = httpMock.expectOne(`${API_URL}/1`);
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual(request);
      req.flush(mockResponse);
    });
  });

  describe('delete', () => {
    it('should delete a beneficio', () => {
      service.delete(1).subscribe(response => {
        expect(response).toBeNull();
      });

      const req = httpMock.expectOne(`${API_URL}/1`);
      expect(req.request.method).toBe('DELETE');
      req.flush(null);
    });
  });

  describe('transfer', () => {
    it('should transfer value between beneficios', () => {
      const request: TransferRequest = {
        fromId: 1,
        toId: 2,
        valor: 50
      };

      const mockResponse: TransferResponse = {
        fromId: 1,
        fromNome: 'Beneficio 1',
        fromNovoSaldo: 50,
        toId: 2,
        toNome: 'Beneficio 2',
        toNovoSaldo: 250,
        valorTransferido: 50,
        dataHora: '2026-03-06T10:00:00',
        mensagem: 'Transferência realizada com sucesso'
      };

      service.transfer(request).subscribe(response => {
        expect(response).toEqual(mockResponse);
        expect(response.valorTransferido).toBe(50);
      });

      const req = httpMock.expectOne(`${API_URL}/transfer`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(request);
      req.flush(mockResponse);
    });
  });
});
