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

	resetarEstado() {
		this.aprovado = false;
		this.atribuido = false;
		this.af.precisa = null;
		this.mediaN2 = null;
		this.mediaFinal = null;
	}

	atribuirNotas(notes: readonly (number | null)[]): void {
		this.notas.p1 = notes[0] ?? 0;
		this.notas.p2 = notes[1] ?? 0;
		this.notas.p3 = notes[2] ?? 0;
		this.notas.p4 = notes[3] ?? 0;
		this.atribuido = true;
	}

	calcularMedias() {
		const n = this.notas;
		this.mediaN1 = (n.p1 + n.p2) / 2;
		this.mediaN2 = (n.p3 + n.p4) / 2;
		this.mediaFinal = (2 * this.mediaN1 + 3 * this.mediaN2) / 5;
	}

	distribuirMedia(n1: number, n2: number): [number, number] {
		let notaMaior = Math.max(n2, n1);
		let notaMenor = Math.min(n2, n1);

		const podeReceber = Math.min(1, 10 - notaMaior);
		notaMaior = this.ponto(notaMaior, podeReceber);
		notaMenor = this.ponto(notaMenor, (2 - podeReceber));

		return [notaMaior, notaMenor];
	}

	ponto = (x: number, qnt: number = 1): number => Math.min(x + qnt, 10);
	aplicarMenor = (a: number, b: number): [number, number] => (a > b) ? [a, this.ponto(b)] : [this.ponto(a), b];

	aplicarPontos(points: readonly (boolean | null)[]): void {
		const [b1, b2, b3, b4] = points;
		const n = this.notas;

		/* Pontuações */
		if (b1) [n.p1, n.p2] = this.aplicarMenor(n.p1, n.p2); // Um ponto na menor nota da N1
		if (b3) [n.p1, n.p2] = this.distribuirMedia(n.p1, n.p2); // Um ponto na média da N1

		if (b2) [n.p3, n.p4] = this.aplicarMenor(n.p3, n.p4); // Um ponto na menor nota da N2
		if (b4) [n.p3, n.p4] = this.distribuirMedia(n.p3, n.p4); // Um ponto na média da N2

		this.calcularMedias();
	}

	calcularMediaSimulada(isQuartaProvaSelected: boolean, terceiraNota = this.notas.p3, points: readonly (boolean | null)[] = []): void {
		let aux = this.mediaN1 * 2;
		const mediaN2Atual = (this.notas.p3 + this.notas.p4) / 2;
		let [p3Simulada, p4Simulada] = [terceiraNota, 10];
		if (isQuartaProvaSelected) {
			if (points[1]) [p3Simulada, p4Simulada] = this.aplicarMenor(p3Simulada, p4Simulada);
			if (points[3]) [p3Simulada, p4Simulada] = this.distribuirMedia(p3Simulada, p4Simulada);
		}
		const mediaN2Max = isQuartaProvaSelected ? (p3Simulada + p4Simulada) / 2 : 10;
		this.af.mediaMax = isQuartaProvaSelected
			? (aux + (mediaN2Max * 3)) / 5
			: (aux + 30) / 5;

		const mediaMaxArredondada = Math.round((this.af.mediaMax + Number.EPSILON) * 10) / 10;
		this.af.isMax = mediaMaxArredondada >= 3;
		if (this.af.isMax) this.af.max = 10 - mediaMaxArredondada;

		this.af.mediaMin = (aux + (mediaN2Atual * 3)) / 5;

		const mediaMinArredondada = Math.round((this.af.mediaMin + Number.EPSILON) * 10) / 10;
		this.af.isMin = mediaMinArredondada >= 3;
		if (this.af.isMin) {
			this.af.min = 10 - mediaMinArredondada;

		} else {
			this.af.precisa = isQuartaProvaSelected
				? (((15 - aux) / 3) * 2) - this.notas.p3 - this.notas.p4
				: ((15 - aux) / 3) - mediaN2Atual;
		}
	}
}
