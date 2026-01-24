import { Component, OnInit } from '@angular/core';
import { ReactiveFormsModule, FormControl, FormGroup, Validators, FormsModule, FormArray, } from '@angular/forms';
// import { RouterLink } from '@angular/router';

import { TuiButton, TuiLabel, TuiTextfield, TuiTitle, TuiError, TuiHint } from '@taiga-ui/core';
import { TuiCheckbox, TuiInputNumber, TuiRadio, TuiRadioList } from '@taiga-ui/kit';
import { TuiForm, TuiHeader } from '@taiga-ui/layout';

@Component({
	selector: 'app-calculadora',
	standalone: true,
	imports: [
		ReactiveFormsModule,
		FormsModule,
		// RouterLink,
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
		TuiCheckbox,
	],
	templateUrl: './calculadora.component.html',
	// styleUrl: './calculadora.component.scss',
})
export class CalculadoraComponent {
	value: string | null = null;
	mediaN1: number | null = null;
	mediaN2: number | null = null;
	nota: number | null = null;
	isAFMax: boolean = false;
	isAFMin: boolean = false;
	notaAFMax: number | null = null;
	notaAFMin: number | null = null;
	mediaSimuladaMax: number | null = null;
	mediaSimuladaMin: number | null = null;
	notaNecessariaParaAF: number | null = null;
	media: number | null = null;
	provaLabel: string = 'Quarta prova';
	pointsArray!: FormArray<FormControl<boolean>>;
	hasTerceira: boolean = true;
	hasQuarta: boolean = false;

	constructor() {
		this.pointsArray = this.notaForm.controls.points as FormArray<FormControl<boolean>>;
		this.notaForm.controls.notaEsperada.valueChanges.subscribe(value => {
			this.provaLabel = value?.name ?? 'Quarta prova';
			this.updateValidators();
		});
		this.updateValidators();
	}

	protected readonly choices = [
		{
			name: 'Quarta prova',
			description: 'Calcula quanto você precisará tirar na última prova. Será necessário fornecer a terceira nota',
		},
		{
			name: 'N2',
			description: 'Calcula qual média você precisará na N2',
		},
		{
			name: 'AF',
			description: 'Calcula qual nota você precisará tirar na AF. Será necessário fornecer todas as notas',
		},
	];

	protected readonly points = [
		'Um ponto na menor nota da N1',
		'Um ponto na menor nota da N2',
		'Um ponto na média da N1',
		'Um ponto na média da N2'
	];

