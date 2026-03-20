import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ReactiveFormsModule, FormControl, FormGroup, Validators, FormsModule, FormArray, } from '@angular/forms';

import { TuiButton, TuiLabel, TuiTextfield, TuiTitle, TuiError, TuiHint, TuiIcon } from '@taiga-ui/core';
import { TuiCheckbox, TuiInputNumber, TuiRadio, TuiRadioList, TuiTooltip } from '@taiga-ui/kit';
import { TuiForm, TuiHeader } from '@taiga-ui/layout';
import { startWith } from 'rxjs';
import { Choice, MediaOption, IResultado } from '../../interfaces/interfaces';
import { State } from '../../classes/State';

@Component({
	selector: 'app-calculadora',
	standalone: true,
	imports: [
		ReactiveFormsModule, FormsModule, TuiForm, TuiHeader, TuiError, TuiButton, TuiHint, TuiLabel, TuiTextfield, TuiTitle, TuiInputNumber, TuiRadio, TuiRadioList, TuiCheckbox, TuiIcon, TuiTooltip,
	],
	templateUrl: './calculadora.component.html',
})
export class CalculadoraComponent implements OnInit {
	state: State = new State();
	provaLabel: string = 'Quarta prova';
	result: IResultado | null = null;

	readonly choices: Choice[] = [
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

	readonly points: string[] = [
		'Um ponto na menor nota da N1',
		'Um ponto na menor nota da N2',
		'Um ponto na média da N1',
		'Um ponto na média da N2'
	];

	readonly medias: MediaOption[] = [
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

	get pointsArray() { return this.notaForm.controls.points as FormArray<FormControl<boolean>>; }
	get isQuartaProvaSelected() { return this.notaForm.controls.notaEsperada.value?.name === 'Quarta prova'; }
	get isAFSelected() { return this.notaForm.controls.notaEsperada.value?.name === 'AF'; }

	getClassColor(nota: number): string {
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

	arredondarNota(n: number | null): number | null { return (n == null) ? null : Math.ceil(n * 10) / 10 }
	arredondarCampos(obj: any, chaves: string[]) {
		chaves.forEach(key => {
			const valor = obj[key];
			if (typeof valor === 'number' || valor === null) {
				obj[key] = this.arredondarNota(valor);
			}
		});
	}

	resultado(): IResultado {
		const s = this.state;

		this.arredondarCampos(s.af, ['precisa', 'max', 'min', 'mediaMin']);
    	this.arredondarCampos(s, ['nota', 'mediaN2', 'mediaFinal']);
		s.mediaN1 = this.arredondarNota(s.mediaN1) ?? 0;

		if (this.isAFSelected) {
			if (s.af.precisa! > 7) return { titulo: `Infelizmente você não tem direito a AF por ter uma média (${s.nota}) menor que 3` };

			return s.af.precisa
				? { titulo: `Você precisa de ${s.af.precisa} na AF!` }
				: { titulo: `Parabéns, você foi aprovado!` };
		}

		if (s.aprovado) return { titulo: `Parabéns, você não precisa de mais pontos por ter média suficiente!` };
		if (s.nota! <= 10) return { titulo: `Você precisa de ${s.nota} na ${this.provaLabel}` };

		return {
			titulo: `Você já está de AF. Análises da ${this.provaLabel}:`,
			detalhe: [
				`Ao tirar 10, precisará de ${s.af.max} na AF.`,

				s.af.isMin
					? `Ao zerar, precisará de ${s.af.min} na AF.`
					: `Ao zerar, não terá direito a AF por ter uma média (${s.af.mediaMin}) menor que 3.`,

				s.af.precisa ? `Ao tirar ${s.af.precisa} terá direito a AF.` : '',
			]
		};
	}

	@ViewChild('formularioSection') formularioSection?: ElementRef;
	clear() {
		this.result = null;
		setTimeout(() => { this.formularioSection?.nativeElement.scrollIntoView({ behavior: 'smooth', block: 'start' }) }, 100);
	}

	@ViewChild('resultadoSection') resultadoSection?: ElementRef;
	calcularNota() {
		const notaForm = this.notaForm.value;
		this.state.atribuirNotas([
			notaForm.primeiraNota as number,
			notaForm.segundaNota as number,
			notaForm.terceiraNota as number,
			notaForm.quartaNota as number,
		]);
		(this.state.atribuido) ? this.state.aplicarPontos(this.pointsArray.value, this.isAFSelected) : console.error('Erro ao tentar aplicar pontos sem haver notas cadastradas');

		const s = this.state;
		s.aprovado = false;
		s.af.precisa = null;
		s.media = this.notaForm.value.mediaEsperada?.media ?? 7;

		if (this.isAFSelected) {
			s.mediaFinal = (2 * s.mediaN1 + 3 * s.mediaN2!) / 5;
			s.nota = s.mediaFinal;

			if (s.mediaFinal < s.media) {
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

		const formula = ((s.media * 5) - 2 * s.mediaN1) / 3;
		s.nota = this.isQuartaProvaSelected ? (formula * 2) - s.notas.p3 : formula - s.notas.p3;

		if (s.nota <= 0) {
			s.calcularMedias();
			s.mediaFinal = (2 * s.mediaN1 + 3 * s.mediaN2!) / 5;
			s.aprovado = true;

		} else if (s.nota > 10) s.calcularMediaSimulada(this.isQuartaProvaSelected);
		this.result = this.resultado();

		setTimeout(() => {
			this.resultadoSection?.nativeElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
		}, 100);
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
			terceira.reset();
			quarta.clearValidators();
			quarta.reset();
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
