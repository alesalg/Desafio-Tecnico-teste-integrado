import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { BeneficioListComponent } from './beneficio-list.component';
import { BeneficioService } from '../../services/beneficio.service';
import { Beneficio } from '../../models/beneficio.model';

describe('BeneficioListComponent', () => {
  let component: BeneficioListComponent;
  let fixture: ComponentFixture<BeneficioListComponent>;
  let mockBeneficioService: jasmine.SpyObj<BeneficioService>;
  let mockRouter: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    mockBeneficioService = jasmine.createSpyObj('BeneficioService', ['getAll', 'getAllAtivos', 'delete']);
    mockRouter = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      declarations: [BeneficioListComponent],
      providers: [
        { provide: BeneficioService, useValue: mockBeneficioService },
        { provide: Router, useValue: mockRouter }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(BeneficioListComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load all beneficios on init', () => {
    const mockBeneficios: Beneficio[] = [
      { id: 1, nome: 'Beneficio 1', descricao: 'Desc 1', valor: 100, ativo: true, version: 1 },
      { id: 2, nome: 'Beneficio 2', descricao: 'Desc 2', valor: 200, ativo: false, version: 1 }
    ];

    mockBeneficioService.getAll.and.returnValue(of(mockBeneficios));

    fixture.detectChanges();

    expect(mockBeneficioService.getAll).toHaveBeenCalled();
    expect(component.beneficios).toEqual(mockBeneficios);
    expect(component.loading).toBe(false);
  });

  it('should load only active beneficios when toggle is on', () => {
    const mockBeneficios: Beneficio[] = [
      { id: 1, nome: 'Beneficio 1', descricao: 'Desc 1', valor: 100, ativo: true, version: 1 }
    ];

    mockBeneficioService.getAllAtivos.and.returnValue(of(mockBeneficios));

    component.showApenasAtivos = true;
    component.loadBeneficios();

    expect(mockBeneficioService.getAllAtivos).toHaveBeenCalled();
    expect(component.beneficios).toEqual(mockBeneficios);
  });

  it('should handle error when loading beneficios', () => {
    mockBeneficioService.getAll.and.returnValue(throwError(() => new Error('Erro ao carregar')));

    fixture.detectChanges();

    expect(component.errorMessage).toBe('Erro ao carregar');
    expect(component.loading).toBe(false);
  });

  it('should toggle between all and active beneficios', () => {
    const allBeneficios: Beneficio[] = [
      { id: 1, nome: 'Beneficio 1', descricao: 'Desc 1', valor: 100, ativo: true, version: 1 },
      { id: 2, nome: 'Beneficio 2', descricao: 'Desc 2', valor: 200, ativo: false, version: 1 }
    ];

    const activeBeneficios: Beneficio[] = [
      { id: 1, nome: 'Beneficio 1', descricao: 'Desc 1', valor: 100, ativo: true, version: 1 }
    ];

    mockBeneficioService.getAll.and.returnValue(of(allBeneficios));
    mockBeneficioService.getAllAtivos.and.returnValue(of(activeBeneficios));

    fixture.detectChanges();

    expect(component.showApenasAtivos).toBe(false);
    expect(component.beneficios.length).toBe(2);

    component.toggleApenasAtivos();

    expect(component.showApenasAtivos).toBe(true);
    expect(mockBeneficioService.getAllAtivos).toHaveBeenCalled();
  });

  it('should navigate to create form', () => {
    component.criar();
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/beneficios/novo']);
  });

  it('should navigate to edit form', () => {
    component.editar(1);
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/beneficios/editar', 1]);
  });

  it('should navigate to transfer page', () => {
    component.transferir();
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/beneficios/transferir']);
  });

  it('should delete beneficio after confirmation', () => {
    const mockBeneficios: Beneficio[] = [
      { id: 1, nome: 'Beneficio 1', descricao: 'Desc 1', valor: 100, ativo: true, version: 1 }
    ];

    mockBeneficioService.getAll.and.returnValue(of(mockBeneficios));
    mockBeneficioService.delete.and.returnValue(of(undefined));
    spyOn(window, 'confirm').and.returnValue(true);
    spyOn(window, 'alert');

    fixture.detectChanges();

    component.deletar(1, 'Beneficio 1');

    expect(window.confirm).toHaveBeenCalledWith('Tem certeza que deseja deletar o benefício "Beneficio 1"?');
    expect(mockBeneficioService.delete).toHaveBeenCalledWith(1);
    expect(window.alert).toHaveBeenCalledWith('Benefício deletado com sucesso!');
  });

  it('should not delete beneficio when cancelled', () => {
    spyOn(window, 'confirm').and.returnValue(false);

    component.deletar(1, 'Beneficio 1');

    expect(mockBeneficioService.delete).not.toHaveBeenCalled();
  });

  it('should handle error when deleting', () => {
    mockBeneficioService.delete.and.returnValue(throwError(() => new Error('Erro ao deletar')));
    spyOn(window, 'confirm').and.returnValue(true);
    spyOn(window, 'alert');

    component.deletar(1, 'Beneficio 1');

    expect(window.alert).toHaveBeenCalledWith('Erro ao deletar: Erro ao deletar');
  });

  it('should format valor correctly', () => {
    const formatted = component.formatarValor(1234.56);
    expect(formatted).toContain('1.234,56');
  });

  it('should initialize with correct default values', () => {
    expect(component.beneficios).toEqual([]);
    expect(component.loading).toBe(false);
    expect(component.errorMessage).toBe('');
    expect(component.showApenasAtivos).toBe(false);
  });
});
