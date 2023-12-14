// Not doing lib again

import { assert } from "$std/assert/assert.ts";
import { List, Map } from "$immutable/mod.ts";

import * as R from "$ramda/mod.ts";

type Grid = List<List<string>>;

async function readInput(file: string): Promise<Grid> {
	const out = await Deno.readTextFile(`./day14/${file}`);
	return parseGrid(out);
}

function parseGrid(grid: string): Grid {
	return List(grid.split("\n").map((line) => List(line.split(""))));
}

function rollNorth(grid: Grid): Grid {
	const width = grid.get(0, List()).size;
	const out = grid.withMutations((g) => {
		for (let i = 0; i < width; i++) {
			let j = 0, k = 1;
			while (k < g.size) {
				const jValue = g.get(j)?.get(i);
				const kValue = g.get(k)?.get(i);
				if (jValue == ".") {
					switch (kValue) {
						case "O":
							g.update(j, List(), (row) => row?.set(i, "O"));
							g.update(k, List(), (row) => row?.set(i, "."));
							j++;
							break;
						case "#":
							j = k;
							break;
					}
				} else {
					j++;
				}
				k++;
			}
		}
	});
	return out;
}

function rotate(grid: Grid): Grid {
	const newGrid = List<List<string>>().withMutations((newGrid) => {
		for (let i = 0; i < grid.get(0, List())?.size; i++) {
			newGrid.push(grid.map((row) => row.get(i) ?? "").reverse());
		}
		return newGrid;
	});
	return newGrid;
}

function weight(grid: Grid): number {
	const rowWeight = grid.map((row, idx) => (grid.size - idx) * row.count(R.equals("O")));
	return R.sum(rowWeight.toArray());
}

function printGrid(grid: Grid) {
	grid.forEach((row) => console.log(row.join("")));
	console.log();
}

async function run(inputPath: string): Promise<number> {
	const grid = await readInput(inputPath);
	const rolled = rollNorth(grid);
	printGrid(rolled);
	return weight(rolled);
}

async function run2(inputPath: string): Promise<number> {
	const end = 4000000000;
	let grid = await readInput(inputPath);
	let pastValues = Map<number, Grid>();
	for (let i = 0; i < end; i++) {
		if (i > 0 && i % 4 == 0) {
			const cycle = pastValues.keyOf(grid);

			if (cycle !== undefined) {
				const length = i - cycle;
				const offset = i - length;
				const remaining = end - cycle;
				console.log(
					`Cycle found from ${cycle} to ${i} (Length: ${length}, Offset: ${offset}, Remaining: ${remaining})`,
				);

				grid = pastValues.get(remaining % length + offset) ?? grid;

				break;
			} else {
				pastValues = pastValues.set(i, grid);
			}
		}
		grid = rollNorth(grid);
		grid = rotate(grid);
	}
	printGrid(grid);
	return weight(grid);
}

const test = await run("test");
assert(test == 136, `${test} != 136`);
console.log("OK");
const result = await run("input");
assert(result == 108826, `${result} != 108826`);

const test2 = await run2("test");
assert(test2 == 64, `${test2} != 64`);
console.log("OK");
const result2 = await run2("input");
console.log(result2);
