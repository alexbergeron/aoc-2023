// It'a always something with grids, let's make an utlity file

import { List } from "$immutable/mod.ts";

export type Grid = List<List<string>>;

export function parseGrid(gridStr: string): Grid {
	const rows = gridStr.split("\n");
	return List(rows.map((row) => List(row.split(""))));
}

export function rotate(grid: Grid): Grid {
	return List<List<string>>().withMutations((newGrid) => {
		for (let i = 0; i < grid.get(0, List())?.size; i++) {
			newGrid.push(grid.map((row) => row.get(i) ?? "").reverse());
		}
		return newGrid;
	});
}

export function pivotGrid(grid: Grid): Grid {
	// Create new structure
	return List<List<string>>().withMutations((newGrid) => {
		for (let i = 0; i < grid.get(0, List()).size; i++) {
			const newRow = List<string>().asMutable();
			for (let j = 0; j < grid.size; j++) {
				newRow.set(j, grid.get(j)?.get(i) ?? "");
			}
			newGrid.set(i, newRow.asImmutable());
		}
	});
}
