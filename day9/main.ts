// Not doing lib again

import { assert } from "$std/assert/assert.ts";
import { List } from "$immutable/mod.ts";

function readInput(file: string): Promise<string> {
	return Deno.readTextFile(`./day9/${file}`);
}

function predictNext(nbSeq: List<number>): number {
	if (nbSeq.every((nb) => nb === 0)) {
		return 0;
	}

	const next: number = predictNext(nbSeq.reduce<List<number>>((n, v, i) => {
		const nextV = nbSeq.get(i + 1);
		if (nextV === undefined) {
			return n;
		}

		return n.push(nextV - v);
	}, List()));
	return nbSeq.last(0) + next;
}

async function run1(inputPath: string): Promise<number> {
	const input = await readInput(inputPath);
	const lines = List(input.split("\n")).map((s) => List(s.split(" ")).map((s) => parseInt(s)));
	const predicted = lines.map(predictNext);
	return predicted.reduce((n, v) => n + v, 0);
}

function predictPrevious(nbSeq: List<number>): number {
	if (nbSeq.every((nb) => nb === 0)) {
		return 0;
	}

	const last: number = predictPrevious(nbSeq.reduce<List<number>>((n, v, i) => {
		const nextV = nbSeq.get(i + 1);
		if (nextV === undefined) {
			return n;
		}

		return n.push(nextV - v);
	}, List()));
	return nbSeq.first(0) - last;
}

async function run2(inputPath: string): Promise<number> {
	const input = await readInput(inputPath);
	const lines = List(input.split("\n")).map((s) => List(s.split(" ")).map((s) => parseInt(s)));
	const predicted = lines.map(predictPrevious);
	return predicted.reduce((n, v) => n + v, 0);
}

const test = await run1("test");
assert(test == 114, `${test} != 114`);
const result = await run1("input");
console.log(result);

const test2 = await run2("test");
assert(test2 == 2, `${test2} != 2`);
const result2 = await run2("input");
console.log(result2);
