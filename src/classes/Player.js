import { VALUES } from "../data/constants";

function valueIndex(card){
  return VALUES.indexOf(card.value);
}

function groupCardsByColor(cards){
  const result = [...cards].reduce((prev, curr) => {
    prev[curr.color].push(curr);
    return prev;
  }, {'♥': [], '♠': [], '♣': [], '♦': []});

  for(const arr of Object.values(result)){
    arr.sort((a,b) => valueIndex(b) - valueIndex(a));
  }

  return result;
}

function sortCardsByWorth(cards){
  const tmp = [...cards].reduce((prev, curr) => {
    prev[curr.color === "♥" || curr.color === "♠" ? 0 : 1].push(curr);
    return prev;
  }, [[], []]);
  
  tmp[0].sort((a, b) => {
    if(b.color === a.color) return b.points === a.points ? valueIndex(b) - valueIndex(a) : b.points - a.points;
    const tmp = a.color === "♠" ? a : b;
    return valueIndex(tmp) >= 10 ? 1 : b.points - a.points;
  });

  tmp[1].sort((a, b) => valueIndex(b) - valueIndex(a));

  return [...tmp[0], ...tmp[1]];
}
export class Player {
  constructor(){
    this.deck = null;
    this.totalPoints = 0;
    this.roundPoints = 0;
  }

  get numberOfCards(){
    return this.deck.cards.length;
  }

  hasStartingCard(){
    return this.deck.cards[0].color === "♣" && this.deck.cards[0].value === "2";
  }

  assignPoints(points = null){
    this.totalPoints += points ?? this.roundPoints;
    this.roundPoints = 0;
  }

  collectCards(...cards){
    this.deck.addCards(...cards);
  }

  passCards(...cards){
    return this.deck.getCards(...cards);
  }

  selectCard(allowedCards, allCards, cardsOnTable, trickColor){
    if(allowedCards.length === 1) return { color: allowedCards[0].color, value: allowedCards[0].value };

    let card;

    const gAllCards = groupCardsByColor(allCards);
    const gAllowedCards = groupCardsByColor(allowedCards);

    if(!trickColor) card = this.selectFirstCard(allowedCards);
    else if(gAllowedCards[trickColor].length === 0) card = this.selectAnyColor(allowedCards);
    else card = this.selectCardByColor(gAllowedCards, gAllCards, cardsOnTable, trickColor);

    return { color: card.color, value: card.value };
  }

  selectFirstCard(allowedCards){
    const sortedCards = sortCardsByWorth(allowedCards);
    return { ...sortedCards[sortedCards.length - 1] };
  }

  selectCardByColor(allowedCards, allCards, cardsOnTable, trickColor){
    const highestCardOnTable = ([...cardsOnTable].filter(item => item.card.color === trickColor)).sort((a, b) => valueIndex(b.card) - valueIndex(a.card))[0].card;
    
    if(trickColor === '♠' && !cardsOnTable.find(c => c.card.value === "Q")){  
      const queenOfSpades = allowedCards[trickColor].find(c => c.value === "Q");
      if(queenOfSpades && valueIndex(highestCardOnTable) > valueIndex(queenOfSpades)) return queenOfSpades;
      if(!queenOfSpades && !allCards[trickColor].find(c => c.value === "Q").used && cardsOnTable.length === 3) return allowedCards[trickColor][0];
    }
    
    const card = allowedCards[trickColor].find(c => valueIndex(c) < valueIndex(highestCardOnTable));
    return card ?? allowedCards[trickColor][allowedCards[trickColor].length - 1];
  }

  selectAnyColor(allowedCards){
    const sortedCards = sortCardsByWorth(allowedCards);
    return { ...sortedCards[0] };
  }
}

export class Computer extends Player {
  constructor(){
    super();
  }  

  selectExchangeCards(){
    const selectedCards = sortCardsByWorth(this.deck.cards);
    return this.passCards(...selectedCards.slice(0,3));
  }
}