# Day 8

## Prelude

(I'm writing this before it's available, just to set the constraints for the day)

- I'm not coding until I know how I want to decompose my problem
- You can code in something else than Typescript depending on the constraints
  - Python will still be the easiest
    - Pandas
  - I'd rather do multi-threading / async in Python and Typescript
  - Rust is an option if the logic is simple enough and performace matters
  - Go is an option too
- I've added immutable.js - I think I'd rather deal with a third-party collection library

## Challenge

- Follow L/R instructions navigating through pair
- Find nb of steps to get to ZZZ
- Start at AAA
- I can see a breadth-first navigation in part 2 or something
- Part 1 is simple enough but might be slow to parse

Let's go with JavaScript

Parse file

- lines[0] => instructions
- lines [2:] => nodesStr
- nodesStr => Map[string, [string, string]]
- (nodeId, step, nodes) => Promise<step>
- Promise because recursive call
  - No tailrec => bad surprises possible here

I am confident now! 6 minutes in
