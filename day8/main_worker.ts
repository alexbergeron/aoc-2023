// Not doing lib again

import { assert } from "$std/assert/assert.ts";
import { delay } from "$std/async/delay.ts";
import { List, Map } from "$immutable/mod.ts";
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

function workerOnMessage(results: number[], index: number) {
	return (e: MessageEvent<number>) => {
		results[index] = e.data;
	};
}

async function handleWorkers(workers: Worker[]): Promise<number> {
	try {
		// Set up data structures
		const results: number[] = new Array(workers.length);
		results.fill(0);

		workers.map((w: Worker, i: number) => {
			w.onmessage = workerOnMessage(results, i);
		});

		while (true) {
			await delay(2 * workers.length);

			if (results.every((v) => v > 0)) {
				return lcm(...results);
			}
		}
	} finally {
		workers.forEach((w) => w.terminate());
	}
}

function startWorker(inputPath: string, startNode: string): Worker {
	const worker = new Worker(new URL("./worker.ts", import.meta.url).href, { type: "module" });
	worker.postMessage({ filename: inputPath, key: startNode });
	return worker;
}

async function run(inputPath: string): Promise<number> {
	const input = await readInput(inputPath);
	const parsed = parseInput(input);
	const startNodes = parsed.nodes.keySeq().filter((k) => k.endsWith("A"));
	const workers = startNodes.toArray().map((startNode: string) => startWorker(inputPath, startNode));
	return await handleWorkers(workers);
}

const test2 = await run("test2");
assert(test2 == 6, `${test2} != 6`);
const result = await run("input");
console.log(result);
