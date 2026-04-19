import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CalculadoraComponent } from './calculadora.component';
import { provideRouter } from '@angular/router';

describe('CalculadoraComponent', () => {
	let component: CalculadoraComponent;
	let fixture: ComponentFixture<CalculadoraComponent>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			imports: [CalculadoraComponent],
			providers: [ provideRouter([]) ]
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
			component.state.mediaN1 = nota;
			fixture.detectChanges();
			const h1: HTMLElement = fixture.nativeElement.querySelector('[data-testid="media-n1"]');

			expect(component.getClassColor(nota)).toBe(expected);
			expect(h1.classList).toContain(expected);
		});

		it('should define media 7 when isAFSelected', () => {
			jest.spyOn(component, 'isAFSelected', 'get').mockReturnValue(true);
			component.getClassColor(5);
			expect(component.state.media).toBe(7);
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
		it('should render tooltip when mediaN2 is null', () => {
			jest.spyOn(component.state, 'aplicarPontos').mockImplementation(() => {
				component.state.notas = { p1: 0, p2: 0, p3: 0, p4: 0 } as any;
			});
			component.calcularNota();

			const tooltip = fixture.nativeElement.querySelector('[data-testid="tooltipMedia"]');
			expect(tooltip).toBeTruthy();
		});

		it('should not render tooltip when has mediaN2', () => {
			component.notaForm.patchValue({
				primeiraNota: 10,
				segundaNota: 10,
				terceiraNota: 10,
				quartaNota: 0,
			});
			jest.spyOn(component, 'isQuartaProvaSelected', 'get').mockReturnValue(false);
			component.calcularNota();

			let mediaN2 = component.state.mediaN2;
			expect(mediaN2).toBe(5);

			fixture.detectChanges();
			const tooltip = fixture.nativeElement.querySelector('[data-testid="tooltipMedia"]');
			expect(tooltip).not.toBeTruthy();
		});

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
		let spyMediaSimulada: jest.SpyInstance<void, [isQuartaProvaSelected: boolean], any>;
		let spyIsAFSelected: jest.SpyInstance<boolean>;

		beforeEach(() => {
			component.notaForm.patchValue({ primeiraNota: 0, segundaNota: 0, terceiraNota: 0, quartaNota: 0 });
			spyIsAFSelected = jest.spyOn(component, 'isAFSelected', 'get').mockReturnValue(false);
			spyMediaSimulada = jest.spyOn(component.state, 'calcularMediaSimulada');
			component.notaForm.patchValue({ mediaEsperada: component.medias[0] });
		})

		describe('calcularMediaSimulada', () => {
			it('should call calcularMediaSimulada when nota > 10', () => {
				jest.spyOn(component, 'isQuartaProvaSelected', 'get').mockReturnValue(true);

				component.notaForm.patchValue({ primeiraNota: 4, segundaNota: 4, terceiraNota: 5, quartaNota: 0 });
				component.calcularNota();
				expect(spyMediaSimulada).toHaveBeenCalled();
			});

			it('should use simple calculations when isQuartaProvaSelected is false', () => {
				jest.spyOn(component, 'isQuartaProvaSelected', 'get').mockReturnValue(false);

				component.notaForm.patchValue({ primeiraNota: 0, segundaNota: 0, terceiraNota: 0, quartaNota: 0 });
				component.calcularNota();
				const aux = component.state.mediaN1 * 2;

				expect(component.state.af.mediaMax).toBeCloseTo((aux + 30) / 5);
				expect(component.state.af.mediaMin).toBeCloseTo(aux / 5);
				expect(component.state.af.precisa).toBeCloseTo((15 - aux) / 3);
			});
		});

		it('should call aplicarPontos and resultado', () => {
			let spyAplicarPontos = jest.spyOn(component.state, 'aplicarPontos');
			let spyResultado = jest.spyOn(component, 'resultado');
			component.calcularNota();
			expect(spyAplicarPontos).toHaveBeenCalled();
			expect(spyResultado).toHaveBeenCalled();
		})

		it('should scroll to results', () => {
			jest.useFakeTimers();

			const scrollMock = jest.fn();
			component.calcularNota();
			component.resultadoSection = { nativeElement: { scrollIntoView: scrollMock } } as any;
			jest.advanceTimersByTime(100);
			expect(scrollMock).toHaveBeenCalledWith({ behavior: 'smooth', block: 'start' });

			jest.useRealTimers();
		});

		it('should return correct values when isAFSelected', () => {
			spyIsAFSelected.mockReturnValue(true);

			component.calcularNota();
			expect(spyMediaSimulada).not.toHaveBeenCalled();

			component.notaForm.patchValue({ primeiraNota: 10, segundaNota: 10, terceiraNota: 10, quartaNota: 10 });
			component.calcularNota();
			expect(component.state.aprovado).toBeTruthy();
		});

		it('should return correct values when is approved', () => {
			component.notaForm.patchValue({ primeiraNota: 10, segundaNota: 10, terceiraNota: 10, quartaNota: 10 });

			component.calcularNota();
			expect(spyMediaSimulada).not.toHaveBeenCalled();
			expect(component.state.aprovado).toBeTruthy();
		});
	});

	describe('aplicarPontos', () => {
		it('should have points', () => {
			component.state.aplicarPontos(component.pointsArray.value);
			expect(component.pointsArray).toBeDefined();
		})

		it('should add point to the smaller grade when b1 > b2', () => {
			jest.spyOn(component, 'isAFSelected', 'get').mockReturnValue(false);
			component.pointsArray.setValue([true, true, true, true]);
			component.state.atribuirNotas([5, 3, 0, 0]);
			component.state.aplicarPontos(component.pointsArray.value);
			let p1 = component.state.notas.p1;
			let p2 = component.state.notas.p2;
			let p3 = component.state.notas.p3;
			let p4 = component.state.notas.p4;
			expect(p1).toBe(6);
			expect(p2).toBe(5);
			expect(p3).toBe(2);
			expect(p4).toBe(1);
		});

		it('should add point to the smaller grade when b3 = b4', () => {
			jest.spyOn(component, 'isAFSelected', 'get').mockReturnValue(true);
			component.pointsArray.setValue([true, true, true, true]);
			component.state.atribuirNotas([5, 3, 0, 0]);
			component.state.aplicarPontos(component.pointsArray.value);
			let p3 = component.state.notas.p3;
			let p4 = component.state.notas.p4;
			expect(p3).toBe(2);
			expect(p4).toBe(1);
			let mediaN2 = component.state.mediaN2;
			expect(mediaN2).toBe(1.5);
		});
	});

	describe('formulário', () => {
		// Testar inicialização/envio do formulário e envio de valores corretos e incorretos

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

		describe('updateValidators', () => {
			it('should clear terceira and quarta validators when no AF and no quarta prova', () => {
				jest.spyOn(component, 'isQuartaProvaSelected', 'get').mockReturnValue(false);
				jest.spyOn(component, 'isAFSelected', 'get').mockReturnValue(false);

				component.notaForm.patchValue({
					terceiraNota: 5,
					quartaNota: 5,
				});

				component.updateValidators();
				const { terceiraNota, quartaNota, mediaEsperada } = component.notaForm.controls;

				expect(terceiraNota.validator).toBeNull();
				expect(quartaNota.validator).toBeNull();

				expect(terceiraNota.value).toBeNull();
				expect(quartaNota.value).toBeNull();

				expect(mediaEsperada.value).toEqual(component.medias[0]);
				expect(component.state.nota).toBeNull();
			});

			it('should require terceira and quarta when AF is selected', () => {
				jest.spyOn(component, 'isAFSelected', 'get').mockReturnValue(true);
				jest.spyOn(component, 'isQuartaProvaSelected', 'get').mockReturnValue(true);

				component.updateValidators();
				const { terceiraNota, quartaNota, mediaEsperada } = component.notaForm.controls;

				terceiraNota.setValue(null);
				quartaNota.setValue(null);

				expect(terceiraNota.hasError('required')).toBe(true);
				expect(quartaNota.hasError('required')).toBe(true);

				expect(mediaEsperada.value).toBeNull();
			});

			it('should require terceira but not quarta when quarta prova selected without AF', () => {
				jest.spyOn(component, 'isQuartaProvaSelected', 'get').mockReturnValue(true);
				jest.spyOn(component, 'isAFSelected', 'get').mockReturnValue(false);

				component.updateValidators();
				const { terceiraNota, quartaNota, mediaEsperada } = component.notaForm.controls;

				terceiraNota.setValue(null);
				quartaNota.setValue(null);

				expect(terceiraNota.hasError('required')).toBe(true);
				expect(quartaNota.hasError('required')).toBe(false);

				expect(mediaEsperada.value).toEqual(component.medias[0]);
			});
		});

		it('clear() should null result and scroll to form', () => {
			jest.useFakeTimers();

			const scrollMock = jest.fn();
			component.result = { titulo: 'teste' } as any;
			component.formularioSection = { nativeElement: { scrollIntoView: scrollMock } } as any;

			component.clear();
			expect(component.result).toBeNull();
			jest.advanceTimersByTime(100);
			expect(scrollMock).toHaveBeenCalledWith({ behavior: 'smooth', block: 'start' });

			jest.useRealTimers();
		});
	});
});
