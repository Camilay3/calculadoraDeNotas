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
	isAF: boolean = false;
	notaAF: number | null = null;
	mediaSimulada: number | null = null;
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

	calcularNota(): void {
		let primeiraNota = this.notaForm.value.primeiraNota!;
		let segundaNota = this.notaForm.value.segundaNota!;
		let terceiraNota = this.notaForm.value.terceiraNota;
		const pontos = this.pointsArray.value;
		const hasTerceira = terceiraNota !== null && terceiraNota !== undefined;

		if(pontos[0]) (primeiraNota > segundaNota) ? primeiraNota++ : segundaNota++;
		if(pontos[1] && hasTerceira) terceiraNota!++;
		if(pontos[3] && hasTerceira) terceiraNota!+=2;

		if(pontos[2]) {
			primeiraNota++;
			segundaNota++;
		};

		this.mediaN1 = (primeiraNota + segundaNota) / 2;
		let formulaMedia = (35 - (primeiraNota + segundaNota)) / 3;
		this.nota = hasTerceira ? formulaMedia * 2 - terceiraNota! : formulaMedia;

		if (hasTerceira && this.nota > 10) {
			this.mediaSimulada = (((this.mediaN1 * 2) + (((terceiraNota! + 10) / 2) * 3)) / 5);
			this.isAF = this.mediaSimulada >= 3;
			if (this.isAF) this.notaAF = 10 - this.mediaSimulada;
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
