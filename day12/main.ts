// Not doing lib again

import { assert } from "$std/assert/assert.ts";

import * as R from "$ramda/mod.ts";

interface Row {
	readonly line: string;
	readonly checksum: number[];
}

async function readInput(file: string): Promise<string[]> {
	const out = await Deno.readTextFile(`./day12/${file}`);
	return out.split("\n");
}

function parseLine(line: string): Row {
	const [row, checksumStr] = line.split(" ");
	const checksum = R.map(parseInt, checksumStr.split(","));
	return { line: row, checksum };
}

function parseLineUnfold(line: string): Row {
	const [row, checksumStr] = line.split(" ");
	const checksum = R.map(parseInt, checksumStr.split(","));
	return { line: R.join("", R.intersperse("?", R.repeat(row, 5))), checksum: R.flatten(R.repeat(checksum, 5)) };
}

function findCombinations(row: Row): number {
	//console.log(`IN: ${row.line} - ${row.checksum}`);

	const cached = localStorage.getItem(keyOf(row));
	if (cached !== null) {
		return parseInt(cached);
	}

	if (row.checksum.length == 0) {
		if (row.line.indexOf("#") > -1) {
			return 0;
		} else {
			//console.log("FOUND ONE!");
			return 1;
		}
	}

	const matches = row.line.match(/^\.*([\?#]+)(.*)$/);
	if (!matches) {
		return 0;
	}

	const [_, trimmedStart, rest] = matches;
	if (trimmedStart.length < row.checksum[0]) {
		//console.log('trim check')
		if (R.all(R.equals("?"), trimmedStart)) {
			return findCombinations({ line: rest, checksum: row.checksum });
		}
		return 0;
	}

	const arrangements: number[] = [];
	let idx = -1;
	do {
		idx++;
		//console.log(`${trimmedStart.slice(idx)} + ${row.checksum[0]}`)
		if (trimmedStart.length == row.checksum[0] + idx) {
			arrangements.push(
				findCombinations({ line: rest, checksum: row.checksum.slice(1) }),
			);
		} else if (trimmedStart[row.checksum[0] + idx] == "?") {
			arrangements.push(
				findCombinations({
					line: trimmedStart.slice(row.checksum[0] + idx + 1) + rest,
					checksum: row.checksum.slice(1),
				}),
			);
		}
	} while (trimmedStart[idx] != "#" && row.checksum[0] + idx <= trimmedStart.length);
	if (R.all(R.equals("?"), trimmedStart)) {
		arrangements.push(findCombinations({ line: rest, checksum: row.checksum }));
	}

	const out = R.sum(arrangements);
	localStorage.setItem(keyOf(row), out);
	return out;
}

async function run1(inputPath: string): Promise<number> {
	const input = await readInput(inputPath);
	const lines = input.map(parseLine);
	const combinations = lines.map(findCombinations);

	localStorage.clear();
	return combinations.reduce((p, c) => p + c, 0);
}

async function run2(inputPath: string): Promise<number> {
	const input = await readInput(inputPath);
	const lines = input.map(parseLineUnfold);
	const combinations = lines.map(findCombinations);

	localStorage.clear();
	return combinations.reduce((p, c) => p + c, 0);
}

function keyOf(row: Row): string {
	return `${row.line}, ${row.checksum.join(",")}`;
}

const test = await run1("test");
assert(test == 21, `${test} != 21`);
console.log("OUT");
const result = await run1("input");
console.log(result);

const test2 = await run2("test");
assert(test2 == 525152, `${test2} != 525152`);
console.log("OUT");
const result2 = await run2("input");
console.log(result2);
