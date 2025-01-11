//@ts-nocheck
import Hyperswarm from "hyperswarm";
import { GAME_CHANNEL } from "./constants";
import { CLI } from "./cli";

class Client {
  private nickname: string;
  private client: Hyperswarm;
  private cli: CLI;
  private topic: Buffer;
  private connection?: Hyperswarm.Socket; // Optional, since it might not be initialized immediately

  constructor(nickname: string) {
    this.nickname = nickname;
    this.client = new Hyperswarm();
    this.cli = new CLI();

    // Create the topic buffer
    this.topic = Buffer.alloc(32).fill(GAME_CHANNEL);
    this.client.join(this.topic, {
      server: false,
      client: true,
    });

    this.handleConnection = this.handleConnection.bind(this);
    this.client.on("connection", this.handleConnection);
  }

  private handleConnection(socket: Hyperswarm.Socket, peerInfo: Hyperswarm.PeerInfo): void {
    console.log("Client connected to server!");
    this.connection = socket;

    socket.on("data", (data: Buffer) => {
      const jsonData = JSON.parse(data.toString());

      if (jsonData.type === "game-update") {
        console.log(jsonData.message);
        this.askGuess();
      }
    });
  }

  private askGuess(): void {
    this.cli.askTerminal("> ").then((number: string) => {
      if (this.connection) {
        this.connection.write(
          JSON.stringify({
            nickname: this.nickname,
            guess: number,
          })
        );
      }
    });
  }
}

export { Client };
