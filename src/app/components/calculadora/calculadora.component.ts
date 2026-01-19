import { Component } from '@angular/core';
import { ReactiveFormsModule, FormControl, FormGroup, Validators, FormsModule, FormArray, } from '@angular/forms';
import { RouterLink } from '@angular/router';

import { TuiButton, TuiLabel, TuiTextfield, TuiTitle, TuiError, TuiHint } from '@taiga-ui/core';
import { TuiCheckbox, TuiInputNumber, TuiRadio, TuiRadioList } from '@taiga-ui/kit';
import { TuiForm, TuiHeader } from '@taiga-ui/layout';


@Component({
	selector: 'app-calculadora',
	standalone: true,
	imports: [
		ReactiveFormsModule,
		FormsModule,
		TuiForm,
		TuiHeader,
		TuiError,
		TuiButton,
		TuiHint,
		TuiLabel,
		TuiTextfield,
		TuiTitle,
		TuiInputNumber,
		TuiRadio,
		TuiRadioList,
		RouterLink,
		TuiCheckbox,
	],
	templateUrl: './calculadora.component.html',
	// styleUrl: './calculadora.component.scss',
})
export class CalculadoraComponent {
	constructor() {
		this.notaForm.controls.notaEsperada.valueChanges.subscribe(() => { this.updateValidators(); });
		this.updateValidators();
	}

	mediaN1: number | null = null;
	nota: number | null = null;
	isAFMax: boolean = false;
	isAFMin: boolean = false;
	notaAFMax: number | null = null;
	notaAFMin: number | null = null;
	mediaSimuladaMax: number | null = null;
	mediaSimuladaMin: number | null = null;
	notaNecessariaParaAF: number | null = null;
	value: string | null = null;

	protected readonly choices = [
		{
			name: 'Quarta prova',
			description: 'Calcula quanto você precisará tirar na última prova. Será necessário fornecer a terceira nota',
		},
		{
			name: 'N2',
			description: 'Calcula qual média você precisará na N2',
		},
	];

	protected readonly points = [
		'Um ponto na menor nota da N1',
		'Um ponto na menor nota da N2',
		'Um ponto na média da N1',
		'Um ponto na média da N2'
	];

	readonly notaForm = new FormGroup({
		primeiraNota: new FormControl<number | null>(null, [
			Validators.required,
			Validators.min(0),
			Validators.max(10),
		]),
		segundaNota: new FormControl<number | null>(null, [
			Validators.required,
			Validators.min(0),
			Validators.max(10),
		]),
		notaEsperada: new FormControl<{ name: 'Quarta prova' | 'N2'; description: string } | null>(
			null,
			Validators.required
		),

		terceiraNota: new FormControl<number | null>(null, [
			Validators.min(0),
			Validators.max(10)
		]),

		points: new FormArray(
			this.points.map(() => new FormControl(false))
		),
	});

	get pointsArray(): FormArray<FormControl<boolean>> {
		return this.notaForm.controls.points as FormArray<FormControl<boolean>>;
	}

	get provaLabel(): string {
		return this.isQuartaProvaSelected ? 'Quarta prova' : 'N2';
	}

	get resultado() {
		if (this.nota == null) return null;
		let p3 = this.notaForm.value.terceiraNota;
		let option = (p3 !== null && p3 !== undefined) ? 'quarta prova' : 'N2';

		if (this.nota == 0) return { titulo: `Parabéns, você não precisa de mais pontos para ficar na média` };
		if (this.nota <= 10) return { titulo: `Você precisa de ${this.nota.toFixed(1)} na ${this.provaLabel}` };

		return {
			titulo: `Você já está de AF. Precisará de ${this.notaAFMax?.toFixed(1)} na AF se tirar um 10 na ${this.provaLabel}`,
			detalhe: this.isAFMin ? `${option}, você precisará de ${this.notaAFMin?.toFixed(1)} na AF` : `${option}, você não terá direito a AF por ter uma média (${this.mediaSimuladaMin?.toFixed(1)}) menor que 3`,
			extra: this.notaNecessariaParaAF ? `Para ter direito a AF, você precisará tirar ${this.notaNecessariaParaAF.toFixed(1)} na ${this.provaLabel}` : null
		};
	}

	calcularNota(): void {
		const { p1: primeiraNota, p2: segundaNota, p3: terceiraNota, hasP3: hasTerceira } = this.aplicarPontos();

		this.mediaN1 = (primeiraNota + segundaNota) / 2;
		let formulaMedia = (35 - (primeiraNota + segundaNota)) / 3;
		this.nota = hasTerceira ? formulaMedia * 2 - terceiraNota! : formulaMedia;

		this.calcularMediaSimulada(this.nota, this.mediaN1, hasTerceira, terceiraNota!);
	}

	aplicarPontos() {
		const pontos = this.pointsArray.value;
		let p1 = this.notaForm.value.primeiraNota!;
		let p2 = this.notaForm.value.segundaNota!;
		let p3 = this.notaForm.value.terceiraNota;
		let hasP3 = p3 !== null && p3 !== undefined;

		if (pontos[0]) (p1 > p2) ? p1++ : p2++;
		if (pontos[1] && hasP3) p3!++;
		if (pontos[2]) { p1++; p2++; }
		if (pontos[3] && hasP3) p3!+=2;
		// if (pontos[3]) p3 = (p3 ?? 0) + 2;

		return { p1, p2, p3, hasP3 };
	}

	calcularMediaSimulada(nota: number, mediaN1: number, hasTerceira: boolean, terceiraNota?: number) {
		if (nota > 10) {
			this.mediaSimuladaMax = (hasTerceira) ? (((mediaN1 * 2) + (((terceiraNota! + 10) / 2) * 3)) / 5) : (((mediaN1 * 2) + 30) / 5);
			this.isAFMax = this.mediaSimuladaMax >= 3;
			if (this.isAFMax) this.notaAFMax = 10 - this.mediaSimuladaMax;

			this.mediaSimuladaMin = (hasTerceira) ? (((mediaN1 * 2) + (((terceiraNota!) / 2) * 3)) / 5) : ((mediaN1 * 2) / 5);
			this.isAFMin = this.mediaSimuladaMin >= 3;
			if (this.isAFMin) {
				this.notaAFMin = 10 - this.mediaSimuladaMin;
			} else {
				this.notaNecessariaParaAF = (hasTerceira) ? (((15 - (mediaN1*2))/3)*2) - terceiraNota! : (15 - (mediaN1*2))/3;
			}
		}
	}

	getErroTratado(formControlName: string): string | null {
		const control = this.notaForm.get(formControlName);

		if (!control?.touched || control.value === null) return null;
		if (control.hasError('required')) return 'Esse campo é obrigatório';
		if (control.hasError('min')) return 'O valor não pode ser menor que 0';
		if (control.hasError('max')) return 'O valor não pode ser maior que 10';

		return null;
	}

	get isQuartaProvaSelected(): boolean {
		const selectedOption = this.notaForm.controls.notaEsperada.value;
		return selectedOption?.name === 'Quarta prova';
	}

	updateValidators(): void {
		const terceiraNotaControl = this.notaForm.controls.terceiraNota;
		this.nota = null;

		if (this.isQuartaProvaSelected) {
			terceiraNotaControl.setValidators([
				Validators.required,
				Validators.min(0),
				Validators.max(10),
			]);
		} else {
			terceiraNotaControl.clearValidators();
			terceiraNotaControl.setValue(null);
		}
		terceiraNotaControl.updateValueAndValidity();
	}
}
