// Not doing lib again
import * as R from "$ramda/mod.ts";

import { assert } from "$std/assert/assert.ts";

const strengths = ["A", "K", "Q", "T"].concat(R.map(R.toString, R.reverse(R.range(2, 10)))).concat(["J"]);
type HandType = "five" | "four" | "full" | "three" | "twopair" | "pair" | "high";
const handStrength: HandType[] = ["five", "four", "full", "three", "twopair", "pair", "high"];
interface Hand {
	_type: HandType;
	cards: string[];
}
type HandBid = [Hand, number];

function handTypeToValue(type: HandType): number {
	switch (type) {
		case "five":
			return 5;
		case "four":
			return 4;
		case "three":
			return 3;
		case "pair":
			return 2;
		case "high":
			return 1;
	}
	return 0;
}

function valueToHandType(value: number): HandType {
	switch (value) {
		case 1:
			return "high";
		case 2:
			return "pair";
		case 3:
			return "three";
		case 4:
			return "four";
		case 5:
			return "five";
	}
	assert(false, "This shouldn't happen");
}

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

function bump(hand: Hand, jokerCount: number): Hand {
	if (jokerCount == 0) {
		return hand;
	}
	return {
		_type: valueToHandType(handTypeToValue(hand._type) + jokerCount),
		cards: hand.cards,
	};
}

function evaluateHand(cards: string[]): Hand {
	assert(cards.length == 5, `${cards.length} != 5 (${cards})`);
	const results: { [key: string]: Hand } = {};
	let jokerCount = 0;
	for (const card of cards) {
		if (card == "J") {
			jokerCount++;
		} else if (Object.prototype.hasOwnProperty.call(results, card)) {
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

	// Special case - we have nothing else but a joker
	if (jokerCount == 5) {
		return {
			_type: "five",
			cards,
		};
	}

	const hands = R.sort(compareHands, Object.values(results));
	hands[0] = bump(hands[0], jokerCount);
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
