// Not doing lib again

import { assert } from "$std/assert/assert.ts";

import * as R from "$ramda/mod.ts";
import { List, OrderedMap } from "$immutable/mod.ts";

type HashMap = List<OrderedMap<string, number>>
const EmptyBox = OrderedMap<string, number>()

const parser = /^(\w+)([=-])(\d*)$/

async function readInput(file: string): Promise<string[]> {
	const out = await Deno.readTextFile(`./day15/${file}`);
	return out.split(",");
}

function hashify(str: string): number {
	let out = 0
	for (let i = 0; i < str.length; i++) {
		out += str.charCodeAt(i)
		out *= 17
		out = out % 256
	}
	return out
}

function buildHashMap(instructions: string[]): HashMap {
	return List<OrderedMap<string, number>>().withMutations((list) => {
		for (const instruction of instructions) {
			const [, label, op, lens] = instruction.match(parser) ?? []
			switch(op) {
				case '=':
					list.update(hashify(label), (box) => (box ?? EmptyBox).set(label, parseInt(lens)))
					break
				case '-':
					list.update(hashify(label), (box) => (box ?? EmptyBox).remove(label))
					break
			}
		}
	})
}

function focusingPower(hashMap: HashMap): number {
	return R.sum(hashMap.flatMap((box, boxIdx) => (box ?? EmptyBox).toIndexedSeq().map((focalLength, slotNb) => (boxIdx + 1) * (slotNb + 1) * focalLength)))
}

async function run1(inputPath: string): Promise<number> {
	const instructions = await readInput(inputPath);
	return R.sum(R.map(hashify, instructions))
}

async function run2(inputPath: string): Promise<number> {
	const instructions = await readInput(inputPath);
	const hashMap = buildHashMap(instructions)

	return focusingPower(hashMap)
}

assert(hashify("HASH") == 52, "Hash code fail")

const expected1 = 1320;
const test1 = await run1("test");
assert(test1 == expected1, `${test1} != ${expected1}`);
console.log("OK")
const result1 = await run1("input");
console.log(result1);


const expected2 = 145;
const test2 = await run2("test");
assert(test2 == expected2, `${test2} != ${expected2}`);
console.log("OK")
const result2 = await run2("input");
console.log(result2);