	protected readonly medias = [
		{
			name: 'Padrão',
			description: 'Calcula a média como 7',
			media: 7
		},
		{
			name: 'Conceito B',
			description: 'Calcula a média como 6',
			media: 6
		},
		{
			name: 'Conceito C',
			description: 'Calcula a média como 5',
			media: 5
		},
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
		notaEsperada: new FormControl<{ name: string; description: string } | null>(
			this.choices[0],
			Validators.required
		),

		terceiraNota: new FormControl<number | null>(null, [
			Validators.min(0),
			Validators.max(10)
		]),

		quartaNota: new FormControl<number | null>(null, [
			Validators.min(0),
			Validators.max(10)
		]),

		points: new FormArray(
			this.points.map(() => new FormControl(false))
		),

		mediaEsperada: new FormControl<{ name: string; description: string, media: number } | null>(
			this.medias[0],
		),
	});

	get resultado() {
		if (this.nota == null) return null;

		if (this.hasQuarta) {
			if (this.notaNecessariaParaAF! > 7) return { titulo: `Infelizmente você não tem direito a AF por ter uma média (${this.nota.toFixed(1)}) menor que 3`};

			return (this.notaNecessariaParaAF) ? { titulo: `Você precisa de ${this.notaNecessariaParaAF.toFixed(1)} na AF!`} : { titulo: `Parabéns, você foi aprovado com média ${this.nota.toFixed(1)}!`}
		}

		if (this.nota == 0) return { titulo: `Parabéns, você não precisa de mais pontos para ficar na média` };
		if (this.nota <= 10) return { titulo: `Você precisa de ${this.nota.toFixed(1)} na ${this.provaLabel}` };

		return {
			titulo: `Você já está de AF. Precisará de ${this.notaAFMax?.toFixed(1)} na AF se tirar um 10 na ${this.provaLabel}`,
			detalhe: this.isAFMin ? `${this.provaLabel}, você precisará de ${this.notaAFMin?.toFixed(1)} na AF` : `${this.provaLabel}, você não terá direito a AF por ter uma média (${this.mediaSimuladaMin?.toFixed(1)}) menor que 3`,
			extra: this.notaNecessariaParaAF ? `Para ter direito a AF, você precisará tirar ${this.notaNecessariaParaAF.toFixed(1)} na ${this.provaLabel}` : null
		};
	}

	calcularNota() {
		const { p1: primeiraNota, p2: segundaNota, p3: terceiraNota, p4: quartaNota } = this.aplicarPontos();
		this.media = this.notaForm.controls.mediaEsperada.value?.media ?? 7;
		this.mediaN1 = (primeiraNota + segundaNota);

		if (this.hasQuarta) {
			this.mediaN2 = (terceiraNota! + quartaNota!) / 2;
			this.nota = (this.mediaN1 +  (3 * this.mediaN2)) / 5;
			this.notaNecessariaParaAF = (Number.parseInt(this.nota.toFixed(1)) < this.media) ? 10 - this.nota : null;
			return
		}
		let formulaMedia = ((this.media * 5) - (this.mediaN1)) / 3;
		this.nota = this.hasTerceira ? (formulaMedia * 2) - terceiraNota! : formulaMedia;

		if (this.nota > 10) this.calcularMediaSimulada(this.mediaN1, terceiraNota!);
	}

	aplicarPontos() {
		const pontos = this.pointsArray.value;
		let p1 = this.notaForm.value.primeiraNota!;
		let p2 = this.notaForm.value.segundaNota!;
		let p3 = this.notaForm.value.terceiraNota;
		let p4 = this.notaForm.value.quartaNota;
		this.hasTerceira = p3 !== null && p3 !== undefined;
		this.hasQuarta = p4 !== null && p4 !== undefined;

		if (pontos[0]) (p1 > p2) ? p1++ : p2++;
		if (pontos[1]) (this.hasTerceira && this.hasQuarta)
				? ((p3! > p4!) ? p3!++ : p4!++)
				:  p3!++;
		if (pontos[2]) { p1++; p2++; }
		if (pontos[3] && this.hasTerceira) p3!+=2;
		// if (pontos[3]) p3 = (p3 ?? 0) + 2;

		return { p1, p2, p3, p4 };
	}

	calcularMediaSimulada(mediaN1: number, terceiraNota?: number) {
		this.mediaSimuladaMax = (this.hasTerceira) ? ((mediaN1 + (((terceiraNota! + 10) / 2) * 3)) / 5) : ((mediaN1 + 30) / 5);
		this.isAFMax = this.mediaSimuladaMax >= 3;
		if (this.isAFMax) this.notaAFMax = 10 - this.mediaSimuladaMax;

		this.mediaSimuladaMin = (this.hasTerceira) ? ((mediaN1 + (((terceiraNota!) / 2) * 3)) / 5) : (mediaN1 / 5);
		this.isAFMin = Number.parseInt(this.mediaSimuladaMin.toFixed(1)) >= 3;
		if (this.isAFMin) {
			this.notaAFMin = 10 - this.mediaSimuladaMin;
		} else {
			this.notaNecessariaParaAF = (this.hasTerceira) ? (((15 - mediaN1)/3)*2) - terceiraNota! : (15 - mediaN1)/3;
		}
	}

	getErroTratado(formControlName: string): string | null {
		const control = this.notaForm.get(formControlName);

		if (!control?.touched) return null;
		if (control.hasError('required')) return 'Esse campo é obrigatório';
		if (control.hasError('min')) return 'O valor não pode ser menor que 0';
		if (control.hasError('max')) return 'O valor não pode ser maior que 10';

		return null;
	}

	get isQuartaProvaSelected(): boolean {
		const selectedOption = this.notaForm.controls.notaEsperada.value;
		return selectedOption?.name === 'Quarta prova';
	}

	get isAFSelected(): boolean {
		const selectedOption = this.notaForm.controls.notaEsperada.value;
		return selectedOption?.name === 'AF';
	}

	updateValidators(): void {
		const terceiraNotaControl = this.notaForm.controls.terceiraNota;
		const quartaNotaControl = this.notaForm.controls.quartaNota;
		const mediasControl = this.notaForm.controls.mediaEsperada;
		this.nota = null;

		if (!this.isQuartaProvaSelected && !this.isAFSelected) {
			terceiraNotaControl.clearValidators();
			terceiraNotaControl.setValue(null, { emitEvent: false });
			quartaNotaControl.clearValidators();
			quartaNotaControl.setValue(null, { emitEvent: false });
			mediasControl.clearValidators();
			mediasControl.setValue(this.medias[0], { emitEvent: false });

			terceiraNotaControl.updateValueAndValidity();
			quartaNotaControl.updateValueAndValidity();
			mediasControl.updateValueAndValidity();
			return;
		}

		terceiraNotaControl.setValidators([
			Validators.required,
			Validators.min(0),
			Validators.max(10),
		]);

		if (this.isAFSelected) {
			quartaNotaControl.setValidators([
				Validators.required,
				Validators.min(0),
				Validators.max(10),
			]);
			mediasControl.clearValidators();
			mediasControl.setValue(null, { emitEvent: false });
		} else {
			quartaNotaControl.clearValidators();
			quartaNotaControl.setValue(null, { emitEvent: false });
			mediasControl.clearValidators();
			mediasControl.setValue(this.medias[0], { emitEvent: false });
		}

		terceiraNotaControl.updateValueAndValidity();
		quartaNotaControl.updateValueAndValidity();
		mediasControl.updateValueAndValidity();
	}
}
