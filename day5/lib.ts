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

const seeds: SeedId[] = [];
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
	for (const s of seedsStr.split(" ")) {
		seeds.push(s);
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

function get(dict: { [id: string]: [string, Length] }): (id: string) => string {
	return (id) => {
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
	};
}

export async function doStuff(): Promise<string> {
	const input = await readInput();
	parseInput(input);

	// It's been an hour, functional time!
	const soils = R.map(get(seedToSoil), seeds);
	const fertilizers = R.map(get(soilToFertilizer), soils);
	const water = R.map(get(fertilizerToWater), fertilizers);
	const light = R.map(get(waterToLight), water);
	const temperature = R.map(get(lightToTemperature), light);
	const humidity = R.map(get(temperatureToHumidity), temperature);
	const location = R.map(get(humidityToLocation), humidity);
	return R.reduce(R.min, location[0], location);
}
