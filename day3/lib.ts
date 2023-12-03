import * as R from "$ramda/mod.ts";

type Point = string; // 'Row, Col',

class PartCandidate {
	readonly partNumber: number;
	readonly row: number;
	readonly start: number;
	readonly length: number;
	private _adjacentPoints!: Set<Point>;

	constructor(partNumber: number, row: number, start: number, length: number) {
		this.partNumber = partNumber;
		this.row = row;
		this.start = start;
		this.length = length;
	}

	end(): number {
		return this.start + this.length - 1;
	}

	adjacentPoints(): Set<Point> {
		if (this._adjacentPoints) {
			return this._adjacentPoints;
		}
		const points: Point[] = [`${this.row},${this.start - 1}`, `${this.row},${this.start + this.length}`];
		const rowBefore = R.repeat(this.row - 1, this.length + 2);
		const rowAfter = R.repeat(this.row + 1, this.length + 2);
		const columns = R.map(R.add(this.start - 1), R.times(R.identity, this.length + 2));

		points.push(...R.map(R.join(","), R.zip(rowBefore, columns)));
		points.push(...R.map(R.join(","), R.zip(rowAfter, columns)));

		this._adjacentPoints = new Set(points);
		return this._adjacentPoints;
	}
}

class Schematic {
	readonly lines: string[];

	constructor(input: string) {
		this.lines = input.split("\n");
	}

	findPartCandidates(): PartCandidate[] {
		const re = /\d+/g;

		const parts: PartCandidate[] = [];

		this.lines.forEach((row, idx) => {
			for (const match of row.matchAll(re)) {
				const number = match[0];
				const start = match.index;
				const length = number.length;
				parts.push(new PartCandidate(parseInt(number), idx, start ?? 0, length));
			}
		});
		return parts;
	}

	findSymbols(): Set<Point> {
		const re = /[^0-9.]/g;
		const points: Point[] = [];

		this.lines.forEach((row, idx) => {
			for (const match of row.matchAll(re)) {
				const col = match.index ?? 0;
				const point: Point = `${idx},${col}`;
				points.push(point);
			}
		});
		return new Set(points);
	}

	findGearCandidatess(): Set<Point> {
		const re = /\*/g;
		const points: Point[] = [];

		this.lines.forEach((row, idx) => {
			for (const match of row.matchAll(re)) {
				const col = match.index ?? 0;
				const point: Point = `${idx},${col}`;
				points.push(point);
			}
		});
		return new Set(points);
	}
}

function readInput(): Promise<string> {
	return Deno.readTextFile("./day3/input");
}

function partsNextToSymbol(part: PartCandidate, symbols: Set<Point>): boolean {
	const adjacent = part.adjacentPoints();
	for (const p of adjacent) {
		if (symbols.has(p)) {
			return true;
		}
	}
	return false;
}

export async function findParts(): Promise<number> {
	const input = await readInput();
	const schematic = new Schematic(input);
	const partsCandidates = schematic.findPartCandidates();
	const symbols = schematic.findSymbols();
	const partsCheck = (pc: PartCandidate): boolean => partsNextToSymbol(pc, symbols);
	const parts = R.filter(partsCheck, partsCandidates);

	return R.sum(R.pluck("partNumber", parts));
}

export async function getGears(): Promise<number> {
	const input = await readInput();
	const schematic = new Schematic(input);
	const partsCandidates = schematic.findPartCandidates();
	const gearCandidates = schematic.findGearCandidatess();
	const partsCheck = (pc: PartCandidate): boolean => partsNextToSymbol(pc, gearCandidates);
	const parts: PartCandidate[] = R.filter(partsCheck, partsCandidates);
	let sumOfGearRatios = 0;
	const gearCheck = (gear: Point) => (part: PartCandidate) => part.adjacentPoints().has(gear);
	for (const gear of gearCandidates) {
		const partsAdjacent = R.filter(gearCheck(gear), parts);
		if (partsAdjacent.length === 2) {
			sumOfGearRatios += partsAdjacent[0].partNumber * partsAdjacent[1].partNumber;
		}
	}
	return sumOfGearRatios;
}
