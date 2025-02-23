// import * as readline from "readline";
// import chalk from "chalk";
// import { Agent } from "../agent";
// import { UUID } from "mongodb";

// const rl = readline.createInterface({
//   input: process.stdin,
//   output: process.stdout,
// });

// const askQuestions = () => {
//   const roomId = new UUID().toString();
//   console.log(roomId);
//   console.log(chalk.red("Agent is starting"));

//   const agent = new Agent({ threadId: roomId, toolNumbers: [2, 3] });

//   const ask = () => {
//     rl.question(chalk.bgCyan("You: "), async (prompt) => {
//       if (prompt === "exit") {
//         rl.close();
//         return;
//       }
//       const res = await agent.messageAgent(prompt);
//       console.log(
//         chalk.bgRed.white.bold("Agent: ")
//         // res.messages[res.messages.length - 1].content
//       );

//       ask();
//     });
//   };

//   ask();
// };

// export { askQuestions };
