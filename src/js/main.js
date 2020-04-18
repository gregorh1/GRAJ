const anime = require('animejs');

const config = {
    logs: false,
    debugMode: false,
};

function setState(newProps) {
    // dom manipulation depending on state changing
    if (newProps.mustEndTurn && newProps.mustEndTurn !== state.mustEndTurn) {
        document.querySelector('.js-end-round').innerText = 'zakończ rundę';
        const activePlayerTab = document.querySelector('.js-players-tabs-container .active');
        if (newProps[state.currentPlayer] && newProps[state.currentPlayer].score !== state[state.currentPlayer].score) {
            activePlayerTab.classList.add('succeed')
        } else activePlayerTab.classList.add('fail');
    }
    if (newProps.onDice === 'rzuć kostką') {
        document.querySelector('.js-end-round').innerText = '';
        document.querySelector('.js-dice').classList.remove('is-number');
    }
    if (newProps.onDice && newProps.onDice !== state.onDice) {
        const diceEl = document.querySelector('.js-dice');
        diceEl.innerText = newProps.onDice;
        if (newProps.onDice !== 0 && newProps.onDice !== 'rzuć kostką') diceEl.classList.add('is-number');
    }
    if (newProps.onDice === 0) document.querySelector('.js-dice').innerText = 'chmurka';
    if (newProps.cardsStack && newProps.cardsStack.length !== 0) document.querySelector('.js-start-dialog').style.display = 'none';
    if (newProps.gameEnded) document.querySelector('.js-dice').innerText = 'koniec gry';

    if (newProps.currentPlayer && newProps.currentPlayer !== state.currentPlayer) {
        const playerTab = document.querySelector(`.js-${state.currentPlayer}`)
        playerTab.innerText = state[state.currentPlayer].score;
        playerTab.classList.remove('active', 'succeed', 'fail');
        document.querySelector(`.js-${newProps.currentPlayer}`).classList.add('active');
    }

    if (config.logs) {
        console.log('%c caller: ', 'color: grey; font-weight: 600', arguments.callee.caller.name, new Date().toISOString().slice(11,19));
        console.log('%c prev state: ', 'color: red; font-weight: 600', state);
        console.log('%c new props: ', 'color: orange; font-weight: 600', newProps);
    }
    // setting the state
    state = {
        ...state,
        ...newProps
    };
    if (config.logs) {
        console.log('%c new state: ', 'color: green; font-weight: 600', state);
        console.log('%c -', 'color: grey; font-weight: 600');
    }

    // dom manipulation after state has changed
    document.querySelector('.js-stack').innerText = state.cardsStack.length;
}

let state = {
    numberOfPlayers: 2,
    cardsStack: [],
    cardsOnBoard: [],
    onDice: 'rzuć kostką',
    currentPlayer: 'player0',
    mustEndTurn: false,
    revealedCards: [],
    gameEnded: false,
}

const cards = [
    10, 10, 10, 10, 10, 10,
    20, 20, 20, 20, 20, 20,
    30, 30, 30, 30, 30, 30,
    40, 40, 40, 40, 40, 40,
    50, 50, 50, 50, 50, 50,
    60, 60, 60, 60, 60, 60,
    'tęcza', 'tęcza', 'tęcza',
    'stop', 'stop', 'stop',
    'balast', 'balast', 'balast',
]

function setPlayersNumber(isAdd) {
    const el = document.querySelector('.js-start-players-number');
    const prevNum = parseInt(el.innerText);
    let num = prevNum;
    if (isAdd === 'add' && prevNum < 5) num += 1;
    else if (isAdd !== 'add' && prevNum > 2) num -= 1
    
    el.innerText = num;

    setState({
        numberOfPlayers: num,
    })
}

