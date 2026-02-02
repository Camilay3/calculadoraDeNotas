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

	describe('resultado', () => {
		it.each([
			{ value: 8, nota: 2, response: `Infelizmente você não tem direito a AF por ter uma média` },
			{ value: 5, nota: null, response: `Você precisa de` },
			{ value: null, nota: null, response: `Parabéns, você foi aprovado!` },

		])('should return "$response" for value $value when has isAFSelected', ({ value, nota, response }) => {
			jest.spyOn(component, 'isAFSelected', 'get').mockReturnValue(true);
			component.state.af = { precisa: value } as any;
			component.state.nota = nota;
			expect(component.resultado().titulo).toContain(response);
		});

		it.each([
			{ value: 10, status: true, response: `Parabéns, você não precisa de mais pontos por ter média suficiente` },
			{ value: 8, status: false, response: `Você precisa de` },
			{ value: 12, status: false, response: `Você já está de AF.` },

		])('should return "$response" for value $value', ({ value, status, response }) => {
			jest.spyOn(component, 'isAFSelected', 'get').mockReturnValue(false);
			component.state.aprovado = status;
			component.state.nota = value;
			expect(component.resultado().titulo).toContain(response);
		});
	});

	describe('calcularNota', () => {
		let spyAplicarPontos: jest.SpyInstance<{ p1: number; p2: number; p3: number; p4: number }, [], any>;
		let spyMediaSimulada: jest.SpyInstance<void, [mediaN1: number, terceiraNota?: number | undefined], any>;
		let spyIsAFSelected: jest.SpyInstance<boolean>;

		beforeEach(() => {
			spyAplicarPontos = jest.spyOn(component, 'aplicarPontos').mockReturnValue({ p1: 0, p2: 0, p3: 0, p4: 0 });
			spyIsAFSelected = jest.spyOn(component, 'isAFSelected', 'get').mockReturnValue(false);
			spyMediaSimulada = jest.spyOn(component, 'calcularMediaSimulada');
			component.notaForm.patchValue({ mediaEsperada: component.medias[0] });
		})

		it('should call aplicarPontos and resultado', () => {
			let spyResultado = jest.spyOn(component, 'resultado');
			component.calcularNota();
			expect(spyAplicarPontos).toHaveBeenCalled();
			expect(spyResultado).toHaveBeenCalled();
		})

		it('should call calcularMediaSimulada when nota > 10', () => {
			jest.spyOn(component, 'isQuartaProvaSelected', 'get').mockReturnValue(true);

			spyAplicarPontos.mockReturnValue({ p1: 4, p2: 4, p3: 5, p4: 0 });
			component.calcularNota();
			expect(spyMediaSimulada).toHaveBeenCalled();
		});

		it('should return correct values when isAFSelected', () => {
			spyIsAFSelected.mockReturnValue(true);

			component.calcularNota();
			expect(spyMediaSimulada).not.toHaveBeenCalled();

			spyAplicarPontos.mockReturnValue({ p1: 10, p2: 10, p3: 10, p4: 10 });
			component.calcularNota();
			expect(component.state.aprovado).toBeTruthy();
		});

		it('should return correct values when is approved', () => {
			spyAplicarPontos.mockReturnValue({ p1: 10, p2: 10, p3: 10, p4: 10 });

			component.calcularNota();
			expect(spyMediaSimulada).not.toHaveBeenCalled();
			expect(component.state.aprovado).toBeTruthy();
		});
	});

	describe('formulário', () => {
		// Testar inicialização do formulário e envio de valores corretos e incorretos

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
