// Not doing lib again

import { assert } from "$std/assert/assert.ts";

async function readInput(file: string): Promise<string[]> {
	const out = await Deno.readTextFile(`./day15/${file}`);
	return out.split("\n");
}

async function run1(inputPath: string): Promise<number> {
	const input = await readInput(inputPath);
	return input.length;
}

const expected1 = 0;
const test1 = await run1("test");
assert(test1 == expected1, `${test1} != ${expected1}`);
console.log("OK")
const result1 = await run1("input");
console.log(result1);
