import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { BeneficioFormComponent } from './beneficio-form.component';
import { BeneficioService } from '../../services/beneficio.service';
import { Beneficio } from '../../models/beneficio.model';

describe('BeneficioFormComponent', () => {
  let component: BeneficioFormComponent;
  let fixture: ComponentFixture<BeneficioFormComponent>;
  let mockBeneficioService: jasmine.SpyObj<BeneficioService>;
  let mockRouter: jasmine.SpyObj<Router>;
  let mockActivatedRoute: any;

  beforeEach(async () => {
    mockBeneficioService = jasmine.createSpyObj('BeneficioService', ['getById', 'create', 'update']);
    mockRouter = jasmine.createSpyObj('Router', ['navigate']);
    mockActivatedRoute = {
      snapshot: {
        paramMap: {
          get: jasmine.createSpy('get').and.returnValue(null)
        }
      }
    };

    await TestBed.configureTestingModule({
      declarations: [BeneficioFormComponent],
      imports: [ReactiveFormsModule],
      providers: [
        { provide: BeneficioService, useValue: mockBeneficioService },
        { provide: Router, useValue: mockRouter },
        { provide: ActivatedRoute, useValue: mockActivatedRoute }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(BeneficioFormComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize form with empty values', () => {
    fixture.detectChanges();
    expect(component.form).toBeDefined();
    expect(component.form.get('nome')?.value).toBe('');
    expect(component.form.get('descricao')?.value).toBe('');
    expect(component.form.get('valor')?.value).toBe('');
    expect(component.form.get('ativo')?.value).toBe(true);
  });

  it('should validate required fields', () => {
    fixture.detectChanges();
    const nomeControl = component.form.get('nome');
    const valorControl = component.form.get('valor');

    expect(nomeControl?.valid).toBeFalsy();
    expect(valorControl?.valid).toBeFalsy();

    nomeControl?.setValue('Beneficio Teste');
    valorControl?.setValue(100);

    expect(nomeControl?.valid).toBeTruthy();
    expect(valorControl?.valid).toBeTruthy();
  });

  it('should validate minimum value', () => {
    fixture.detectChanges();
    const valorControl = component.form.get('valor');

    valorControl?.setValue(0);
    expect(valorControl?.hasError('min')).toBeTruthy();

    valorControl?.setValue(0.01);
    expect(valorControl?.hasError('min')).toBeFalsy();
  });

  it('should load beneficio in edit mode', () => {
    const mockBeneficio: Beneficio = {
      id: 1,
      nome: 'Beneficio 1',
      descricao: 'Desc 1',
      valor: 100,
      ativo: true,
      version: 1
    };

    mockActivatedRoute.snapshot.paramMap.get.and.returnValue('1');
    mockBeneficioService.getById.and.returnValue(of(mockBeneficio));

    fixture.detectChanges();

    expect(component.isEditMode).toBe(true);
    expect(component.beneficioId).toBe(1);
    expect(mockBeneficioService.getById).toHaveBeenCalledWith(1);
    expect(component.form.get('nome')?.value).toBe('Beneficio 1');
    expect(component.form.get('valor')?.value).toBe(100);
  });

  it('should handle error when loading beneficio', () => {
    mockActivatedRoute.snapshot.paramMap.get.and.returnValue('1');
    mockBeneficioService.getById.and.returnValue(throwError(() => new Error('Erro ao carregar')));

    fixture.detectChanges();

    expect(component.errorMessage).toBe('Erro ao carregar');
    expect(component.loading).toBe(false);
  });

  it('should create new beneficio', () => {
    const mockResponse: Beneficio = {
      id: 1,
      nome: 'Novo Beneficio',
      descricao: 'Nova Desc',
      valor: 150,
      ativo: true,
      version: 1
    };

    mockBeneficioService.create.and.returnValue(of(mockResponse));
    spyOn(window, 'alert');

    fixture.detectChanges();

    component.form.patchValue({
      nome: 'Novo Beneficio',
      descricao: 'Nova Desc',
      valor: 150,
      ativo: true
    });

    component.onSubmit();

    expect(mockBeneficioService.create).toHaveBeenCalled();
    expect(window.alert).toHaveBeenCalledWith('Benefício criado com sucesso!');
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/beneficios']);
  });

  it('should update existing beneficio', () => {
    const mockResponse: Beneficio = {
      id: 1,
      nome: 'Beneficio Atualizado',
      descricao: 'Desc Atualizada',
      valor: 200,
      ativo: true,
      version: 2
    };

    mockBeneficioService.update.and.returnValue(of(mockResponse));
    spyOn(window, 'alert');

    fixture.detectChanges();

    component.isEditMode = true;
    component.beneficioId = 1;

    component.form.patchValue({
      nome: 'Beneficio Atualizado',
      descricao: 'Desc Atualizada',
      valor: 200,
      ativo: true
    });

    component.onSubmit();

    expect(mockBeneficioService.update).toHaveBeenCalledWith(1, jasmine.any(Object));
    expect(window.alert).toHaveBeenCalledWith('Benefício atualizado com sucesso!');
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/beneficios']);
  });

  it('should not submit invalid form', () => {
    fixture.detectChanges();

    component.onSubmit();

    expect(mockBeneficioService.create).not.toHaveBeenCalled();
    expect(mockBeneficioService.update).not.toHaveBeenCalled();
  });

  it('should handle error on submit', () => {
    mockBeneficioService.create.and.returnValue(throwError(() => new Error('Erro ao salvar')));

    fixture.detectChanges();

    component.form.patchValue({
      nome: 'Novo Beneficio',
      valor: 150,
      ativo: true
    });

    component.onSubmit();

    expect(component.errorMessage).toBe('Erro ao salvar');
    expect(component.loading).toBe(false);
  });

  it('should cancel and navigate back', () => {
    fixture.detectChanges();

    component.cancel();

    expect(mockRouter.navigate).toHaveBeenCalledWith(['/beneficios']);
  });

  it('should check field errors correctly', () => {
    fixture.detectChanges();

    const nomeControl = component.form.get('nome');
    nomeControl?.markAsTouched();
    nomeControl?.setValue('');

    expect(component.hasError('nome', 'required')).toBe(true);

    nomeControl?.setValue('Test');
    expect(component.hasError('nome', 'required')).toBe(false);
  });
});
