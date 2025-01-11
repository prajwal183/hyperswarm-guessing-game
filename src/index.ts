const { Server } = require("./server");
import { CLI } from "./cli";
import { Client } from "./client";

async function main() {
  const cli = new CLI();
  const nickname = await cli.askTerminal("What is your nickname? ");

  const lowerCaseNickname = nickname.toLowerCase();

  if (lowerCaseNickname === "server") {
    const server = new Server();
  } else {
    const client = new Client(nickname);
  }
  console.log(`Welcome to the game, ${nickname}!`);
}

main();
