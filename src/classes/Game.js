import Trick from './Trick.js';
import Deck, { Card } from './Deck.js';
import { Player, Computer } from './Player.js';
import MCTS from './MCTS.js';

class Game {
  constructor(thresholdPoints = 100){
    this.thresholdPoints = thresholdPoints;
    this.roundIndex = 1;
    this.playerIndex = 0;
    this.lockedHeart = true;
    this.waitingForPlayer = false;
    this.exchange = false;
    this.players = [];
    this.trick = new Trick();
    this.allCards = [];

    this.createPlayers();
  }

  get trickColor(){
    return this.trick.color;
  }

  get numberCardsOnTable(){
    return this.trick.cardsOnTable.length;
  }

  get playerCards(){
    if(this.exchange){
      return this.players[0].deck.cards;
    }else if(this.playerIndex !== 0){
      return this.players[0].deck.cards.map(card => ({ ...card, active: false }));
    }else {
      return this.getPlayerCards();
    }
  }

  get playersPoints(){
    return this.players.map((player, index) => ({ playerIndex: index, round: player.roundPoints, total: player.totalPoints }));
  }

  createPlayers(){
    this.players.push(new Player());
    for(let i = 1; i < 4; i++) this.players.push(new Computer());
  }

  deal(){
    const deck = new Deck();

    this.allCards = [...deck.cards.map(card => ({ ...card, used: false }))];

    deck.shuffle();

    this.players.forEach((player, index) => {
      player.deck = new Deck(deck.cards.slice(index * 13, (index + 1) * 13));
      player.deck.sort();
    });

    this.lockedHeart = true;
    this.setStartingPlayer();
  }

  setStartingPlayer(){
    this.playerIndex = this.players.findIndex(player => player.hasStartingCard());
    this.waitingForPlayer = this.playerIndex === 0;
  }

  incPlayerIndex(){
    this.playerIndex = (this.playerIndex + 1) % this.players.length;
    this.waitingForPlayer = this.playerIndex === 0;
  }

  isCardsExchange(){
    this.exchange = this.roundIndex % 4 !== 0
    return this.exchange;
  }

  checkGameOver(){
    return this.players.some(player => player.totalPoints >= this.thresholdPoints);
  }

  isLockedCard({color, value}){
    return ((color === "♠" && value === "Q") || (this.lockedHeart && color === "♥")) ? true : false;
  }

  getPlayerCards(){
    const cards = [...this.players[this.playerIndex].deck.cards.map(card => ({...card, active: false}))];
    const isFirstTrickCard = this.numberCardsOnTable === 0;
    
    if(isFirstTrickCard){
      if(this.players[this.playerIndex].numberOfCards === 13){
        cards[0].active = true;
      }else{
        cards.forEach(card => card.active = !this.isLockedCard(card));
      }
    } else {
      const trickColor = this.trickColor;
      cards.forEach(card => card.active = (card.color === trickColor));
    }

    const isActiveCard = cards.some(card => card.active);
    if(!isActiveCard) cards.forEach(card => card.active = true);

    return cards;
  }

  getAllowedCards(){
    const cards = this.getPlayerCards();
    return cards.filter(card => card.active);
  }

  cardsExchange(selectedCards){
    if(!this.exchange) return;

    const rest = this.roundIndex % 4;

    const swapUserIndexes = [];
    const swapUserCards = [];

    swapUserCards[0] = [...this.players[0].passCards(...selectedCards)];
    swapUserIndexes[0] = rest % 4;

    for(let i = 1; i < this.players.length; i++){
      swapUserIndexes[i] = (i + rest) % 4;
      swapUserCards[i] = [...this.players[i].selectExchangeCards()];
    }

    for(let i = 0; i < swapUserIndexes.length; i++) this.players[swapUserIndexes[i]].collectCards(...swapUserCards[i]);
    
    this.exchange = false;
    this.setStartingPlayer();
  }

  checkTrick(){
    const result = this.trick.clear();

    this.players[result.playerIndex].roundPoints += result.points;
    this.playerIndex = result.playerIndex;
    this.waitingForPlayer = this.playerIndex === 0;

    return result.playerIndex;
  }

  checkRound(){
    const indexPoints26 = this.players.findIndex(player => player.roundPoints === 26);
    const points = new Array(4).fill(26);
    if(indexPoints26 < 0){
      this.players.forEach((player, index) => {
        points[index] = player.roundPoints;
        player.assignPoints();
      });
    }else{
      points[indexPoints26] = 0;
      this.players.forEach((player, index) => {
        if(index === indexPoints26) player.assignPoints(0);
        else player.assignPoints(26);
      });
    }

    this.roundIndex++;
    return points;
  }

  computerMove(action = null){
    let card;

    if(action){
      card = this.players[this.playerIndex].passCards(action)[0];
    }else{
      const mcts = new MCTS(this.playerIndex);
      const { action } = mcts.search(this.clone(), 50);
      card = this.players[this.playerIndex].passCards(action)[0];
    }
    
    this.pushTrickCard(card);
    return { color: card.color, value: card.value };
  }

  playerMove(color, value){
    const card = (this.players[this.playerIndex].passCards({color, value}))[0];
    this.pushTrickCard(card);
  }

  pushTrickCard(card){
    (this.allCards.find(c => c.color === card.color && c.value === card.value)).used = true;

    if(card.color === "♥") this.lockedHeart = false;
    this.trick.push(card, this.playerIndex);
    this.incPlayerIndex();
  }

  isEndOfRound(){
    return this.allCards.every(card => card.used);
  }

  clone(){
    const gameCopy = new Game(this.thresholdPoints);

    gameCopy.roundIndex = this.roundIndex;
    gameCopy.playerIndex = this.playerIndex;
    gameCopy.lockedHeart = this.lockedHeart;
    gameCopy.waitingForPlayer = this.waitingForPlayer;
    gameCopy.exchange = this.exchange;
    gameCopy.allCards = [...this.allCards.map(c => ({...c}))];

    this.players.forEach((player, index) => {
      const cards = player.deck.cards.map(c => new Card(c.value, c.color));
      gameCopy.players[index].deck = new Deck(cards);
      gameCopy.players[index].roundPoints = player.roundPoints;
      gameCopy.players[index].totalPoints = player.totalPoints;
    });
  
    gameCopy.trick = new Trick();
    gameCopy.trick.color = this.trickColor;
    gameCopy.trick.cardsOnTable = this.trick.cardsOnTable.map(item => ({ card: new Card(item.card.value, item.card.color), playerIndex: item.playerIndex }));

    return gameCopy;
  }

  simulateMove({value, color}){ 
    const card = this.players[this.playerIndex].passCards({value, color})[0];
    this.pushTrickCard(card);
    if(this.numberCardsOnTable === 4) this.checkTrick();
  }
}

export default Game;