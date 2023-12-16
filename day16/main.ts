// Not doing lib again

// Grid is back
import { Grid, parseGrid } from "../lib/grid.ts";
import { assert } from "$std/assert/assert.ts";
import { delay } from "$std/async/delay.ts";
import { List, OrderedSet, Range, Record, RecordOf, Set } from "$immutable/mod.ts";
import * as R from "$ramda/mod.ts";

type Position = List<number>;
type BeamProps = { position: Position; direction: Position };
const Beam = Record({ position: List([0, 0]), direction: List([0, 1]) });
type Beam = RecordOf<BeamProps>;

async function readInput(file: string): Promise<Grid> {
	const out = await Deno.readTextFile(`./day16/${file}`);
	return parseGrid(out);
}

async function moveBeam(
	beam: Beam,
	grid: Grid,
	visited: Set<Beam> = Set(),
	next: OrderedSet<Beam> = OrderedSet(),
): Promise<Set<Beam>> {
	const [row, col] = beam.position;
	await delay(0);
	if (visited.contains(beam)) {
		const head = next.first();

		if (head === undefined) {
			return visited.add(beam);
		}

		return moveBeam(
			head,
			grid,
			visited.add(beam),
			next.rest(),
		);
	}

	const [dirRow, dirCol] = beam.direction;
	const nextCandidates = Set<Beam>().withMutations((tempNext) => {
		switch (grid.get(row)?.get(col)) {
			case ".": {
				const nextRow = row + dirRow;
				const nextCol = col + dirCol;
				if (nextRow >= 0 && nextRow < grid.size && nextCol >= 0 && nextCol < grid.get(0, List()).size) {
					tempNext.add(Beam({ position: List([nextRow, nextCol]), direction: beam.direction }));
				}
				break;
			}
			case "\\": {
				const nextRow = row + dirCol;
				const nextCol = col + dirRow;
				if (nextRow >= 0 && nextRow < grid.size && nextCol >= 0 && nextCol < grid.get(0, List()).size) {
					tempNext.add(Beam({ position: List([nextRow, nextCol]), direction: List([dirCol, dirRow]) }));
				}
				break;
			}
			case "/": {
				const nextRow = row - dirCol;
				const nextCol = col - dirRow;
				if (nextRow >= 0 && nextRow < grid.size && nextCol >= 0 && nextCol < grid.get(0, List()).size) {
					tempNext.add(Beam({ position: List([nextRow, nextCol]), direction: List([-dirCol, -dirRow]) }));
				}
				break;
			}
			case "-": {
				if (dirRow == 0) {
					// Acts as .
					const nextRow = row + dirRow;
					const nextCol = col + dirCol;
					if (nextRow >= 0 && nextRow < grid.size && nextCol >= 0 && nextCol < grid.get(0, List()).size) {
						tempNext.add(Beam({ position: List([nextRow, nextCol]), direction: beam.direction }));
					}
				} else {
					// Splits horizontally
					const nextRow = row;
					let nextCol = col - 1;
					if (nextRow >= 0 && nextRow < grid.size && nextCol >= 0 && nextCol < grid.get(0, List()).size) {
						tempNext.add(Beam({ position: List([nextRow, nextCol]), direction: List([0, -1]) }));
					}
					nextCol = col + 1;
					if (nextRow >= 0 && nextRow < grid.size && nextCol >= 0 && nextCol < grid.get(0, List()).size) {
						tempNext.add(Beam({ position: List([nextRow, nextCol]), direction: List([0, 1]) }));
					}
				}
				break;
			}
			case "|": {
				if (dirCol == 0) {
					// Acts as .
					const nextRow = row + dirRow;
					const nextCol = col + dirCol;
					if (nextRow >= 0 && nextRow < grid.size && nextCol >= 0 && nextCol < grid.get(0, List()).size) {
						tempNext.add(Beam({ position: List([nextRow, nextCol]), direction: beam.direction }));
					}
				} else {
					// Splits vertically
					let nextRow = row - 1;
					const nextCol = col;
					if (nextRow >= 0 && nextRow < grid.size && nextCol >= 0 && nextCol < grid.get(0, List()).size) {
						tempNext.add(Beam({ position: List([nextRow, nextCol]), direction: List([-1, 0]) }));
					}
					nextRow = row + 1;
					if (nextRow >= 0 && nextRow < grid.size && nextCol >= 0 && nextCol < grid.get(0, List()).size) {
						tempNext.add(Beam({ position: List([nextRow, nextCol]), direction: List([1, 0]) }));
					}
				}
				break;
			}
		}
	});

	const newNext = next.concat(nextCandidates.filter((beam) => !visited.contains(beam)));

	const head = newNext.first();

	if (head === undefined) {
		return visited.add(beam);
	}

	return moveBeam(
		head,
		grid,
		visited.add(beam),
		newNext.rest(),
	);
}

async function run1(inputPath: string): Promise<number> {
	const grid = await readInput(inputPath);
	const visited = await moveBeam(Beam({}), grid);
	const visitedPos = visited.map(R.prop("position"));
	return visitedPos.size;
}

async function run2(inputPath: string): Promise<number> {
	// IT CAN BE BRUTE FORCED!!!
	const grid = await readInput(inputPath);
	const height = grid.size;
	const width = grid.get(0)?.size ?? 0;
	const top = Range(0, width).map((col) => moveBeam(Beam({ position: List([0, col]), direction: List([1, 0]) }), grid));
	const bottom = Range(0, width).map((col) =>
		moveBeam(Beam({ position: List([height - 1, col]), direction: List([-1, 0]) }), grid)
	);
	const left = Range(0, height).map((row) =>
		moveBeam(Beam({ position: List([row, 0]), direction: List([0, 1]) }), grid)
	);
	const right = Range(0, height).map((row) =>
		moveBeam(Beam({ position: List([row, width - 1]), direction: List([0, -1]) }), grid)
	);
	const all = top.concat(bottom, left, right);

	let max = 0;
	for (const p of all) {
		const next = await p;
		const nextPos = next.map(R.prop("position"));
		max = Math.max(max, nextPos.size);
	}
	return max;
}

const expected1 = 46;
const test1 = await run1("test");
assert(test1 == expected1, `${test1} != ${expected1}`);
console.log("OK");
const result1 = await run1("input");
console.log(result1);

const expected2 = 51;
const test2 = await run2("test");
assert(test2 == expected2, `${test2} != ${expected2}`);
console.log("OK");
const result2 = await run2("input");
console.log(result2);
