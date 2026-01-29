import { Component, OnInit } from '@angular/core';
import { ReactiveFormsModule, FormControl, FormGroup, Validators, FormsModule, FormArray, } from '@angular/forms';
// import { RouterLink } from '@angular/router';

import { TuiButton, TuiLabel, TuiTextfield, TuiTitle, TuiError, TuiHint, TuiIcon } from '@taiga-ui/core';
import { TuiCheckbox, TuiInputNumber, TuiRadio, TuiRadioList, TuiTooltip } from '@taiga-ui/kit';
import { TuiForm, TuiHeader } from '@taiga-ui/layout';
import { startWith } from 'rxjs';
import { IAF, Choice, MediaOption, IResultado } from '../../interfaces/interfaces';

class State {
	media: number = 7;
	nota: number | null = null;
	mediaN1: number | null = null;;
	mediaN2: number | null = null;
	mediaFinal: number | null = null;
	aprovado: boolean = false;
	af: IAF = {
		max: null,
		min: null,
		mediaMax: null,
		mediaMin: null,
		precisa: null,
		isMax: false,
		isMin: false,
	}
}

@Component({
	selector: 'app-calculadora',
	standalone: true,
	imports: [
		ReactiveFormsModule, FormsModule, TuiForm, TuiHeader, TuiError, TuiButton, TuiHint, TuiLabel, TuiTextfield, TuiTitle, TuiInputNumber, TuiRadio, TuiRadioList, TuiCheckbox, TuiIcon, TuiTooltip,
		// RouterLink,
	],
	templateUrl: './calculadora.component.html',
	// styleUrl: './calculadora.component.scss',
})
export class CalculadoraComponent implements OnInit {
	state: State = new State();
	provaLabel: string = 'Quarta prova';
	result: IResultado | null = null;

