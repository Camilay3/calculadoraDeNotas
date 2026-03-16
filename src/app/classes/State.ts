import { IAF, INotas } from "../interfaces/interfaces";

export class State {
	media: number = 7;
	nota: number | null = null;
	mediaN1: number = 0;
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
	};
	notas: INotas = { p1: 0, p2: 0, p3: 0, p4: 0 };
	atribuido: boolean = false;

	atribuirNotas(notes: number[]) {
		this.notas.p1 = notes[0] ?? 0;
		this.notas.p2 = notes[1] ?? 0;
		this.notas.p3 = notes[2] ?? 0;
		this.notas.p4 = notes[3] ?? 0;
		this.atribuido = true;
	}

	aplicarPontos(points: boolean[], isAFSelected: boolean) {
		const [b1, b2, b3, b4] = points;
		const n = this.notas;
		this.calcularMedias();

		const addMenor = (a: number, b: number): [number, number] => (a > b) ? [a, ponto(b)] : [ponto(a), b];
		const aplicarMenor = (a: number, b: number): [number, number] => (a + b <= 20) ? addMenor(a, b) : [a, b];
		const ponto = (x: number, qnt: number = 1): number => Math.min(x + qnt, 10);

		/* Pontuações */
		if (b1) [n.p1, n.p2] = aplicarMenor(n.p1, n.p2); // Um ponto na menor nota da N1
		if (b3) this.mediaN1 = ponto(this.mediaN1); // Um ponto na média da N1

		if (isAFSelected) {
			if (b2) [n.p3, n.p4] = aplicarMenor(n.p3, n.p4); // Um ponto na menor nota da N2
			if (b4) this.mediaN2 = ponto(this.mediaN2!); // Um ponto na média da N2

		} else {
			if (b2) n.p3 = ponto(n.p3);
			if (b4) n.p3 = ponto(n.p3, 2);
		}

		this.calcularMedias();
	}

	calcularMediaSimulada(isQuartaProvaSelected: boolean) {
		let aux = this.mediaN1 * 2;
		this.af.mediaMax = isQuartaProvaSelected
			? (aux + (((this.notas.p3 + 10) / 2) * 3)) / 5
			: (aux + 30) / 5;

		this.af.isMax = this.af.mediaMax >= 3;
		if (this.af.isMax) this.af.max = 10 - this.af.mediaMax;

		this.af.mediaMin = isQuartaProvaSelected
			? (aux + ((this.notas.p3 / 2) * 3)) / 5
			: aux / 5;

		this.af.isMin = this.af.mediaMin >= 3;
		if (this.af.isMin) {
			this.af.min = 10 - this.af.mediaMin;

		} else {
			this.af.precisa = isQuartaProvaSelected
				? (((15 - aux) / 3) * 2) - this.notas.p3
				: (15 - aux) / 3;
		}
	}

	calcularMedias() {
		const n = this.notas;
		this.mediaN1 = (n.p1 + n.p2) / 2;
		this.mediaN2 = (n.p3 + n.p4) / 2;
	}
}
