// Not doing lib again

import { assert } from "$std/assert/assert.ts";

import { List, Range, Seq } from "$immutable/mod.ts";

import * as R from "$ramda/mod.ts";

type Grid = List<List<string>>;

async function readInput(file: string): Promise<string[]> {
	const out = await Deno.readTextFile(`./day13/${file}`);
	return out.split("\n\n");
}

function flip(char?: string): string {
	switch (char) {
		case ".":
			return "#";
		case "#":
			return ".";
		default:
			throw Error(char);
	}
}

function smudge(grid: Grid): Seq.Indexed<Grid> {
	const rows = Range(0, grid.size);
	const cols = Range(0, grid.first(List()).size);
	const pairs = rows.flatMap((r: number) => cols.map((c: number) => [r, c]));
	return pairs.map(([r, c]) => grid.update(r, (row) => row?.update(c, flip) ?? List()));
}

function parseGrid(gridStr: string): Grid {
	const rows = gridStr.split("\n");
	return List(rows.map((row) => List(row.split(""))));
}

function findMirror(grid: Grid, old?: number): number {
	const horizontal = findMirrorHorizontal(grid, old && old >= 100 ? old / 100 : undefined);
	const vertical = findMirrorVertical(grid, old);
	return 100 * horizontal + vertical;
}

function findMirrorHorizontal(grid: Grid, old?: number): number {
	for (let i = 1; i < grid.size; i++) {
		const sliceTop = grid.slice(0, i).reverse();
		const sliceBottom = grid.slice(i);
		const sliceLength = Math.min(sliceTop.size, sliceBottom.size);

		if (i != old && sliceTop.slice(0, sliceLength).equals(sliceBottom.slice(0, sliceLength))) {
			return i;
		}
	}
	return 0;
}

function findMirrorVertical(grid: Grid, old?: number): number {
	return findMirrorHorizontal(pivotGrid(grid), old);
}

function pivotGrid(grid: Grid): Grid {
	// Create new structure
	const newGrid: Grid = List<List<string>>().asMutable();
	for (let i = 0; i < grid.get(0, List()).size; i++) {
		const newRow = List<string>().asMutable();
		for (let j = 0; j < grid.size; j++) {
			newRow.set(j, grid.get(j)?.get(i) ?? "");
		}
		newGrid.set(i, newRow.asImmutable());
	}
	return newGrid.asImmutable();
}

async function run(inputPath: string): Promise<number> {
	const input = await readInput(inputPath);
	const results = input.map((gridStr) => findMirror(parseGrid(gridStr)));
	return R.sum(results);
}

async function run2(inputPath: string): Promise<number> {
	const input = await readInput(inputPath);
	const results = input.map((gridStr) => {
		const parsed = parseGrid(gridStr);
		const old = findMirror(parsed);
		return smudge(parsed).map((g) => findMirror(g, old)).filter((v) => v != 0 && v != old).first() || old;
	});
	return R.sum(results);
}

const test = await run("test");
assert(test == 405, `${test} != 405`);
console.log("OK");
const result = await run("input");
console.log(result);

const test2 = await run2("test");
assert(test2 == 400, `${test2} != 400`);
console.log("OK");
const result2 = await run2("input");
console.log(result2);
