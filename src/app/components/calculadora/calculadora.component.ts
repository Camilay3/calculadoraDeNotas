import { Component } from '@angular/core';
import { ReactiveFormsModule, FormControl, FormGroup, Validators, FormsModule, } from '@angular/forms';
import { RouterLink } from '@angular/router';

import { TuiButton, TuiLabel, TuiTextfield, TuiTitle, TuiError, TuiHint } from '@taiga-ui/core';
import { TuiInputNumber, TuiRadio, TuiRadioList } from '@taiga-ui/kit';
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
	],
	templateUrl: './calculadora.component.html',
	// styleUrl: './calculadora.component.scss',
})
export class CalculadoraComponent {
	constructor() {
		this.notaForm.controls.notaEsperada.valueChanges.subscribe(() => {
			this.updateValidators();
		});
		this.updateValidators();
	}

	mediaN1: number | null = null;
	nota: number | null = null;
	value: string | null = null;

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

		terceiraNota: new FormControl<number | null>(null, [Validators.min(0), Validators.max(10)]),
	});

	calcularNota(): void {
		const primeiraNota = this.notaForm.value.primeiraNota!;
		const segundaNota = this.notaForm.value.segundaNota!;
		const terceiraNota = this.notaForm.value.terceiraNota;

		this.mediaN1 = (primeiraNota + segundaNota) / 2;
		let formulaMedia = (35 - (primeiraNota + segundaNota)) / 3;

		this.nota = terceiraNota ? formulaMedia * 2 - terceiraNota : formulaMedia;
	}

	getErroTratado(formControlName: string): string | null {
		const control = this.notaForm.get(formControlName);

		if (!control?.touched || control.value === null) return null;
		if (control.hasError('required')) return 'Esse campo é obrigatório';
		if (control.hasError('min')) return 'O valor não pode ser menor que 0';
		if (control.hasError('max')) return 'O valor não pode ser maior que 10';

		return null;
	}

	protected readonly objects = [
		{
			name: 'Quarta prova',
			description:
				'Calcula quanto você precisará tirar na última prova. Será necessário fornecer a terceira nota',
		},
		{
			name: 'N2',
			description: 'Calcula qual média você precisará na N2',
		},
	];

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
