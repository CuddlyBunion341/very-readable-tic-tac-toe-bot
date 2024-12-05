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

// Function to determine the winner of a board state
function getWinner(board: string[]): string | null {
  const lines = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
    [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
    [0, 4, 8], [2, 4, 6],            // Diagonals
  ];
  for (const [a, b, c] of lines) {
    if (board[a] !== " " && board[a] === board[b] && board[b] === board[c]) {
      return board[a];
    }
  }
  return null;
}

// Minimax algorithm for optimal bot move
function minimax(board: string[], isMaximizing: boolean): number {
  const winner = getWinner(board);
  if (winner === "O") return 10;
  if (winner === "X") return -10;
  if (!board.includes(" ")) return 0; // Draw

  const scores: number[] = [];
  for (let i = 0; i < board.length; i++) {
    if (board[i] === " ") {
      board[i] = isMaximizing ? "O" : "X";
      scores.push(minimax(board, !isMaximizing));
      board[i] = " ";
    }
  }
  return isMaximizing ? Math.max(...scores) : Math.min(...scores);
}

// Find the best move for the bot
function findBestMove(board: string[]): number {
  let bestScore = -Infinity;
  let bestMove = -1;
  for (let i = 0; i < board.length; i++) {
    if (board[i] === " ") {
      board[i] = "O";
      const score = minimax(board, false);
      board[i] = " ";
      if (score > bestScore) {
        bestScore = score;
        bestMove = i;
      }
    }
  }
  return bestMove;
}

// Recursive function to generate nested conditions
function generateNestedConditions(depth: number, path: string[]): string {
  if (depth === 9) {
    // Base case: Generate logic for a fully-defined board
    currentState++;
    progressBar();

    const bestMove = findBestMove([...path]);
    if (bestMove === -1) {
      return `return; // No moves left (game over)`;
    }

    const bestMoveRow = Math.floor(bestMove / 3);
    const bestMoveCol = bestMove % 3;
    return `board[${bestMoveRow}][${bestMoveCol}] = 'O'; return;`;
  }

  // Generate conditions for each of X, O, and " "
  const states: string[] = ["X", "O", " "].map((char) => {
    const condition = `board[${Math.floor(depth / 3)}][${depth % 3}] === '${char}'`;
    const nested = generateNestedConditions(depth + 1, [...path, char]);
    return `if (${condition}) { ${nested} }`;
  });

  // Ensure all conditions are wrapped in an else block
  return states.join(" else ");
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

  console.log("Starting generation...");
  const nestedConditions = generateNestedConditions(0, []);

  // Add the generated conditions to the script body
  const script = `${header}${nestedConditions}${footer}`;
  
  // Write the generated script to the output file
  await writeFile(outputFile, script);

  console.log("\nGeneration complete. Script saved to tictactoe_bot.ts");
}

// Run the generator
generateScript();
