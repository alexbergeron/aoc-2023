// Not doing lib again

import { assert } from "$std/assert/assert.ts";

function readInput(file: string): Promise<string> {
	return Deno.readTextFile(`./day1/${file}`);
}

async function run(inputPath: string): Promise<number> {
	const input = await readInput(inputPath);
	return input.length;
}
const test = await run("test");
assert(test == 0, `${test} != 0`);
const result = await run("input");
console.log(result);
