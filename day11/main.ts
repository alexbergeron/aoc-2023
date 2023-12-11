// Not doing lib again

import { assert } from "$std/assert/assert.ts";
import * as R from "$ramda/mod.ts";
import { Set } from "$immutable/mod.ts";

type Position = [number, number];

async function readInput(file: string): Promise<string[][]> {
	const out = await Deno.readTextFile(`./day11/${file}`);
	return out.split("\n").map((line) => line.split(""));
}

function expandUniverse(universe: string[][]): string[][] {
	const emptyColumnIndexes = universe.map(findEmptyColumns);
	const emptyColumns: Set<number> = Set(R.reduce(R.intersection, emptyColumnIndexes[0], emptyColumnIndexes));
	const duplicateOnRows = (row: string[]) => {
		const updatedRow = R.addIndex(R.chain)(
			(val: string, idx: number) => emptyColumns.contains(idx) ? [val, val] : [val],
			row,
		);
		return R.all(R.equals("."))(updatedRow) ? [updatedRow, updatedRow] : [updatedRow];
	};
	return R.chain(duplicateOnRows, universe);
}

function findEmptyColumns(row: string[]): number[] {
	const inner = (acc: number[], val: string, idx: number) => {
		if (val == ".") {
			acc.push(idx);
		}
		return acc;
	};
	return R.addIndex(R.reduce)(inner, [], row);
}

function findAllGalaxies(universe: string[][]): Position[] {
	const galaxies: Position[] = [];
	for (let row = 0; row < universe.length; row++) {
		for (let col = 0; col < universe[row].length; col++) {
			if (universe[row][col] == "#") {
				galaxies.push([row, col]);
			}
		}
	}

	return galaxies;
}

function allGalaxyPairs(galaxies: Position[]): [Position, Position][] {
	const out: [Position, Position][] = [];
	for (let i = 0; i < galaxies.length - 1; i++) {
		for (let j = i + 1; j < galaxies.length; j++) {
			out.push([galaxies[i], galaxies[j]]);
		}
	}
	return out;
}

function findDistance(pos1: Position, pos2: Position): number {
	const [row1, col1] = pos1;
	const [row2, col2] = pos2;
	return Math.abs(row1 - row2) + Math.abs(col1 - col2);
}

async function run(inputPath: string, expansion: number): Promise<number> {
	const universe = await readInput(inputPath);
	const expanded = expandUniverse(universe);
	const galaxies = findAllGalaxies(expanded);
	const galaxyPairs = allGalaxyPairs(galaxies);
	const distances = R.map(([p1, p2]: [Position, Position]) => findDistance(p1, p2), galaxyPairs);
	return R.reduce(R.add, 0, distances);
}

const test = await run("test", 2);
assert(test == 374, `${test} != 374`);
const result = await run("input", 2);
console.log(result);

const test2 = await run("test", 10);
assert(test2 == 1030, `${test2} != 1030`);
const test3 = await run("test", 100);
assert(test3 == 8410, `${test3} != 8410`);
const result2 = await run("input", 1000000);
console.log(result2);
