import { sleep } from '../utils.js';
class UI {
  static getCardsHTML(cards){
    return cards.map(({color, value, active = true}) => `
      <div data-color="${color}" data-value="${value}" class="card ${color === "♦" || color === "♥" ? "red" : "black"} ${active ? "active" : "blocked"}">
        <p>${value}</p>
        <div>${color}</div>
      </div>
    `).join('');
  }

  static showStartPage(){
    document.querySelector(".game").classList.add("hidden");
    document.querySelector(".start").classList.remove("hidden");
  }

  static showGamePage(){
    const pointsElements = document.querySelectorAll(".points");
    pointsElements.forEach(el => el.textContent = "0 : 0");
    document.querySelector(".user .cards").innerHTML = "";
    UI.updateTrickColor('♣');

    document.querySelector(".start").classList.add("hidden");
    document.querySelector(".game").classList.remove("hidden");
  }

  static drawPlayerCards(cards){
    const cardsContainer = document.querySelector(".cards");
    cardsContainer.innerHTML = this.getCardsHTML(cards);
  }

  static addCardTrick({color, value}, playerIndex){
    const cardElement = document.querySelector(`.card-player-${playerIndex}`);
    cardElement.classList.toggle("red", color === "♦" || color === "♥");
    cardElement.classList.toggle("black", !(color === "♦" || color === "♥"));
    cardElement.innerHTML = `<p>${value}</p><div>${color}</div>`;
    cardElement.classList.add("animate");
  }

  static updateTrick(winnerIndex){
    const trickElement = document.querySelector(".trick");
    trickElement.classList.add(`win-${winnerIndex}`);
  }

  static async clearTrick(){
    const trickElement = document.querySelector(".trick");
    const cardsTrick = document.querySelectorAll(".card-trick");

    for(let i = 0; i < cardsTrick.length; i++){
      cardsTrick[i].classList.remove("animate");
    }

    await sleep(300);
    trickElement.classList.remove("win-0", "win-1", "win-2", "win-3");
  }

  static updatePoints(playersPoints){
    playersPoints.forEach((points, index) => {
      const pointsElement = document.querySelector(`.player-${index} .points`);
      pointsElement.textContent = `${points.round} : ${points.total}`;
    });
  }

  static showCardsExchange(cards){
    const modal = document.querySelector(".modal");
    modal.classList.remove("cards--blocked");
    modal.innerHTML = `
      <h3>Wybierz trzy karty dla przeciwnika</h3>
      <div class="modal__cards">
        ${this.getCardsHTML(cards)}
      </div>
      <button disabled class="pass__btn">Przekaż</div>
    `;
    modal.showModal();
  }

  static hideModal(){
    const modal = document.querySelector(".modal");
    modal.innerHTML = "";
    modal.close();
  }

  static showGameResult(playersPoints){
    const modal = document.querySelector(".modal");

    playersPoints.sort((a,b) => a.total - b.total);

    const ranking = playersPoints.map(player => `
      <li>${player.playerIndex === 0 ? "Ty" : `Gracz ${player.playerIndex}`}: <span>${player.total} pkt</span></li>
    `).join('');

    modal.innerHTML = `
      <h3>Punktacja</h3>
      <ul>${ranking}</ul>
      <button class="back__btn">Wróć do strony startowej</button>
    `;

    modal.showModal();
  }

  static updateTrickColor(color){
    const trickColor = document.querySelector(".trick-color");
    trickColor.classList.toggle("red", color === "♦" || color === "♥");
    trickColor.classList.toggle("black", !(color === "♦" || color === "♥"));
    trickColor.textContent = color;
  }
}

export default UI;