import { COLORS, VALUES } from '../data/constants.js';

function createFullDeck(){
  const deck = COLORS.map(color => VALUES.map(value => new Card(value, color)));
  return deck.flat();
}

export class Card {
  constructor(value, color){
    this.value = value;
    this.color = color;
    this.points = color === '♥' ? 1 : (color === '♠' && value === "Q" ? 13 : 0);
  }

  get valueIndex(){
    return VALUES.indexOf(this.value);
  }

  get colorIndex(){
    return COLORS.indexOf(this.color);
  }

  isHigherThan(card){
    return card?.color === this.color && this.valueIndex > card?.valueIndex;
  }
}

class Deck {
  constructor(cards = createFullDeck()){
    this.cards = cards;
  }

  get numberOfCards(){
    return this.cards.length;
  }

  shuffle(){
    for(let i = this.numberOfCards - 1; i > 0; i--){
      const j = Math.floor(Math.random() * (i + 1));
      const tmp = this.cards[j];
      this.cards[j] = this.cards[i];
      this.cards[i] = tmp;
    }
  }

  sort(){
    this.cards.sort((card1, card2) => {
      const color1 = card1.colorIndex;
      const color2 = card2.colorIndex;
      
      if(color1 !== color2) return color1 - color2;

      const value1 = card1.valueIndex;
      const value2 = card2.valueIndex;

      return value1 - value2;
    });
  }

  addCards(...cards){
    this.cards = [...this.cards, ...cards];
    this.sort();
  }

  getCards(...data){
    const returnCards = [];
    
    data.forEach(item => {
      const cardIndex = this.cards.findIndex(card => card.color === item.color && card.value === item.value);
      if(cardIndex >= 0){
        returnCards.push(...this.cards.splice(cardIndex, 1));
      }
    });

    return returnCards;
  }
}

export default Deck;