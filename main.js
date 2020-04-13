const cards = [
    10, 10, 10, 10, 10, 10,
    20, 20, 20, 20, 20, 20,
    30, 30, 30, 30, 30, 30,
    40, 40, 40, 40, 40, 40,
    50, 50, 50, 50, 50, 50,
    60, 60, 60, 60, 60, 60,
    'tecza', 'tecza', 'tecza',
    'stop', 'stop', 'stop',
    'balast', 'balast', 'balast',
]

let state = {
    numberOfPlayers: 0,
    cardsStack: [],
    cardsOnBoard: [],
    onDice: '',
    currentPlayer: 'player0',
    mustEndTurn: false,
    revealedCards: [],
}

function onStartGame(howManyPlayers) {
    const playersTabsContainer = document.querySelector('.js-players-tabs-container');
    const players = {};
    for (let i = 0; i < howManyPlayers; i++) {
        players['player' + i] = {
            score: 0,
        }
        const playerTab = document.createElement('div')
        playerTab.classList.add('player-tab', `js-player${i}`);
        playerTab.innerText = '0';
        playersTabsContainer.appendChild(playerTab);
    }
    state = {
        ...state,
        numberOfPlayers: howManyPlayers,
        cardsStack: cards.slice(),
        ...players,
    }
    setCardsOnBoard();
}

function onCardClick(e) {
    if (state.mustEndTurn || state.revealedCards.length >= state.onDice) return;

    const cardValue = e.target.getAttribute('data-card');
    const cardIndex = e.target.getAttribute('data-index');
    e.target.innerText = cardValue;
    e.target.style.color = 'red'

    const revealedCards = state.revealedCards;
    if (revealedCards.findIndex(el => el.cardIndex === cardIndex) === -1) revealedCards.push({ cardIndex, cardValue });
    const previousCard = revealedCards[revealedCards.length - 2];
    if (previousCard && previousCard === 'balast') {
        const cardBeforBalast = revealedCards[revealedCards.length - 3];
        if (cardBeforBalast && parseInt(cardValue) > parseInt(cardBeforBalast.cardValue)) {
            state = {
                ...state,
                mustEndTurn: true,
            }
            return;
        }
    } else if (previousCard && cardValue !== 'stop') {
        if (parseInt(cardValue) < parseInt(previousCard.cardValue)) {
            state = {
                ...state,
                mustEndTurn: true,
            }
            return;
        }
    }
    if (revealedCards.length === state.onDice || cardValue === 'stop') {
        state = {
            ...state,
            mustEndTurn: true,
            [state.currentPlayer]: {
                score: state[state.currentPlayer].score + revealedCards.length,
            }
        }
        return
    };
    state = {
        ...state,
        revealedCards,
    }
}

function throwDice() {
    if (state.onDice != '') return;
    const diceEl = document.querySelector('.js-dice');
    const onDice = Math.floor(Math.random() * Math.floor(5)); // losowanie 0-5
    diceEl.innerText = onDice;
    if (onDice === 0) {
        const cardsStack = state.cardsStack
        const randomIndex = Math.floor(cardsStack.length * Math.random());
        cardsStack.splice(randomIndex, 1);
        state = {
            ...state,
            onDice,
            mustEndTurn: true,
            cardsStack,
            [state.currentPlayer]: {
                score: state[state.currentPlayer].score + 1,
            }
        }
        return;
    }
    state = {
        ...state,
        onDice
    }
}

function appendCardsToDom(cardsArr) {
    const boardContainer = document.querySelector('.js-board-container')
    boardContainer.innerHTML = '';
    cardsArr.forEach((el, i) => {
        const card = document.createElement('div');
        card.classList.add('card');
        card.setAttribute('data-card', el);
        card.setAttribute('data-index', i);
        // card.innerText = el; // to remove
        card.addEventListener('click', onCardClick);
        boardContainer.appendChild(card);
    })
}

function setCardsOnBoard() {
    const board = [];
    let newCardStack = state.cardsStack;
    for (let i = 0; i < 9; i++) {
        const randomIndex = Math.floor(state.cardsStack.length * Math.random());
        board.push(state.cardsStack[randomIndex]);
        newCardStack.splice(randomIndex, 1);
    }
    appendCardsToDom(board);
    state = {
        ...state,
        cardsStack: newCardStack,
        cardsOnBoard: board,
    }
}

function endRound() {
    if (!state.mustEndTurn) return;
    const revealedCards = state.revealedCards;
    const indexes = revealedCards.reduce((acc, el) => {
        acc.push(parseInt(el.cardIndex))
        return acc;
    }, [])
    const cardsStack = state.cardsStack;
    const cardsOnBoard = state.cardsOnBoard;
    indexes.forEach((index) => {
        const randomIndex = Math.floor(cardsStack.length * Math.random());
        cardsOnBoard[index] = cardsStack[randomIndex];
        cardsStack.splice(randomIndex, 1);
    })
    appendCardsToDom(cardsOnBoard);

    const currentPlayerNumber = parseInt(state.currentPlayer.slice(6, state.currentPlayer.length));
    let newCurrentPlayer = ''
    if (currentPlayerNumber === state.numberOfPlayers -1) newCurrentPlayer = 'player0';
    else newCurrentPlayer = `player${currentPlayerNumber + 1}`;    
    document.querySelector(`.js-player${currentPlayerNumber}`).innerText = state[state.currentPlayer].score;
    document.querySelector('.js-dice').innerText = '';

    state = {
        ...state,
        cardsOnBoard,
        cardsStack,
        onDice: '',
        revealedCards: [],
        mustEndTurn: false,
        currentPlayer: newCurrentPlayer,
    }
}

window.addEventListener('load', () => {
    onStartGame(2);
    document.querySelector('.js-dice').addEventListener('click', throwDice);
    document.querySelector('.js-end-round').addEventListener('click', endRound);
})
