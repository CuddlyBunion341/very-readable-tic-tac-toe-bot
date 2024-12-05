import { writeFile } from "fs/promises";

const outputFile = "tictactoe_bot.ts";
const totalStates = Math.pow(3, 9); // 3^9 = 19,683 board states
let currentState = 0;

// Progress bar function
function progressBar() {
  const progress = Math.floor((currentState / totalStates) * 100);
  const barWidth = 50;
  const filled = Math.floor((progress / 100) * barWidth);
  const empty = barWidth - filled;

  process.stdout.write(
    `\rGenerating conditions: [${"#".repeat(filled)}${"-".repeat(empty)}] ${progress}%`
  );
}

// Recursive function to generate all board states
function generateConditions(depth: number, path: string[]): string {
  if (depth === 9) {
    // Base case: construct a full board state
    currentState++;
    progressBar();

    const boardState = JSON.stringify([
      path.slice(0, 3),
      path.slice(3, 6),
      path.slice(6, 9),
    ]);
    return `
    if (JSON.stringify(board) === ${boardState}) {
        // Bot logic for this specific state
        return;
    }`;
  }

  // Generate states for each cell being 'X', 'O', or ' '
  return ["X", "O", " "]
    .map((char) => generateConditions(depth + 1, [...path, char]))
    .join("");
}

// Generate the TypeScript function
async function generateScript() {
  const header = `
export function botMove(board: string[][]): void {
    // Bot's move logic for all possible board states
`;
  const footer = `
    // Fallback if no conditions match (shouldn't happen)
    console.log('Unhandled board state');
}
`;

  // Generate all conditions
  console.log("Starting generation...");
  const conditions = generateConditions(0, []);

  // Write to output file
  const script = `${header}${conditions}${footer}`;
  await writeFile(outputFile, script);

  // Finish
  console.log("\nGeneration complete. Script saved to tictactoe_bot.ts");
}

// Run the generator
generateScript();
