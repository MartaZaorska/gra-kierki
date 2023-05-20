class Trick {
  constructor(){
    this.color = null;
    this.cardsOnTable = [];
  }

  push(card, playerIndex){
    if(this.cardsOnTable.length === 0) this.color = card.color;
    this.cardsOnTable.push({ card, playerIndex });
  }

  check(){
    if(this.cardsOnTable.length < 4) return null;

    let points = 0;
    let higherCardIndex = 0;

    this.cardsOnTable.forEach(({ card }, index) => {
      points += card.points;
      if(card.color === this.color && card.isHigherThan(this.cardsOnTable[higherCardIndex].card)) higherCardIndex = index;
    });

    return { playerIndex: this.cardsOnTable[higherCardIndex].playerIndex, points };
  }

  clear(){
    const result = this.check();
    this.color = null;
    this.cardsOnTable = [];
    return result;
  }
}

export default Trick;