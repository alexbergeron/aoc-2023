// Not doing lib again

import { assert } from "$std/assert/assert.ts";
import { delay } from "$std/async/delay.ts";
import { List, Map } from "$immutable/mod.ts";
import * as R from "$ramda/mod.ts";
import { lcm } from "$math/mod.ts";

function readInput(file: string): Promise<string> {
	return Deno.readTextFile(`./day8/${file}`);
}

type Node = { readonly left: string; readonly right: string };
type Input = { readonly instructions: List<string>; readonly nodes: Map<string, Node> };

function parseNode(line: string): [string, Node] {
	const re = /^(\w+) = \((\w+), (\w+)\)$/;
	const match = line.match(re);
	assert(match, line);
	const [, key, left, right] = match;
	return [key, { left, right }];
}

function parseInput(input: string): Input {
	const lines: List<string> = List(R.split("\n", input));
	const instructionsStr = lines.get(0);
	assert(instructionsStr);
	const instructions: string[] = R.split("", instructionsStr);
	const nodesStr = lines.slice(2);
	const nodes = Map<string, Node>().asMutable();
	nodesStr.forEach((line) => {
		const [key, node] = parseNode(line);
		nodes.set(key, node);
	});
	return { instructions: List(instructions), nodes: Map(nodes) };
}

async function navigate(key: string, steps: number, input: Input): Promise<number> {
	if (key == "ZZZ") {
		return Promise.resolve(steps);
	}
	await delay(0); // Defer execution

	const node = input.nodes.get(key);
	assert(node);
	const stepKey = steps % input.instructions.size;
	const instruction = input.instructions.get(stepKey);

	switch (instruction) {
		case "L":
			return navigate(node.left, steps + 1, input);
		case "R":
			return navigate(node.right, steps + 1, input);
		default:
			throw new Error(`Unknown instruction ${instruction}`);
	}
}

async function navigateEndsWith(key: string, steps: number, input: Input): Promise<number> {
	if (key.endsWith("Z")) {
		return Promise.resolve(steps);
	}
	await delay(0); // Defer execution

	if (steps % 1000 == 0) {
		await delay(2); // Defer execution
	}

	const node = input.nodes.get(key);
	assert(node);
	const stepKey = steps % input.instructions.size;
	const instruction = input.instructions.get(stepKey);

	switch (instruction) {
		case "L":
			return await navigateEndsWith(node.left, steps + 1, input);
		case "R":
			return await navigateEndsWith(node.right, steps + 1, input);
		default:
			throw new Error(`Unknown instruction ${instruction}`);
	}
}

async function run1(inputPath: string): Promise<number> {
	const input = await readInput(inputPath);
	return navigate("AAA", 0, parseInput(input));
}

async function run2(inputPath: string): Promise<number> {
	const input = await readInput(inputPath);
	const parsed = parseInput(input);
	const startNodes = parsed.nodes.keySeq().filter((k) => k.endsWith("A"));
	const results = await Promise.all(startNodes.toArray().map((sn) => navigateEndsWith(sn, 0, parsed)));
	return R.reduce(lcm, results[0], results.slice(1));
}

const test1 = await run1("test");
assert(test1 == 2, `${test1} != 2`);
const result1 = await run1("input");
console.log(result1);

const test2 = await run2("test2");
assert(test2 == 6, `${test2} != 6`);
const result2 = await run2("input");
console.log(result2);
