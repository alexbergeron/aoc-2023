import * as R from "$ramda/mod.ts";
// Today I'm not doing classes and objects and just doing bare types and imperative programming because I don't want to

//seeds: x

//x-to-y map
//yStart xStart length

type SeedId = string;
type SoilId = string;
type FertilizerId = string;
type WaterId = string;
type LightId = string;
type TemperatureId = string;
type HumidityId = string;
type LocationId = string;

type Length = number;

const seedsMap: [SeedId, Length][] = [];
const seedToSoil: { [id: SeedId]: [SoilId, Length] } = {};
const soilToFertilizer: { [id: SoilId]: [FertilizerId, Length] } = {};
const fertilizerToWater: { [id: FertilizerId]: [WaterId, Length] } = {};
const waterToLight: { [id: WaterId]: [LightId, Length] } = {};
const lightToTemperature: { [id: LightId]: [TemperatureId, Length] } = {};
const temperatureToHumidity: { [id: TemperatureId]: [HumidityId, Length] } = {};
const humidityToLocation: { [id: HumidityId]: [LocationId, Length] } = {};

function readInput(): Promise<string> {
	return Deno.readTextFile("./day5/input");
}

function parseInput(input: string) {
	const lines = input.split("\n");

	const seedsLine = lines[0];
	fillSeeds(seedsLine);

	const [soilStartId, soilEndId] = pickLines(lines, 2);
	fillDict(seedToSoil, lines.slice(soilStartId, soilEndId));

	const [fertilizerStartId, fertilizerEndId] = pickLines(lines, soilEndId + 1);
	fillDict(soilToFertilizer, lines.slice(fertilizerStartId, fertilizerEndId));

	const [waterStartId, waterEndId] = pickLines(lines, fertilizerEndId + 1);
	fillDict(fertilizerToWater, lines.slice(waterStartId, waterEndId));

	const [lightStartId, lightEndId] = pickLines(lines, waterEndId + 1);
	fillDict(waterToLight, lines.slice(lightStartId, lightEndId));

	const [temperatureStartId, temperatureEndId] = pickLines(lines, lightEndId + 1);
	fillDict(lightToTemperature, lines.slice(temperatureStartId, temperatureEndId));

	const [humidityStartId, humidityEndId] = pickLines(lines, temperatureEndId + 1);
	fillDict(temperatureToHumidity, lines.slice(humidityStartId, humidityEndId));

	const [locationStartId, locationEndId] = pickLines(lines, humidityEndId + 1);
	fillDict(humidityToLocation, lines.slice(locationStartId, locationEndId));
}

function fillSeeds(line: string) {
	const re = /^seeds: (.*)$/;
	const match = line.match(re);
	if (!match) {
		return;
	}
	const seedsStr = match[1];
	const seedsArray = seedsStr.split(" ");
	for (let i = 0; i < seedsArray.length; i += 2) {
		seedsMap.push([seedsArray[i], parseInt(seedsArray[i + 1])]);
	}
}

function pickLines(lines: string[], start: number): [number, number] {
	let end = start + 1;
	while (lines[end]) {
		end += 1;
	}
	return [start, end];
}

function fillDict(dict: { [id: string]: [string, Length] }, lines: string[]) {
	const re = /^(\d+) (\d+) (\d+)$/;

	for (const line of lines) {
		const match = line.match(re);
		if (!match) {
			continue;
		}
		const [, yStartStr, xStartStr, lengthStr] = match;
		const length = parseInt(lengthStr);
		dict[xStartStr] = [yStartStr, length];
	}
}

function get(dict: { [id: string]: [string, Length] }, id: string): string {
	// Perfect match
	if (id in dict) {
		return dict[id][0];
	}
	// Check via Price is Right rules
	const idInt = parseInt(id);
	for (const keyStr of Object.keys(dict)) {
		const key = parseInt(keyStr);
		const [value, length] = dict[keyStr];
		if (key < idInt && idInt < key + length) {
			return String(parseInt(value) + idInt - key);
		}
	}

	// No match found
	return id;
}

function scoreSeed(seed: SeedId): number {
	const soil = get(seedToSoil, seed);
	const fertilizer = get(soilToFertilizer, soil);
	const water = get(fertilizerToWater, fertilizer);
	const light = get(waterToLight, water);
	const temperature = get(lightToTemperature, light);
	const humidity = get(temperatureToHumidity, temperature);
	return parseInt(get(humidityToLocation, humidity));
}

function parseRange(seedsRange: [SeedId, Length]): number {
	const [start, length] = seedsRange;
	let maxLocation = NaN;

	for (let seed = parseInt(start); seed < parseInt(start) + length; seed++) {
		const score = scoreSeed(String(seed));
		if (!maxLocation || score < maxLocation) {
			maxLocation = score;
		}
	}
	return maxLocation;
}

export async function doStuff(): Promise<string> {
	const input = await readInput();
	parseInput(input);

	// It's been an hour, functional time!
	const locations = R.map((c: [string, number]) => c[0], Object.values(humidityToLocation));
	const maxLocation = R.reduce(R.max, 0, locations);
	return R.reduce(R.min, maxLocation, R.map(parseRange, seedsMap));
}
