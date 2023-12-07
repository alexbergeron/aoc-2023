// Not doing lib again
import * as R from "$ramda/mod.ts";

import { assert } from "$std/assert/assert.ts";

const strengths = ["A", "K", "Q", "J", "T"].concat(R.map(R.toString, R.reverse(R.range(2, 10))));
type HandType = "five" | "four" | "full" | "three" | "twopair" | "pair" | "high";
const handStrength: HandType[] = ["five", "four", "full", "three", "twopair", "pair", "high"];
interface Hand {
	_type: HandType;
	cards: string[];
}
type HandBid = [Hand, number];

function compareCards(a: string, b: string): number {
	return strengths.indexOf(a) - strengths.indexOf(b);
}

function compareHandsType(a: Hand, b: Hand): number {
	if (a._type !== b._type) {
		return handStrength.indexOf(a._type) - handStrength.indexOf(b._type);
	}
	return 0;
}

function compareHands(a: Hand, b: Hand): number {
	if (a._type !== b._type) {
		return compareHandsType(a, b);
	}

	let result = 0;
	let index = 0;
	while (result == 0 && index < 5) {
		result = compareCards(a.cards[index], b.cards[index]);
		index++;
	}
	return result;
}

function evaluateHand(cards: string[]): Hand {
	assert(cards.length == 5, `${cards.length} != 5 (${cards})`);
	const results: { [key: string]: Hand } = {};
	for (const card of cards) {
		if (Object.prototype.hasOwnProperty.call(results, card)) {
			const temp = results[card];
			if (temp._type == "four") {
				temp._type = "five";
			} else if (temp._type == "three") {
				temp._type = "four";
			} else if (temp._type == "pair") {
				temp._type = "three";
			} else {
				temp._type = "pair";
			}
		} else {
			results[card] = {
				_type: "high",
				cards,
			};
		}
	}

	const hands = R.sort(compareHands, Object.values(results));
	if (hands.length > 1 && hands[1]._type == "pair") {
		if (hands[0]._type == "three") {
			return {
				_type: "full",
				cards,
			};
		}
		return {
			_type: "twopair",
			cards,
		};
	}
	return hands[0];
}

function readInput(file: string): Promise<string> {
	return Deno.readTextFile(`./day7/${file}`);
}

function parseHandBid(line: string): HandBid {
	const [cardStr, bidStr] = R.split(" ", line);
	const cards = R.split("", cardStr);
	const bid = parseInt(bidStr);
	const hand = evaluateHand(cards);

	return [hand, bid];
}

function parseHandBids(input: string): HandBid[] {
	const lines = R.split("\n", input);
	return R.map(parseHandBid, lines);
}

async function run(inputPath: string): Promise<number> {
	const input = await readInput(inputPath);
	const handsBids = parseHandBids(input);
	const sorted = R.sort((a: HandBid, b: HandBid) => -compareHands(a[0], b[0]), handsBids);
	const reducer = (a: number, b: HandBid, i: number) => {
		return a + b[1] * (i + 1);
	};
	return R.addIndex(R.reduce)(reducer, 0, sorted);
}

const test = await run("test");
assert(test == 5905, `${test} != 5905`);
const result = await run("input");
console.log(result);
