import fs from 'fs';

// Function to generate all possible board configurations
function generateBotScript(): void {
  const boardPositions = [
    [0, 0], [0, 1], [0, 2],
    [1, 0], [1, 1], [1, 2],
    [2, 0], [2, 1], [2, 2]
  ];

  let script = `
export function botMove(board: string[][]): void {
`;

  const states = ['X', 'O', ' ']; // Possible states for each cell
  
  // Helper to generate the nested if-else for each cell configuration
  function generateNestedIfs(depth: number, conditions: string[]): void {
    if (depth === 9) {
      // Once all 9 positions are set, write the action (here just marking with 'X' for simplicity)
      script += `
        board[${boardPositions[depth - 1][0]}][${boardPositions[depth - 1][1]}] = 'X'; 
      `;
      return;
    }

    for (let state of states) {
      const newConditions = [...conditions, state];
      script += `if (board[${boardPositions[depth][0]}][${boardPositions[depth][1]}] === '${state}') {\n`;
      generateNestedIfs(depth + 1, newConditions);
      script += `} `;
    }
  }

  // Start generating the nested if statements
  generateNestedIfs(0, []);
  
  script += `
}
`;

  // Write to file
  fs.writeFileSync('tictactoe_bot.ts', script);
  console.log("Bot script generated successfully!");
}

// Run the function to generate the script
generateBotScript();
