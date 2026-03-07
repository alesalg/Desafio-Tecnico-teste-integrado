import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { TransferComponent } from './transfer.component';
import { BenefitService } from '../../services/benefit.service';
import { Benefit, TransferResponse } from '../../models/benefit.model';

describe('TransferComponent', () => {
  let component: TransferComponent;
  let fixture: ComponentFixture<TransferComponent>;
  let mockBenefitService: jasmine.SpyObj<BenefitService>;
  let mockRouter: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    mockBenefitService = jasmine.createSpyObj('BenefitService', ['getAllActive', 'transfer']);
    mockRouter = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      declarations: [TransferComponent],
      imports: [ReactiveFormsModule],
      providers: [
        { provide: BenefitService, useValue: mockBenefitService },
        { provide: Router, useValue: mockRouter }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(TransferComponent);
    component = fixture.componentInstance;

    mockBenefitService.getAllActive.and.returnValue(of([]));
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize form with empty values', () => {
    mockBenefitService.getAllActive.and.returnValue(of([]));
    fixture.detectChanges();
    expect(component.form).toBeDefined();
    expect(component.form.get('fromId')?.value).toBe('');
    expect(component.form.get('toId')?.value).toBe('');
    expect(component.form.get('valor')?.value).toBe('');
  });

  it('should load active beneficios on init', () => {
    const mockBenefits: Benefit[] = [
      { id: 1, nome: 'Beneficio 1', descricao: 'Desc 1', valor: 100, ativo: true, version: 1 },
      { id: 2, nome: 'Beneficio 2', descricao: 'Desc 2', valor: 200, ativo: true, version: 1 }
    ];

    mockBenefitService.getAllActive.and.returnValue(of(mockBenefits));

    fixture.detectChanges();

    expect(mockBenefitService.getAllActive).toHaveBeenCalled();
    expect(component.benefits).toEqual(mockBenefits);
  });

  it('should handle error when loading beneficios', () => {
    mockBenefitService.getAllActive.and.returnValue(throwError(() => new Error('Erro ao carregar')));

    fixture.detectChanges();

    expect(component.errorMessage).toBe('Erro ao carregar');
  });

  it('should validate required fields', () => {
    mockBenefitService.getAllActive.and.returnValue(of([]));
    fixture.detectChanges();
    
    expect(component.form.valid).toBeFalsy();

    component.form.patchValue({
      fromId: 1,
      toId: 2,
      valor: 50
    });

    expect(component.form.valid).toBeTruthy();
  });

  it('should validate minimum value', () => {
    mockBenefitService.getAllActive.and.returnValue(of([]));
    fixture.detectChanges();
    const valorControl = component.form.get('valor');

    valorControl?.setValue(0);
    expect(valorControl?.hasError('min')).toBeTruthy();

    valorControl?.setValue(0.01);
    expect(valorControl?.hasError('min')).toBeFalsy();
  });

  it('should update fromBenefit on selection change', () => {
    const mockBenefits: Benefit[] = [
      { id: 1, nome: 'Beneficio 1', descricao: 'Desc 1', valor: 100, ativo: true, version: 1 },
      { id: 2, nome: 'Beneficio 2', descricao: 'Desc 2', valor: 200, ativo: true, version: 1 }
    ];

    mockBenefitService.getAllActive.and.returnValue(of(mockBenefits));
    fixture.detectChanges();

    component.form.get('fromId')?.setValue('1');
    component.onFromChange();

    expect(component.fromBenefit).toEqual(mockBenefits[0]);
  });

  it('should update toBenefit on selection change', () => {
    const mockBenefits: Benefit[] = [
      { id: 1, nome: 'Beneficio 1', descricao: 'Desc 1', valor: 100, ativo: true, version: 1 },
      { id: 2, nome: 'Beneficio 2', descricao: 'Desc 2', valor: 200, ativo: true, version: 1 }
    ];

    mockBenefitService.getAllActive.and.returnValue(of(mockBenefits));
    fixture.detectChanges();

    component.form.get('toId')?.setValue('2');
    component.onToChange();

    expect(component.toBenefit).toEqual(mockBenefits[1]);
  });

  it('should perform transfer successfully', fakeAsync(() => {
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

    const mockBenefits: Benefit[] = [
      { id: 1, nome: 'Beneficio 1', descricao: 'Desc 1', valor: 100, ativo: true, version: 1 },
      { id: 2, nome: 'Beneficio 2', descricao: 'Desc 2', valor: 200, ativo: true, version: 1 }
    ];

    mockBenefitService.getAllActive.and.returnValue(of(mockBenefits));
    mockBenefitService.transfer.and.returnValue(of(mockResponse));

    fixture.detectChanges();

    component.form.patchValue({
      fromId: 1,
      toId: 2,
      valor: 50
    });

    component.onSubmit();

    expect(mockBenefitService.transfer).toHaveBeenCalledWith({
      fromId: 1,
      toId: 2,
      valor: 50
    });
    expect(component.successMessage).toBe('Transferência realizada com sucesso');
    expect(component.loading).toBe(false);

    tick(2000);

    expect(mockRouter.navigate).toHaveBeenCalledWith(['/beneficios']);
  }));

  it('should handle error on transfer', () => {
    const mockBenefits: Benefit[] = [
      { id: 1, nome: 'Beneficio 1', descricao: 'Desc 1', valor: 100, ativo: true, version: 1 },
      { id: 2, nome: 'Beneficio 2', descricao: 'Desc 2', valor: 200, ativo: true, version: 1 }
    ];

    mockBenefitService.getAllActive.and.returnValue(of(mockBenefits));
    mockBenefitService.transfer.and.returnValue(throwError(() => new Error('Erro na transferência')));

    fixture.detectChanges();

    component.form.patchValue({
      fromId: 1,
      toId: 2,
      valor: 50
    });

    component.onSubmit();

    expect(component.errorMessage).toBe('Erro na transferência');
    expect(component.loading).toBe(false);
  });

  it('should not submit invalid form', () => {
    mockBenefitService.getAllActive.and.returnValue(of([]));
    fixture.detectChanges();

    component.onSubmit();

    expect(mockBenefitService.transfer).not.toHaveBeenCalled();
  });

  it('should cancel and navigate back', () => {
    mockBeneficioService.getAllAtivos.and.returnValue(of([]));
    fixture.detectChanges();

    component.cancel();

    expect(mockRouter.navigate).toHaveBeenCalledWith(['/beneficios']);
  });

  it('should format valor correctly', () => {
    const formatted = component.formatarValor(1234.56);
    expect(formatted).toContain('1.234,56');
  });

  it('should detect when IDs are equal', () => {
    mockBeneficioService.getAllAtivos.and.returnValue(of([]));
    fixture.detectChanges();

    component.form.patchValue({
      fromId: '1',
      toId: '1'
    });

    expect(component.idsIguais()).toBe(true);

    component.form.patchValue({
      fromId: '1',
      toId: '2'
    });

    expect(component.idsIguais()).toBe(false);
  });

  it('should detect when valor exceeds saldo', () => {
    const mockBeneficios: Beneficio[] = [
      { id: 1, nome: 'Beneficio 1', descricao: 'Desc 1', valor: 100, ativo: true, version: 1 }
    ];

    mockBeneficioService.getAllAtivos.and.returnValue(of(mockBeneficios));
    fixture.detectChanges();

    component.form.get('fromId')?.setValue('1');
    component.onFromChange();

    component.form.get('valor')?.setValue(150);
    expect(component.valorExcedeSaldo()).toBe(true);

    component.form.get('valor')?.setValue(50);
    expect(component.valorExcedeSaldo()).toBe(false);
  });

  it('should initialize with correct default values', () => {
    expect(component.beneficios).toEqual([]);
    expect(component.loading).toBe(false);
    expect(component.errorMessage).toBe('');
    expect(component.successMessage).toBe('');
    expect(component.fromBeneficio).toBeUndefined();
    expect(component.toBeneficio).toBeUndefined();
  });
});
