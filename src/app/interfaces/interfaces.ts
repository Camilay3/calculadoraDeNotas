export interface Choice {
	name: 'Quarta prova' | 'N2' | 'AF';
	description: string;
}

export interface MediaOption {
	name: string;
	description: string;
	media: number;
}

export interface IAF {
	max: number | null,
	min: number | null,
	mediaMax: number | null,
	mediaMin: number | null,
	precisa: number | null,
	isMax: boolean,
	isMin: boolean,
}

export interface INotas {
	p1: number,
	p2: number,
	p3: number,
	p4: number,
}

export interface IResultado {
	titulo: string,
	detalhe?: string[],
}
