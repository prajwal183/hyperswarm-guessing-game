export class Game {
  private isStarted: boolean;
  private numberToGuess: number;
  private isEnded: boolean;
  private lastGuess: number | null;
  private lastClue: string | null;

  constructor() {
    this.isStarted = false;
    this.numberToGuess = 0;
    this.isEnded = false;
    this.lastGuess = null;
    this.lastClue = null;
  }

  /**
   * Returns a random number between 1 and 100 (inclusive).
   * @returns The random number.
   */
  getNumberToGuess(): number {
    return Math.floor(Math.random() * 100) + 1;
  }

  startGame(): void {
    this.numberToGuess = this.getNumberToGuess();
    this.isStarted = true;
    console.log("Number to guess: ", this.numberToGuess);
  }
}

