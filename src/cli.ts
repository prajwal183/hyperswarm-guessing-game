import * as rl from "readline";

let readline: rl.Interface | undefined;

class CLI {
  constructor() {}

  async askTerminal(question: string): Promise<string> {
    if (!readline) {
      readline = rl.createInterface({
        input: process.stdin,
        output: process.stdout,
      });
    }
    return new Promise((resolve) => {
      readline!.question(question, (input) => resolve(input));
    });
  }
}

export { CLI };
