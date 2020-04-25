import './style.css';
import anime from 'animejs/lib/anime.es.js';
import {animateLinesToTarget} from './helper'


const config = {
    logs: false,
    debugMode: false,
};

function setState(newProps) {
    if (newProps.mustEndTurn && newProps.mustEndTurn !== state.mustEndTurn) {
        anime({
            targets: '.js-end-round',
            scale: '1',
            opacity: '1',
            duration: 200,
            delay: 300,
            easing: 'easeInQuart',
        });
        const activePlayerTab = document.querySelector('.js-players-tabs-container .active');
        if (newProps[state.currentPlayer] && newProps[state.currentPlayer].score !== state[state.currentPlayer].score) {
            activePlayerTab.classList.add('succeed');
        } else activePlayerTab.classList.add('fail');
    }
    if (newProps.onDice === 'rzuć kostką') {
        anime({
            targets: '.js-end-round',
            scale: '0',
            opacity: '0',
            duration: 200,
            easing: 'easeInQuart',
        });
        document.querySelector('.js-dice').classList.remove('is-number');
    }
    if (newProps.onDice && newProps.onDice !== state.onDice) {
        const diceEl = document.querySelector('.js-dice');
        diceEl.innerText = newProps.onDice;
        if (newProps.onDice !== 0 && newProps.onDice !== 'rzuć kostką') diceEl.classList.add('is-number');
    }
    if (newProps.onDice === 0) document.querySelector('.js-dice').innerText = 'chmurka';
    if (newProps.gameEnded) document.querySelector('.js-dice').innerText = 'koniec gry';

    if (newProps.currentPlayer && newProps.currentPlayer !== state.currentPlayer) {
        const playerTab = document.querySelector(`.js-${state.currentPlayer}`);
        playerTab.innerText = state[state.currentPlayer].score;
        playerTab.classList.remove('active', 'succeed', 'fail');
        document.querySelector(`.js-${newProps.currentPlayer}`).classList.add('active');
    }

    if (config.logs) {
        console.log('%c prev state: ', 'color: red; font-weight: 600', state);
        console.log('%c new props: ', 'color: orange; font-weight: 600', newProps);
    }

    state = {
        ...state,
        ...newProps
    };
    if (config.logs) {
        console.log('%c new state: ', 'color: green; font-weight: 600', state);
        console.log('%c -', 'color: grey; font-weight: 600');
    }
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
};

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
];

function setPlayersNumber(isAdd) {
    const el = document.querySelector('.js-start-players-number');
    const prevNum = parseInt(el.innerText);
    let num = prevNum;
    if (isAdd === 'add' && prevNum < 5) num += 1;
    else if (isAdd !== 'add' && prevNum > 2) num -= 1;
    el.innerText = num;
    setState({
        numberOfPlayers: num,
    })
}

function appendCardsToDom(cardsArr) {
    const boardContainer = document.querySelector('.js-board-container');
    boardContainer.innerHTML = '';
    cardsArr.forEach((cardValue, i) => {
        const card = document.createElement('div');
        card.classList.add('card');
        if (isNaN(cardValue)) card.classList.add('no-number');
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
        };
        const playerTab = document.createElement('div');
        playerTab.classList.add('player-tab', 'js-player-tab', `js-player${i}`);
        if (i === 0) playerTab.classList.add('active');
        playerTab.innerText = '0';
        document.querySelector('.js-players-tabs-container').appendChild(playerTab);
    }
    setState({
        cardsStack: cards.slice(),
        ...players,
    });
    setCardsOnBoard();
    anime({
        targets: '.js-start-dialog',
        translateY: {value: '-110vh', delay: 250},
        translateX: {value: '150vw', delay: 250},
        rotate: 540,
        scale: '.1',
        easing: 'easeInQuad',
        duration: 400,
    });
    anime({
        targets: '.js-end-round',
        scale: '0',
        opacity: '0',
        duration: 200,
        delay: 300,
        easing: 'easeInQuart',
    });
    document.querySelector('.js-stack').innerText = state.cardsStack.length;
}

function throwDice() {
    const duration = 700;
    if (state.onDice !== 'rzuć kostką' || state.gameEnded) return;
    const onDice = Math.floor(Math.random() * Math.floor(5)); // set random number from 0 to 5

    anime({
        targets: '.js-dice',
        scale: [
            {value: '.1', duration: duration / 2},
            {value: '1', duration: duration / 2},
        ],
        rotate: [
            {value: '720', duration: duration},
            {value: '0', duration: 0, delay: duration},
        ],
        easing: 'linear',
    });
    setTimeout(() => {
        if (onDice === 0) {
            const cardsStack = state.cardsStack;
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
            });
            return;
        }
        setState({
            onDice
        });
    }, duration / 2)
}