	protected readonly choices: Choice[] = [
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

	protected readonly points: string[] = [
		'Um ponto na menor nota da N1',
		'Um ponto na menor nota da N2',
		'Um ponto na média da N1',
		'Um ponto na média da N2'
	];

	protected readonly medias: MediaOption[] = [
		{ name: 'Padrão', description: 'Calcula a média como 7', media: 7 },
		{ name: 'Conceito B', description: 'Calcula a média como 6', media: 6 },
		{ name: 'Conceito C', description: 'Calcula a média como 5', media: 5 },
	];

	readonly notaForm = new FormGroup({
		primeiraNota: new FormControl<number | null>(null, [Validators.required, Validators.min(0), Validators.max(10)]),
		segundaNota: new FormControl<number | null>(null, [Validators.required, Validators.min(0), Validators.max(10)]),
		terceiraNota: new FormControl<number | null>(null),
		quartaNota: new FormControl<number | null>(null),

		notaEsperada: new FormControl<Choice | null>(this.choices[0], Validators.required),
		mediaEsperada: new FormControl<MediaOption | null>(this.medias[0]),

		points: new FormArray(this.points.map(() => new FormControl(false))),
	});

	ngOnInit() {
		this.notaForm.controls.notaEsperada.valueChanges
			.pipe(startWith(this.notaForm.controls.notaEsperada.value))
			.subscribe(v => {
				this.provaLabel = v?.name ?? 'Quarta prova';
				this.updateValidators();
			});
	}

	getClassColor(nota: number): string {
		nota = Number.parseInt(nota.toFixed(1));

		if (nota < 0) return 'text-neutral-500';
		if (nota < 3) return 'text-red-500';
		if (nota < 7) return 'text-yellow-500';
		return 'text-green-500';
	}

	getStateColor(status: boolean): string | null {
		if (status) return `bg-green-100 text-green-900`;
		if (this.isAFSelected && this.state.af.precisa! > 7) return `bg-red-100 text-red-900`;
		if (this.state.nota! > 10) return `bg-yellow-100 text-yellow-900`;
		return null;
	}

	getState(status: boolean): string | null {
		if (status) return 'Aprovado'
		if (this.isAFSelected && this.state.af.precisa! > 7) return 'Reprovado'
		if (this.state.nota! > 10) return 'Prova Final';
		return null;
	}

	get pointsArray() { return this.notaForm.controls.points as FormArray<FormControl<boolean>>; }
	get isQuartaProvaSelected() { return this.notaForm.controls.notaEsperada.value?.name === 'Quarta prova'; }
	get isAFSelected() { return this.notaForm.controls.notaEsperada.value?.name === 'AF'; }

	resultado(): IResultado {
		const s = this.state;
		// if (s.nota == null) return null;

		if (this.isAFSelected) {
			if (s.af.precisa! > 7) return { titulo: `Infelizmente você não tem direito a AF por ter uma média (${s.nota!.toFixed(1)}) menor que 3` };

			return s.af.precisa
				? { titulo: `Você precisa de ${s.af.precisa.toFixed(1)} na AF!` }
				: { titulo: `Parabéns, você foi aprovado!` };
		}

		if (s.aprovado) return { titulo: `Parabéns, você não precisa de mais pontos por ter média suficiente!` };
		if (s.nota! <= 10) return { titulo: `Você precisa de ${s.nota!.toFixed(1)} na ${this.provaLabel}` };

		return {
			titulo: `Você já está de AF. Análises da ${this.provaLabel}:`,
			detalhe: [
				`Ao tirar 10, precisará de ${s.af.max?.toFixed(1)} na AF.`,

				s.af.isMin
					? `Ao zerar, precisará de ${s.af.min?.toFixed(1)} na AF.`
					: `Ao zerar, não terá direito a AF por ter uma média (${s.af.mediaMin?.toFixed(1)}) menor que 3.`,

				s.af.precisa ? `Ao tirar ${s.af.precisa.toFixed(1)} terá direito a AF.` : '',
			]
		};
	}

	calcularNota() {
		const { p1, p2, p3, p4 } = this.aplicarPontos();
		const media = this.notaForm.value.mediaEsperada?.media ?? 7;
		const s = this.state;
		s.aprovado = false;
		s.af.precisa = null;

		s.media = media;
		s.mediaN1 = p1 + p2;

		if (this.isAFSelected) {
			s.mediaN2 = (p3! + p4!) / 2;
			s.mediaFinal = (s.mediaN1 + 3 * s.mediaN2) / 5;
			s.nota = s.mediaFinal;

			if (s.mediaFinal < media) {
				s.af.precisa = 10 - s.mediaFinal;
			} else {
				s.aprovado = true;
			}
			this.result = this.resultado();
			return;

		} else {
			s.mediaN2 = null;
			s.mediaFinal = null;
		}

		const formula = ((media * 5) - s.mediaN1) / 3;
		s.nota = this.isQuartaProvaSelected ? (formula * 2) - p3! : formula;

		if (s.nota <= 0) {
			s.mediaN2 = p3!/2;
			s.mediaFinal = (s.mediaN1 + 3 * s.mediaN2) / 5;
			s.aprovado = true;
		}
		if (s.nota > 10) this.calcularMediaSimulada(s.mediaN1, p3!);
		this.result = this.resultado();
	}

	aplicarPontos() {
		const [b1, b2, b3, b4] = this.pointsArray.value;

		let p1 = this.notaForm.value.primeiraNota!;
		let p2 = this.notaForm.value.segundaNota!;
		let p3 = this.notaForm.value.terceiraNota;
		let p4 = this.notaForm.value.quartaNota;

		if (b1) (p1 > p2 ? p2++ : p1++);
		if (b2 && p3 != null) (p4 != null ? (p3 > p4 ? p4++ : p3++) : p3++);
		if (b3) { p1++; p2++; }
		if (b4 && p3 != null) p3 += 2;

		return { p1, p2, p3, p4 };
	}

	calcularMediaSimulada(mediaN1: number, terceiraNota?: number) {
		const s = this.state;

		s.af.mediaMax = this.isQuartaProvaSelected
			? (mediaN1 + (((terceiraNota! + 10) / 2) * 3)) / 5
			: (mediaN1 + 30) / 5;

		s.af.isMax = s.af.mediaMax >= 3;
		if (s.af.isMax) s.af.max = 10 - s.af.mediaMax;

		s.af.mediaMin = this.isQuartaProvaSelected
			? (mediaN1 + ((terceiraNota! / 2) * 3)) / 5
			: mediaN1 / 5;

		s.af.isMin = s.af.mediaMin >= 3;
		if (s.af.isMin) {
			s.af.min = 10 - s.af.mediaMin;
		} else {
			s.af.precisa = this.isQuartaProvaSelected
				? (((15 - mediaN1) / 3) * 2) - terceiraNota!
				: (15 - mediaN1) / 3;
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

	updateValidators() {
		const terceira = this.notaForm.controls.terceiraNota;
		const quarta = this.notaForm.controls.quartaNota;
		const media = this.notaForm.controls.mediaEsperada;

		this.state.nota = null;

		if (!this.isQuartaProvaSelected && !this.isAFSelected) {
			terceira.clearValidators();
			quarta.clearValidators();
			media.setValue(this.medias[0], { emitEvent: false });

		} else {
			terceira.setValidators([Validators.required, Validators.min(0), Validators.max(10)]);

			if (this.isAFSelected) {
				quarta.setValidators([Validators.required, Validators.min(0), Validators.max(10)]);
				media.setValue(null, { emitEvent: false });
			} else {
				quarta.clearValidators();
				media.setValue(this.medias[0], { emitEvent: false });
			}
		}

		terceira.updateValueAndValidity();
		quarta.updateValueAndValidity();
		media.updateValueAndValidity();
	}
}