function appendCardsToDom(cardsArr) {
    const boardContainer = document.querySelector('.js-board-container')
    boardContainer.innerHTML = '';
    cardsArr.forEach((cardValue, i) => {
        const card = document.createElement('div');
        card.classList.add('card');
        if (isNaN(cardValue)) card.classList.add('no-number')
        card.setAttribute('data-card', cardValue);
        card.setAttribute('data-index', i);
        if (config.debugMode) card.innerText = cardValue; // debug
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
    setState({
        cardsStack: newCardStack,
        cardsOnBoard: board,
    })
}

function onStartGame() {
    const players = {};
    for (let i = 0; i < state.numberOfPlayers; i++) {
        players['player' + i] = {
            score: 0,
        }
        const playerTab = document.createElement('div')
        playerTab.classList.add('player-tab', `js-player${i}`);
        if (i === 0) playerTab.classList.add('active');
        playerTab.innerText = '0';
        document.querySelector('.js-players-tabs-container').appendChild(playerTab);
    }
    setState({
        cardsStack: cards.slice(),
        ...players,
    })
    setCardsOnBoard();
}

function throwDice() {
    if (state.onDice != 'rzuć kostką' || state.gameEnded) return;
    const onDice = Math.floor(Math.random() * Math.floor(5)); // set random number from 0 to 5
    if (onDice === 0) {
        const cardsStack = state.cardsStack
        if (cardsStack.length === 0) return;
        const randomIndex = Math.floor(cardsStack.length * Math.random());
        cardsStack.splice(randomIndex, 1);
        setState({
            onDice,
            mustEndTurn: true,
            cardsStack,
            [state.currentPlayer]: {
                score: state[state.currentPlayer].score + 1,
            }
        })
        return;
    }
    setState({
        onDice
    })
}

function onCardClick(e) {
    if (state.mustEndTurn || state.revealedCards.length >= state.onDice || state.onDice === 'rzuć kostką') return;
    const cardValue = e.target.getAttribute('data-card');
    const cardIndex = e.target.getAttribute('data-index');
    e.target.innerText = cardValue;
    if (config.debugMode) e.target.style.color = 'green' // debug
    const revealedCards = state.revealedCards;
    if (cardValue === 'balast') {
        setState({
            onDice: state.onDice + 1,
        })
    }
    if (revealedCards.findIndex(el => el.cardIndex === cardIndex) === -1) revealedCards.push({ cardIndex, cardValue });
    const previousCard = revealedCards[revealedCards.length - 2];    
    if (previousCard && previousCard.cardValue === 'balast') {
        const cardBeforBalast = revealedCards[revealedCards.length - 3];
        console.log('cardValue: ', cardValue, 'cardBeforBalast: ', cardBeforBalast);
        
        if (cardBeforBalast && parseInt(cardValue) > parseInt(cardBeforBalast.cardValue)) {
            setState({
                revealedCards: [],
                mustEndTurn: true,
            })
            return;
        }
    } else if (previousCard && cardValue !== 'stop') {
        if (parseInt(cardValue) < parseInt(previousCard.cardValue)) {
            setState({
                revealedCards: [],
                mustEndTurn: true,
            })
            return;
        }
    }
    if (revealedCards.length === state.onDice || cardValue === 'stop') {
        setState({
            mustEndTurn: true,
            [state.currentPlayer]: {
                score: state[state.currentPlayer].score + revealedCards.length,
            }
        })
        return
    };
    setState({
        revealedCards,
    })
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
    if (currentPlayerNumber === state.numberOfPlayers - 1) newCurrentPlayer = 'player0';
    else newCurrentPlayer = `player${currentPlayerNumber + 1}`;
    let gameEnded = false;
    if (state.cardsStack.length < state.revealedCards.length) {
        gameEnded = true;
    }

    setState({
        cardsOnBoard,
        cardsStack,
        onDice: 'rzuć kostką',
        revealedCards: [],
        mustEndTurn: false,
        currentPlayer: newCurrentPlayer,
        gameEnded,
    })
}

window.addEventListener('load', () => {
    document.querySelector('.js-dice').addEventListener('click', throwDice);
    document.querySelector('.js-end-round').addEventListener('click', endRound);
    document.querySelector('.js-add').addEventListener('click', () => setPlayersNumber('add'));
    document.querySelector('.js-substract').addEventListener('click', () => setPlayersNumber());
    document.querySelector('.js-start-play').addEventListener('click', () => onStartGame());
    setState({}); // for logs
})