function onCardClick(e) {
    if (state.mustEndTurn || state.revealedCards.length >= state.onDice || state.onDice === 'rzuć kostką' || e.target.innerText) return;
    const cardValue = e.target.getAttribute('data-card');
    const cardIndex = e.target.getAttribute('data-index');
    anime({
        targets: e.target,
        scaleX: ['-1', '1'],
        duration: 1000,
    });
    setTimeout(() => {
        e.target.innerText = cardValue;
    }, 100);
    if (config.debugMode) e.target.style.color = 'green'; // debug
    e.target.classList.add('js-revealed')
    const revealedCards = state.revealedCards;
    if (cardValue === 'balast') {
        setState({
            onDice: state.onDice + 1,
        })
    }
    if (revealedCards.findIndex(el => el.cardIndex === cardIndex) === -1) revealedCards.push({cardIndex, cardValue});
    const previousCard = revealedCards[revealedCards.length - 2];
    if (previousCard && previousCard.cardValue === 'balast') {
        const cardBeforBalast = revealedCards[revealedCards.length - 3];
        if (cardBeforBalast && parseInt(cardValue) > parseInt(cardBeforBalast.cardValue)) {
            setState({
                revealedCards: [],
                mustEndTurn: true,
            });
            return;
        }
    } else if (previousCard && cardValue !== 'stop') {
        if (parseInt(cardValue) < parseInt(previousCard.cardValue)) {
            setState({
                revealedCards: [],
                mustEndTurn: true,
            });
            return;
        }
    }
    if (revealedCards.length === state.onDice || cardValue === 'stop') {
        setState({
            mustEndTurn: true,
            [state.currentPlayer]: {
                score: state[state.currentPlayer].score + revealedCards.length,
            }
        });
        return
    }
    setState({
        revealedCards,
    })
}

function endRound() {
    if (!state.mustEndTurn) return;
    const revealedCards = state.revealedCards;
    const indexes = revealedCards.reduce((acc, el) => {
        acc.push(parseInt(el.cardIndex));
        return acc;
    }, []);
    const cardsStack = state.cardsStack;
    const cardsOnBoard = state.cardsOnBoard;
    indexes.forEach((index) => {
        const randomIndex = Math.floor(cardsStack.length * Math.random());
        cardsOnBoard[index] = cardsStack[randomIndex];
        cardsStack.splice(randomIndex, 1);
    });
    if (document.querySelector('.js-player-tab.active.succeed')) { // to słabe - przeniesc do state
        animateLinesToTarget('.js-revealed');
        setTimeout(() => {
            appendCardsToDom(cardsOnBoard);
            document.querySelector('.js-stack').innerText = state.cardsStack.length;
        }, 2000)
    } else if (document.querySelector('.js-player-tab.active.fail')) {
        anime({
            targets: '.js-revealed',
            scaleX: ['1', '-1'],
            duration: 1000,
        })
        setTimeout(() => {
            document.querySelectorAll('.js-revealed').forEach(el => el.innerText = '')
        }, 100)
        setTimeout(() => {
            appendCardsToDom(cardsOnBoard);
        }, 2000)
    } else appendCardsToDom(cardsOnBoard);

    if (document.querySelector('.js-player-tab.active.succeed') && state.onDice === 0) {
        animateLinesToTarget('.js-stack');
    }

    const currentPlayerNumber = parseInt(state.currentPlayer.slice(6, state.currentPlayer.length));
    let newCurrentPlayer;
    if (currentPlayerNumber === state.numberOfPlayers - 1) newCurrentPlayer = 'player0';
    else newCurrentPlayer = `player${currentPlayerNumber + 1}`;
    let gameEnded = false;
    if (state.cardsStack.length < state.revealedCards.length) {
        gameEnded = true;
    }

    setTimeout(() => {
        setState({
            cardsOnBoard,
            cardsStack,
            onDice: 'rzuć kostką',
            revealedCards: [],
            mustEndTurn: false,
            currentPlayer: newCurrentPlayer,
            gameEnded,
        })
    }, 1000)
}

window.addEventListener('load', () => {
    document.querySelector('.js-dice').addEventListener('click', throwDice);
    document.querySelector('.js-end-round').addEventListener('click', endRound);
    document.querySelector('.js-add').addEventListener('click', () => setPlayersNumber('add'));
    document.querySelector('.js-substract').addEventListener('click', () => setPlayersNumber());
    document.querySelector('.js-start-play').addEventListener('click', () => onStartGame());
    if (config.logs) setState({}); // for logs
});

if (config.debugMode) window.animateLinesToTarget = animateLinesToTarget(); // for tests only
