import { v4 as uuid } from "uuid";
import type { Player, Card, Round, Suit, Rank } from "../types/game";

export class PockerGame {
  public id: string;
  public players: Player[] = [];
  public deck: Card[] = [];
  public communityCards: Card[] = [];
  public pot: number = 0;
  public dealerIndex: number = 0;
  public round: Round = "preflop";
  public currentBet: number = 0;
  public currentPlayerIndex: number = 0;

  constructor(public smallBlind: number = 10, public bigBlind: number = 25) {
    this.id = uuid();
    this.resetDesk();
  }

  shuffleDeck() {
    for (let i = this.deck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [this.deck[i], this.deck[j]] = [this.deck[j], this.deck[i]];
    }
  }

  resetDesk() {
    const suits: Suit[] = ["♠", "♥", "♦", "♣"];
    const ranks: Rank[] = [
      "2",
      "3",
      "4",
      "5",
      "6",
      "7",
      "8",
      "9",
      "10",
      "J",
      "Q",
      "K",
      "A",
    ];
    this.deck = suits.flatMap((suit) => ranks.map((rank) => ({ suit, rank })));
    this.shuffleDeck();
  }

  addPlayer(name: string, chips: number): Player {
    const newPlayer: Player = {
      id: uuid(),
      name,
      chips,
      hand: [],
      hasFolded: false,
      isAllin: false,
      currentBet: 0,
    };
    this.players.push(newPlayer);
    return newPlayer;
  }

  dealHands() {
    this.players.forEach((player) => {
      player.hand = [this.deck.pop()!, this.deck.pop()!];
      player.hasFolded = false;
      player.currentBet = 0;
      player.isAllin = false;
    });
    this.communityCards = [];
    this.round = "preflop";
  }

  postBlinds() {
    const sbIndex = (this.dealerIndex + 1) % this.players.length;
    const bbIndex = (this.dealerIndex + 2) % this.players.length;

    const smallBlindPlayer = this.players[sbIndex];
    const bigBlindPlayer = this.players[bbIndex];

    smallBlindPlayer.currentBet = this.smallBlind;
    bigBlindPlayer.currentBet = this.bigBlind;

    smallBlindPlayer.chips -= this.smallBlind;
    bigBlindPlayer.chips -= this.bigBlind;

    this.pot += this.smallBlind + this.bigBlind;
    this.currentBet = this.bigBlind;
    this.currentPlayerIndex = (bbIndex + 1) % this.players.length;
  }

  dealFlop() {
    this.deck.pop();
    this.communityCards.push(
      this.deck.pop()!,
      this.deck.pop()!,
      this.deck.pop()!
    );
    this.round = "flop";
  }

  dealTurn() {
    this.deck.pop();
    this.communityCards.push(this.deck.pop()!);
    this.round = "turn";
  }

  dealRiver() {
    this.deck.pop();
    this.communityCards.push(this.deck.pop()!);
    this.round = "river";
  }

  nextRound() {
    switch (this.round) {
      case "preflop":
        this.dealFlop();
        break;
      case "flop":
        this.dealTurn();
        break;
      case "turn":
        this.dealRiver();
        break;
      case "river":
        this.round = "showdown";
        break;
    }
    this.resetBets();
  }

  resetBets() {
    this.currentBet = 0;
    this.players.forEach(player => (player.currentBet = 0));
  }

  foldPlayer(playerId: string) {
    const player = this.players.find(p => p.id === playerId);
    if (player) player.hasFolded = true;
  }
  
  betPlayer(playerId: string, amount: number) {
    const player = this.players.find(p => p.id === playerId);
    if (!player || player.hasFolded || player.chips < amount) return;

    player.chips -= amount;
    player.currentBet += amount;
    if (player.chips === 0) player.isAllin = true;

    this.pot += amount;
    if (player.currentBet > this.currentBet) this.currentBet = player.currentBet;
  }

  moveToNextPlayer() {
    do {
      this.currentPlayerIndex = (this.currentPlayerIndex + 1) % this.players.length;
    } while (this.players[this.currentPlayerIndex].hasFolded);
  }

  rotateDealer() {
    this.dealerIndex = (this.dealerIndex+1)%this.players.length;
  }
}

export const activeGames = new Map<string, PockerGame>();