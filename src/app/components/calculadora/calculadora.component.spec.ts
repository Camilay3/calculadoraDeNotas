import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CalculadoraComponent } from './calculadora.component';

describe('CalculadoraComponent', () => {
	let component: CalculadoraComponent;
	let fixture: ComponentFixture<CalculadoraComponent>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			imports: [CalculadoraComponent]
		}).compileComponents();

		fixture = TestBed.createComponent(CalculadoraComponent);
		component = fixture.componentInstance;
		component.result =  { titulo: 'Você foi aprovado!' };
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});

	it('should show results', () => {
		const sectionResult: HTMLElement = fixture.nativeElement.querySelector('[data-testid="section-result"]');
		expect(sectionResult).toBeTruthy();
	});

	it('should not show results', () => {
		component.result = null;
		fixture.detectChanges();
		const sectionResult: HTMLElement = fixture.nativeElement.querySelector('[data-testid="section-result"]');
		expect(sectionResult).not.toBeTruthy();
	});

	describe('getClassColor', () => {
		it.each([
			{ nota: -1, expected: 'text-neutral-500' },
			{ nota: 2,  expected: 'text-red-500' },
			{ nota: 5,  expected: 'text-yellow-500' },
			{ nota: 7,  expected: 'text-green-500' },

		])('should return "$expected" for value $nota', ({ nota, expected }) => {
			component.state.mediaN1 = nota*2;
			fixture.detectChanges();
			const h1: HTMLElement = fixture.nativeElement.querySelector('[data-testid="media-n1"]');

			expect(component.getClassColor(nota)).toBe(expected);
			expect(h1.classList).toContain(expected);
		});
	});

	it('should return correct getStateColor for different values', () => {
		expect(component.getStateColor(true)).toBe('bg-green-100 text-green-900');

		jest.spyOn(component, 'isAFSelected', 'get').mockReturnValue(true);
		component.state.af = { precisa: 8 } as any;
		expect(component.getStateColor(false)).toBe('bg-red-100 text-red-900');

		jest.spyOn(component, 'isAFSelected', 'get').mockReturnValue(false);
		component.state.nota = 20;
		expect(component.getStateColor(false)).toBe('bg-yellow-100 text-yellow-900');
	});

	it('should render correct getState for different values', () => {
		expect(component.getState(true)).toBe('Aprovado');

		jest.spyOn(component, 'isAFSelected', 'get').mockReturnValue(true);
		component.state.af = { precisa: 8 } as any;
		expect(component.getState(false)).toBe('Reprovado');

		jest.spyOn(component, 'isAFSelected', 'get').mockReturnValue(false);
		component.state.nota = 20;
		expect(component.getState(false)).toBe('Prova Final');
	});

	describe('formulário', () => {
		describe('pointsArray', () => {
			it('should have points form array', () => {
				expect(component.pointsArray).toBeDefined();
				expect(component.pointsArray.length).toBe(component.points.length);
			});

			it('should reflect changes in points array', () => {
				component.pointsArray.at(0).setValue(true);
				expect(component.pointsArray.at(0).value).toBe(true);
			});
		});

		describe('getErroTratado', () => {
			it('should return null if control is not touched', () => {
				const result = component.getErroTratado('primeiraNota');
				expect(result).toBeNull();
			});

			it.each([
				{ value: null, response: 'Esse campo é obrigatório' },
				{ value: 8, response: null },
				{ value: -1, response: 'O valor não pode ser menor que 0' },
				{ value: 11, response: 'O valor não pode ser maior que 10' },

			])('should return "$response" for value $value', ({ value, response }) => {
				const control = component.notaForm.controls.primeiraNota;
				control.markAsTouched();
				control.setValue(value);
				expect(component.getErroTratado('primeiraNota')).toBe(response);
			});
		});
	});
});
