import './styles/index.css';

import Game from './classes/Game.js';
import UI from './classes/UI.js';

import { sleep } from './utils.js';

const modalElement = document.querySelector(".modal");
const cardsElement = document.querySelector(".cards");
const playButton = document.querySelector(".control__button");

let game = null;
let selectedCards = [];


if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js').then(() => {
      console.log('SW registered');
    }).catch(registrationError => {
      console.log('SW registration failed', registrationError);
    });
  });
}

function startRound(){
  UI.updateTrickColor('♣');
  
  game.deal();
  
  if(game.isCardsExchange()){
    UI.showCardsExchange(game.playerCards);
  }else{
    startTrick();
  }
}

function startTrick(){
  if(game.players[0].numberOfCards === 0){
    finishRound();
    return;
  }

  UI.drawPlayerCards(game.playerCards);

  if(!game.waitingForPlayer) computerSimulation();
}

function finishRound(){
  game.checkRound();

  const playersPoints = game.playersPoints;
  UI.updatePoints(playersPoints);

  if(game.checkGameOver()){
    UI.showGameResult(playersPoints);
    game = null;
    return;
  }

  startRound();
}

async function finishTrick(){
  await sleep(200);
  const winnerIndex = game.checkTrick();
  UI.updateTrick(winnerIndex);
  UI.updatePoints(game.playersPoints);
  await sleep(200);
  await UI.clearTrick();
  await sleep(200);
  startTrick();
}

async function computerSimulation(){
  while(!game.waitingForPlayer && game.numberCardsOnTable < 4){
    const playerIndex = game.playerIndex;
    const card = game.computerMove();
    UI.updateTrickColor(game.trickColor);
    UI.addCardTrick(card, playerIndex);
    await sleep(200);
  }

  if(game.numberCardsOnTable === 4){
    finishTrick();
  }else if(game.waitingForPlayer){
    UI.drawPlayerCards(game.playerCards);
  }
}

function clickModalHandler(e){
  if(e.target.matches(".pass__btn")){
    game.cardsExchange(selectedCards);
    UI.hideModal();
    selectedCards = [];
    startTrick();
    return;
  }

  if(e.target.matches(".back__btn")){
    UI.showStartPage();
    UI.hideModal();
  }

  if(!e.target.matches('.card')) return;

  const btn = document.querySelector(".pass__btn");
  const { color, value } = e.target.dataset;
  const index = selectedCards.findIndex(card => card.color === color && card.value === value);
  
  if(index < 0){
    selectedCards.push({color, value});
    e.target.classList.add("selected");
  }else{
    selectedCards.splice(index, 1);
    e.target.classList.remove("selected");
    btn.setAttribute("disabled", true);
    modalElement.classList.remove("cards--blocked");
  }

  if(selectedCards.length === 3){
    btn.removeAttribute("disabled");
    modalElement.classList.add("cards--blocked");
  }
}

async function clickCardHandler(e){
  if(!e.target.matches(".card")) return;

  const { color, value } = e.target.dataset;
  game.playerMove(color, value);

  UI.updateTrickColor(game.trickColor);
  UI.drawPlayerCards(game.playerCards);
  UI.addCardTrick({color, value}, 0);

  await sleep(200);
  
  UI.drawPlayerCards(game.playerCards);

  if(game.numberCardsOnTable === 4){
    finishTrick();
  }else{
    computerSimulation();
  }
}

function startGameHandler(){
  const inputNumber = document.getElementById("threshold-points");
  const points = +inputNumber.value;
  game = new Game(points);
  UI.showGamePage();
  startRound();
}

//event handlers
modalElement.addEventListener("click", clickModalHandler);
cardsElement.addEventListener("click", clickCardHandler);
playButton.addEventListener("click", startGameHandler);