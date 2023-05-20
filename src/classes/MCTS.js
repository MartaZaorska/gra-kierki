class Node {
  constructor(game, action = null, parent = null){
    this.game = game;
    this.action = action;
    this.isFinal = this.game.isEndOfRound();
    this.isFull = this.isFinal;
    this.parent = parent;
    this.visits = 0;
    this.score = 0;
    this.children = new Map();
  }

  expand(){
    const allowedActions = this.game.getAllowedCards();
    for(let action of allowedActions){
      const key = `${action.value}${action.color}`;

      if(!this.children.has(key)){
        const actionGame = this.game.clone();
        actionGame.simulateMove(action);
        const newNode = new Node(actionGame, action, this);
        this.children.set(key, newNode);

        if(allowedActions.length === this.children.size) this.isFull = true;
        return newNode;
      }
    }
  }
}

class MCTS {
  constructor(playerIndex){
    this.root = null;
    this.playerIndex = playerIndex;
  }

  search(game, iterations){
    this.root = new Node(game);

    for(let i = 0; i < iterations; i++){
      const node = this.select(this.root);
      const score = this.simulate(node.game);
      this.backpropagate(node, score);
    }

    return this.getBestMove(this.root, 0); 
  }

  select(node){
    while(!node.isFinal){
      if(node.isFull){
        const bestMove = this.getBestMove(node, 2);
        node = bestMove.node;
      }else{
        return node.expand();
      }
    }

    return node;
  }

  simulate(game){
    let gameCopy = game.clone();
    while(!gameCopy.isEndOfRound()){
      const allowedActions = gameCopy.getAllowedCards();
      const action = gameCopy.players[gameCopy.playerIndex].selectCard(
        allowedActions, 
        gameCopy.allCards, 
        gameCopy.trick.cardsOnTable, 
        gameCopy.trickColor
      );
      
      gameCopy.simulateMove(action);
    }

    const points = gameCopy.checkRound();
    return 26 - points[this.playerIndex];
  }

  backpropagate(node, score){
    while(node){
      node.visits += 1;
      node.score += score;
      node = node.parent;
    }
  }

  getBestMove(node, explorationConstant){
    let bestScore = -Infinity;
    let bestNodes = [];

    node.children.forEach(child => {
      const score = child.score / child.visits + explorationConstant * Math.sqrt(Math.log(node.visits) / child.visits);
      if(score > bestScore){
        bestScore = score;
        bestNodes = [child];
      }else if(score === bestScore){
        bestNodes.push(child);
      }
    });
  
    const randomIndex = Math.floor(Math.random() * bestNodes.length);

    return {
      action: bestNodes[randomIndex].action, 
      node: bestNodes[randomIndex]
    };
  }
}

export default MCTS;