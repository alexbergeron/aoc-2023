// Not doing lib again

import { assert } from "$std/assert/assert.ts";
import { List, Map } from "$immutable/mod.ts";

function readInput(file: string): Promise<string> {
	return Deno.readTextFile(`./day9/${file}`);
}

function predictNext(nbSeq: List<number>): number {
	console.log(nbSeq.toArray())
	if (nbSeq.every((nb) => nb === 0)) {
		return 0
	}

	const next: number = predictNext(nbSeq.reduce<List<number>>((n, v, i) => {
		const nextV = nbSeq.get(i+1)
		if (nextV === undefined) {
			return n
		}

		return n.push(nextV - v)
	}, List()))
	const last = nbSeq.last(0)
	console.log(last)
	console.log(next)
	return last + next
}

async function run(inputPath: string): Promise<number> {
	const input = await readInput(inputPath);
	const linesStr = List(input.split('\n'))
	console.log(linesStr.toArray())
	const lines = linesStr.map((s) => List(s.split(' ')).map((s) => parseInt(s))
	)
	const predicted = lines.map(predictNext)
	console.log('OUT')
	console.log(predicted.toArray())
	return predicted.reduce((n,v) => n + v, 0);

}
const test = await run("test");
assert(test == 114, `${test} != 114`);
const result = await run("input");
console.log(result);
