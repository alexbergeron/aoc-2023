// Not doing lib again

import { assert } from "$std/assert/assert.ts";
import { delay } from "$std/async/delay.ts";

type Position = [number, number];
type Grid = string[][];
type Next = { position: Position; count: number };

const leftValues = ["-", "F", "L", "S"];
const rightValues = ["-", "7", "J", "S"];
const topValues = ["|", "F", "7", "S"];
const bottomValues = ["|", "L", "J", "S"];

async function readInput(file: string): Promise<Grid> {
	const input = await Deno.readTextFile(`./day10/${file}`);
	const lines = input.split("\n");
	return lines.map((line) => line.split(""));
}

function findStart(grid: Grid): Position {
	const rowCount = grid.length;
	const colCount = grid[0].length;

	for (let row = 0; row < rowCount; row++) {
		for (let col = 0; col < colCount; col++) {
			if (grid[row][col] == "S") {
				return [row, col];
			}
		}
	}
	throw Error("Start not found");
}

async function navigate(
	grid: Grid,
	position: Position,
	visited: string[] = [],
	count = 0,
	next: Next[] = [],
): Promise<number> {
	const [row, col] = position;
	visited.push(position.join(","));

	if (
		row > 0 && !visited.includes([row - 1, col].join(",")) && topValues.includes(grid[row - 1][col]) &&
		bottomValues.includes(grid[row][col])
	) {
		next.push({ position: [row - 1, col], count: count + 1 });
	}
	if (
		row < grid.length - 1 && !visited.includes([row + 1, col].join(",")) && bottomValues.includes(grid[row + 1][col]) &&
		topValues.includes(grid[row][col])
	) {
		next.push({ position: [row + 1, col], count: count + 1 });
	}
	if (
		col > 0 && !visited.includes([row, col - 1].join(",")) && leftValues.includes(grid[row][col - 1]) &&
		rightValues.includes(grid[row][col])
	) {
		next.push({ position: [row, col - 1], count: count + 1 });
	}
	if (
		col < grid[0].length - 1 && !visited.includes([row, col + 1].join(",")) &&
		rightValues.includes(grid[row][col + 1]) && leftValues.includes(grid[row][col])
	) {
		next.push({ position: [row, col + 1], count: count + 1 });
	}
	const nextCandidate = next.shift();
	if (nextCandidate === undefined) {
		return count;
	}
	await delay(0);
	return navigate(grid, nextCandidate.position, visited, nextCandidate.count, next);
}

function subStart(grid: Grid, start: Position) {
	const [row, col] = start;

	let hasTop = false;
	let hasBottom = false;
	let hasLeft = false;
	let hasRight = false;

	if (row > 0 && topValues.includes(grid[row - 1][col])) {
		hasTop = true;
	}
	if (row < grid.length - 1 && bottomValues.includes(grid[row + 1][col])) {
		hasBottom = true;
	}
	if (col > 0 && leftValues.includes(grid[row][col - 1])) {
		hasLeft = true;
	}
	if (col < grid[0].length - 1 && rightValues.includes(grid[row][col + 1])) {
		hasRight = true;
	}
	if (hasTop && hasBottom) {
		grid[row][col] = "|";
	} else if (hasTop && hasLeft) {
		grid[row][col] = "J";
	} else if (hasTop && hasRight) {
		grid[row][col] = "L";
	} else if (hasBottom && hasLeft) {
		grid[row][col] = "7";
	} else if (hasBottom && hasRight) {
		grid[row][col] = "F";
	} else if (hasLeft && hasRight) {
		grid[row][col] = "-";
	} else {
		throw Error("I dunno lol");
	}
}

function cleanGrid(grid: Grid, loop: string[]) {
	for (let row = 0; row < grid.length; row++) {
		for (let col = 0; col < grid[0].length; col++) {
			if (!loop.includes(`${row},${col}`)) {
				grid[row][col] = ".";
			}
		}
	}
}

function findEnclosed(grid: Grid, loop: string[]): number {
	let out = 0;
	for (let row = 0; row < grid.length; row++) {
		let inLoop = false;
		for (let col = 0; col < grid[row].length; col++) {
			if (loop.includes(`${row},${col}`)) {
				switch (grid[row][col]) {
					case "|":
					case "S":
						inLoop = !inLoop;
						break;
					case "F":
						{
							const nextUp = grid[row].indexOf("J", col);
							const nextDown = grid[row].indexOf("7", col);
							if ((nextDown == -1 && nextUp != -1) || (nextUp > col && nextUp < nextDown)) {
								col = nextUp;
								inLoop = !inLoop;
							} else if (nextDown > col) {
								col = nextDown;
							}
						}
						break;
					case "L":
						{
							const nextUp = grid[row].indexOf("J", col);
							const nextDown = grid[row].indexOf("7", col);
							if ((nextUp == -1 && nextDown != -1) || (nextDown > col && nextDown < nextUp)) {
								col = nextDown;
								inLoop = !inLoop;
							} else if (nextUp > col) {
								col = nextUp;
							}
						}
						break;
				}
			} else if (!loop.includes(`${row}${col}`) && inLoop) {
				out += 1;
			}
		}
	}
	return out;
}

async function run(inputPath: string): Promise<number> {
	const grid = await readInput(inputPath);
	const start = findStart(grid);
	return navigate(grid, start);
}

async function run2(inputPath: string): Promise<number> {
	const grid = await readInput(inputPath);
	const start = findStart(grid);
	const visited: string[] = [];
	await navigate(grid, start, visited);
	subStart(grid, start);
	cleanGrid(grid, visited);
	return findEnclosed(grid, visited);
}

const test = await run("test");
assert(test == 8, `${test} != 8`);
console.log("out");
const result = await run("input");
console.log(result);

const test2 = await run2("test2");
assert(test2 == 10, `${test2} != 8`);
console.log("out");
const result2 = await run2("input");
console.log(result2);
