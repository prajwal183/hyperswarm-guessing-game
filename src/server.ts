//@ts-nocheck
const Hyperswarm = require("hyperswarm");
import { Game } from "./game";
import { GAME_CHANNEL } from "./constants";
class Server {
  private server: Hyperswarm;
  private players: Map<string, boolean>;
  private clients: Hyperswarm.Socket[];
  private game: Game;

  constructor() {
    this.server = new Hyperswarm();
    this.players = new Map();
    this.clients = [];
    this.game = new Game();

    const topic = Buffer.alloc(32).fill(GAME_CHANNEL);

    this.server.join(topic, {
      server: true,
      client: false,
    });

    this.handleConnection = this.handleConnection.bind(this);
    this.server.on("connection", this.handleConnection);
  }

  /**
   * Handles new connections to the server and the communication with clients.
   * First, it checks if the player is a new one using the publicKey.
   * If there are no players, it sets the first player and initializes the game.
   * If there are players, it checks if the new player is a new one.
   * If the new player is a new one, it adds the player to the players map and the client to the clients array.
   * It also sends the status of the last guess to the new client.
   * If the new player is not a new one, it just sends the status of the last guess.
   * It also listens for data from clients and handles the responses.
   * It determines if the guess is correct or not and sends a message to all clients.
   * If the guess is correct, it ends the game and starts a new one.
   * If the guess is not correct, it sends a message with a clue to all clients.
   * @param {Hyperswarm.Socket} socket The socket of the new connection.
   * @param {Hyperswarm.PeerInfo} peerInfo The peer information of the new connection.
   */
  handleConnection(socket: Hyperswarm.Socket, peerInfo: Hyperswarm.PeerInfo) {
    console.log("New connection ");
    //Handle players
    const publicKey = peerInfo.publicKey.toString("hex");
    // If there are players, we ensure it's a new one using the publicKey.
    // If there are no players, the first one is added.
    if (this.players.size) {
      if (!this.players.has(publicKey)) {
        console.log("New player ");
        this.players.set(publicKey, true);
        this.clients.push(socket);
      }
      // Send status of the last guess.
      this.respontToClients(
        this.game.lastClue ?? "Guess a number between 1 and 100:"
      );
    } else {
      console.log("First player");
      this.players.set(publicKey, true);
      this.clients.push(socket);
      // Initialize the game for the first player.
      this.initializeGame();
    }

    //IMPORTANT: In order for the client to start responding it always needs a first message from the server that starts the client's socket.on()
    //this.respontToClients("Welcome to the game!");

    socket.on("data", (data: Buffer) => {
      const jsonData = JSON.parse(data.toString());
      console.log(`Server: ${jsonData.nickname} guessed ${jsonData.guess}`);

      // Handles the responses from the clients and determines if it's correct or not.
      // Convert the guess to a number.
      const guessedNumber = parseInt(jsonData.guess);
      if (this.isValidGuess(guessedNumber)) {
        if (this.game.isStarted) {
          if (guessedNumber === this.game.numberToGuess) {
            const message = `User ${jsonData.nickname} guessed ${jsonData.guess} and it's correct!\n The game is over! \n A new game will start soon.`;
            this.respontToClients(message);
            this.game.isEnded = true;
            this.initializeGame();
          } else {
            if (guessedNumber > this.game.numberToGuess) {
              this.game.lastClue = `User ${jsonData.nickname} guessed ${jsonData.guess} and it's too high!`;
            } else if (guessedNumber < this.game.numberToGuess) {
              this.game.lastClue = `User ${jsonData.nickname} guessed ${jsonData.guess} and it's too low!`;
            }
            this.respontToClients(this.game.lastClue);
          }
        }
      } else {
        const message = `User ${jsonData.nickname} guessed ${jsonData.guess} and it's not a valid guess. Please guess a number between 1 and 100.`;
        this.respontToClients(message);
      }
    });
  }

  isValidGuess(guess: number) {
    if (guess < 1 || guess > 100) {
      return false;
    }
    return true;
  }

  respontToClients(message: string) {
    for (const client of this.clients) {
      client.write(
        JSON.stringify({
          type: "game-update",
          message,
        })
      );
    }
  }

  initializeGame() {
    this.game.startGame();
    this.respontToClients("Game started! Guess a number between 1 and 100:");
  }
}

module.exports = { Server };