import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { of, throwError } from 'rxjs';
import { BenefitListComponent } from './benefit-list.component';
import { BenefitService } from '../../services/benefit.service';
import { Benefit } from '../../models/benefit.model';

describe('BenefitListComponent', () => {
  let component: BenefitListComponent;
  let fixture: ComponentFixture<BenefitListComponent>;
  let mockBenefitService: jasmine.SpyObj<BenefitService>;
  let mockRouter: jasmine.SpyObj<Router>;
  let mockDialog: jasmine.SpyObj<MatDialog>;

  beforeEach(async () => {
    mockBenefitService = jasmine.createSpyObj('BenefitService', ['getAll', 'getAllActive', 'delete']);
    mockRouter = jasmine.createSpyObj('Router', ['navigate']);
    mockDialog = jasmine.createSpyObj('MatDialog', ['open']);

    await TestBed.configureTestingModule({
      declarations: [BenefitListComponent],
      providers: [
        { provide: BenefitService, useValue: mockBenefitService },
        { provide: Router, useValue: mockRouter },
        { provide: MatDialog, useValue: mockDialog }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(BenefitListComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load all beneficios on init', () => {
    const mockBenefits: Benefit[] = [
      { id: 1, nome: 'Beneficio 1', descricao: 'Desc 1', valor: 100, ativo: true, version: 1 },
      { id: 2, nome: 'Beneficio 2', descricao: 'Desc 2', valor: 200, ativo: false, version: 1 }
    ];

    mockBenefitService.getAll.and.returnValue(of(mockBenefits));

    fixture.detectChanges();

    expect(mockBenefitService.getAll).toHaveBeenCalled();
    expect(component.benefits).toEqual(mockBenefits);
    expect(component.loading).toBe(false);
  });

  it('should load only active beneficios when toggle is on', () => {
    const mockBenefits: Benefit[] = [
      { id: 1, nome: 'Beneficio 1', descricao: 'Desc 1', valor: 100, ativo: true, version: 1 }
    ];

    mockBenefitService.getAllActive.and.returnValue(of(mockBenefits));

    component.showOnlyActive = true;
    component.loadBenefits();

    expect(mockBenefitService.getAllActive).toHaveBeenCalled();
    expect(component.benefits).toEqual(mockBenefits);
  });

  it('should handle error when loading beneficios', () => {
    mockBenefitService.getAll.and.returnValue(throwError(() => new Error('Erro ao carregar')));

    fixture.detectChanges();

    expect(component.errorMessage).toBe('Erro ao carregar');
    expect(component.loading).toBe(false);
  });

  it('should toggle between all and active beneficios', () => {
    const allBenefits: Benefit[] = [
      { id: 1, nome: 'Beneficio 1', descricao: 'Desc 1', valor: 100, ativo: true, version: 1 },
      { id: 2, nome: 'Beneficio 2', descricao: 'Desc 2', valor: 200, ativo: false, version: 1 }
    ];

    const activeBenefits: Benefit[] = [
      { id: 1, nome: 'Beneficio 1', descricao: 'Desc 1', valor: 100, ativo: true, version: 1 }
    ];

    mockBenefitService.getAll.and.returnValue(of(allBenefits));
    mockBenefitService.getAllActive.and.returnValue(of(activeBenefits));

    fixture.detectChanges();

    expect(component.showOnlyActive).toBe(false);
    expect(component.benefits.length).toBe(2);

    component.toggleOnlyActive();

    expect(component.showOnlyActive).toBe(true);
    expect(mockBenefitService.getAllActive).toHaveBeenCalled();
  });

  it('should navigate to create form', () => {
    component.create();
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/beneficios/novo']);
  });

  it('should navigate to edit form', () => {
    component.edit(1);
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/beneficios/editar', 1]);
  });

  it('should navigate to transfer page', () => {
    component.transfer();
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/beneficios/transferir']);
  });

  it('should delete beneficio after confirmation', () => {
    const mockBenefits: Benefit[] = [
      { id: 1, nome: 'Beneficio 1', descricao: 'Desc 1', valor: 100, ativo: true, version: 1 }
    ];

    mockBenefitService.getAll.and.returnValue(of(mockBenefits));
    mockBenefitService.delete.and.returnValue(of(undefined));
    
    const dialogRefSpy = jasmine.createSpyObj({ afterClosed: of(true) });
    mockDialog.open.and.returnValue(dialogRefSpy);

    fixture.detectChanges();

    component.delete(1, 'Beneficio 1');

    expect(mockDialog.open).toHaveBeenCalled();
    expect(mockBenefitService.delete).toHaveBeenCalledWith(1);
  });

  it('should not delete beneficio when cancelled', () => {
    const dialogRefSpy = jasmine.createSpyObj({ afterClosed: of(false) });
    mockDialog.open.and.returnValue(dialogRefSpy);

    component.delete(1, 'Beneficio 1');

    expect(mockBenefitService.delete).not.toHaveBeenCalled();
  });

  it('should handle error when deleting', () => {
    mockBenefitService.delete.and.returnValue(throwError(() => new Error('Erro ao deletar')));
    
    const dialogRefSpy = jasmine.createSpyObj({ afterClosed: of(true) });
    mockDialog.open.and.returnValue(dialogRefSpy);

    component.delete(1, 'Beneficio 1');

    expect(mockDialog.open).toHaveBeenCalled();
  });

  it('should format valor correctly', () => {
    const formatted = component.formatValue(1234.56);
    expect(formatted).toContain('1.234,56');
  });

  it('should initialize with correct default values', () => {
    expect(component.benefits).toEqual([]);
    expect(component.loading).toBe(false);
    expect(component.errorMessage).toBe('');
    expect(component.showOnlyActive).toBe(false);
  });
});
