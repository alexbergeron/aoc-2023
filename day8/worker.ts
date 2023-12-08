// Not doing lib again

import { assert } from "$std/assert/assert.ts";
import { delay } from "$std/async/delay.ts";
import { List, Map } from "$immutable/mod.ts";

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
	const lines: List<string> = List(input.split("\n"));
	const instructionsStr = lines.get(0);
	assert(instructionsStr);
	const instructions: string[] = instructionsStr.split("");
	const nodesStr = lines.slice(2);
	const nodes = Map<string, Node>().asMutable();
	nodesStr.forEach((line) => {
		const [key, node] = parseNode(line);
		nodes.set(key, node);
	});
	return { instructions: List(instructions), nodes: Map(nodes) };
}

async function navigate(key: string, steps: number, input: Input): Promise<number> {
	if (key.endsWith("Z")) {
		postMessage(steps);
		return steps;
	}
	if (steps % 10000 == 0) {
		await delay(1); // GC
	} else {
		await delay(0); // Defer execution
	}

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

self.onmessage = async (e) => {
	const { filename, key } = e.data;
	const input = await readInput(filename);
	return await navigate(key, 0, parseInput(input));
};
