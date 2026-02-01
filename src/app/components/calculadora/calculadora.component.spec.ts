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
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});

	// Testes para as linhas 94-116,121-223,233-237,248-250,256-257
});
