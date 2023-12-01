import * as R from "$ramda/mod.ts";

function readInput(): Promise<string> {
	return Deno.readTextFile("./day1/input");
}

function findDigits(input: string): number {
	const firstRe = /^\D*(\d)/;
	const lastRe = /(\d)\D*$/;
	const [, first] = input.match(firstRe) ?? ["0"];
	const [, last] = input.match(lastRe) ?? ["0"];
	const str = `${first}${last}`;
	console.log(str);
	return Number(str);
}

function findNumbers(input: string): number {
	const firstRe = /^.*?(\d|one|two|three|four|five|six|seven|eight|nine).*$/;
	const lastRe = /^.*(\d|one|two|three|four|five|six|seven|eight|nine).*?$/;
	const [, firstStr] = input.match(firstRe) ?? ["0"];
	const [, lastStr] = input.match(lastRe) ?? ["0"];
	const first = parseNumber(firstStr);
	const last = parseNumber(lastStr);
	const str = `${first}${last}`;
	console.log(str);
	return Number(str);
}

function parseNumber(str: string): number {
	switch (str) {
		case "one":
			return 1;
		case "two":
			return 2;
		case "three":
			return 3;
		case "four":
			return 4;
		case "five":
			return 5;
		case "six":
			return 6;
		case "seven":
			return 7;
		case "eight":
			return 8;
		case "nine":
			return 9;
		default:
			return Number(str);
	}
}

function parseInput(input: string): number[] {
	const lines = input.split("\n");
	return R.map(findDigits, lines);
}

function sumNumbers(numbers: number[]): number {
	return R.sum(numbers);
}

export async function getCalibration1(): Promise<number> {
	const input = await readInput();
	const numbers = parseInput(input);
	return sumNumbers(numbers);
}

export async function getCalibration(): Promise<number> {
	const input = await readInput();
	const lines = input.split("\n");
	const numbers = R.map(findNumbers, lines);
	return sumNumbers(numbers);
}
