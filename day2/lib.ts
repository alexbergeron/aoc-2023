import * as R from "$ramda/mod.ts";

type Color = "red" | "green" | "blue";

interface CubeSet {
	red: number;
	green: number;
	blue: number;
}

interface Game {
	id: number;
	draws: CubeSet[];
}

const PART_ONE_SET: CubeSet = { red: 12, green: 13, blue: 14 };

function readInput(): Promise<string> {
	return Deno.readTextFile("./day2/input");
}

function parseGame(input: string): Game {
	const gameRe = /^Game (\d+): (.*)$/;
	const [, id, drawsStr] = input.match(gameRe) ?? [0, 0, "100 red"]; // That will never happen
	const drawsToParse = drawsStr.split(";");

	return {
		id: Number(id),
		draws: R.map(parseDraw, drawsToParse),
	};
}

function parseDraw(draw: string): CubeSet {
	const cubes = draw.split(",");
	return findMax(R.map(parseCube, cubes));
}

function parseCube(cubeStr: string): CubeSet {
	const [qty, colorStr] = cubeStr.trim().split(" ");
	const color = colorStr as Color;

	const cube: CubeSet = { red: 0, green: 0, blue: 0 };
	cube[color] = Number(qty);
	return cube;
}

function parseGames(input: string): Game[] {
	const lines = input.split("\n");
	return R.map(parseGame, lines);
}

function findMax(draws: CubeSet[]): CubeSet {
	const findMax = R.compose(R.reduce(R.max, 0), R.map(R.__, draws), R.prop);
	const maxRed = findMax("red");
	const maxBlue = findMax("blue");
	const maxGreen = findMax("green");

	const out: CubeSet = { red: maxRed, green: maxGreen, blue: maxBlue };
	return out;
}

function isValid(draw: CubeSet): boolean {
	return (
		draw.red <= PART_ONE_SET.red &&
		draw.blue <= PART_ONE_SET.blue &&
		draw.green <= PART_ONE_SET.green
	);
}

function isValidGame(game: Game): boolean {
	const max = findMax(game.draws);
	return isValid(max);
}

export async function getPossible(): Promise<number> {
	const input = await readInput();
	const games = parseGames(input);
	const valid = R.filter(isValidGame, games);
	const ids = R.map(R.prop("id"), valid);
	return R.sum(ids);
}

function getPower(game: Game): number {
	const { blue, red, green } = findMax(game.draws);
	return blue * red * green;
}

export async function getFewest(): Promise<number> {
	const input = await readInput();
	const games = parseGames(input);
	const ids = R.map(getPower, games);
	return R.sum(ids);
}
