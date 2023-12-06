// Not doing lib again
import * as R from "$ramda/mod.ts";

import { assert } from "$std/assert/assert.ts";

function readInput(file: string): Promise<string> {
	return Deno.readTextFile(`./day6/${file}`);
}

function parseInput1(input: string): [number, number][] {
	const re = /\W+/;
	const [timeStr, distanceStr] = input.split("\n");
	const times = timeStr.split(re);
	const distances = distanceStr.split(re);
	return R.slice(1, Infinity, R.zip(times, distances));
}

function parseInput2(input: string): [number, number] {
	const re = /\W+/;
	const [timeStr, distanceStr] = input.split("\n");
	const times = timeStr.split(re);
	const distances = distanceStr.split(re);
	const concat = R.join("");
	const time = concat(R.slice(1, Infinity, times));
	const distance = concat(R.slice(1, Infinity, distances));
	return [time, distance];
}

function findWinningCounts(time: number, distance: number): number {
	let losingIndex = 0; // 0 seconds should always lose
	let winningIndex = Math.floor(time / 2); // Halfway point should always win I hope

	// binary search-ish
	while (losingIndex + 1 < winningIndex) {
		const attempt = Math.floor((losingIndex + winningIndex) / 2);
		const result = attempt * (time - attempt);
		if (result > distance) {
			winningIndex = attempt;
		} else {
			losingIndex = attempt;
		}
	}
	const maxIndex = time - winningIndex;
	return maxIndex - winningIndex + 1;
}

async function run1(inputPath: string): Promise<number> {
	const input = await readInput(inputPath);
	const inputs = parseInput1(input);
	const results = R.map(([t, d]: [number, number]) => findWinningCounts(t, d), inputs);
	return R.reduce(R.multiply, 1, results);
}

async function run2(inputPath: string): Promise<number> {
	const input = await readInput(inputPath);
	const [time, distance] = parseInput2(input);
	return findWinningCounts(time, distance);
}

const test = await run1("test");
assert(test == 288, `${test} != 288`);
const result = await run1("input");
console.log(result);

const test2 = await run2("test");
assert(test2 == 71503, `${test2} != 71503`);
const result2 = await run2("input");
console.log(result2);
