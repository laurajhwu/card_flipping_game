const GAME_STATE = {
    FirstCardAwaits: 'FirstCardAwaits',
    SecondCardAwaits: 'SecondCardAwaits',
    CardMatchFailed: 'CardMatchFailed',
    CardsMatched: 'CardsMatched',
    GameFinished: 'GameFinished'
}

const symbols = [
    'https://image.flaticon.com/icons/svg/105/105223.svg', //spade
    'https://image.flaticon.com/icons/svg/105/105219.svg', //clover
    'https://image.flaticon.com/icons/svg/105/105212.svg', //diamond
    'https://image.flaticon.com/icons/svg/105/105220.svg' // heart
]



const view = {
    // getCardElement: function() {...}
    getCardElement(index) {
        //initial display of start of game
        return `<section data-index="${index}" class="card back"></section>`
    },

    getCardContent(index) {
        const number = this.transformNumber((index % 13) + 1);
        const symbol = symbols[Math.floor(index / 13)];
        return `
            <p>${number}</p>
            <img src="${symbol}" alt="">
            <p>${number}</p>
        `
    },

    transformNumber(number) {
        switch (number) {
            case 1:
                return 'A';
            case 11:
                return 'J';
            case 12:
                return 'Q';
            case 13:
                return 'K';
            default: //when no match is found
                return number;
        }
    },

    displayCards(indices) {
        const rootElement = document.querySelector('.cards');
        rootElement.innerHTML = indices.map(index => this.getCardElement(index)).join('');
        //.join() --> combines array items into a string, the input represents what will be in between the items
    },

    //... --> combines multiple arguments into an array (used when unsure how many args will used)
    flipCards(...cards) {
        cards.map(card => {
            if (card.matches('.back')) {
                card.classList.remove('back')
                card.innerHTML = this.getCardContent(Number(card.dataset.index));
            } else {
                card.classList.add('back');
                card.innerHTML = null;
            }
        })
    },

    pairedCards(...cards) {
        cards.map(card => card.classList.add('paired'))
    },

    renderScore(score) {
        document.querySelector('#score').innerText = score
    },

    renderTries(tries) {
        document.querySelector('#tries').innerText = tries
    },

    appendWrongAnimation(...cards) {
        cards.map(card => {
            card.classList.add('wrong')
            card.addEventListener('animationend', event => {
                card.classList.remove('wrong')
            },
                {
                    once: true //the event listener will be taken off after execution
                })
        })
    },

    showGameFinished() {
        const div = document.createElement('div')
        div.classList.add('completed')
        div.innerHTML = `
            <p>Complete!</p>
            <p>Score: ${model.score}</p>
            <p>You've tried: ${model.tries} times</p>
        `
        const header = document.querySelector('header')
        header.before(div)
    }
}

const model = {
    revealedCards: [],

    isRevealedCardsMatched() {
        return this.revealedCards[0].dataset.index % 13 ===
            this.revealedCards[1].dataset.index % 13
    },

    clearRevealedCards() {
        this.revealedCards = []
    },

    score: 0,
    tries: 0
}

const controller = {
    currentState: GAME_STATE.FirstCardAwaits,

    generateCards() {
        view.displayCards(utility.getRandomNumberArray(52))
    },

    dispatchCardAction(card) {
        if (!card.matches('.back')) {
            return
        }

        switch (this.currentState) {
            case GAME_STATE.FirstCardAwaits:
                view.flipCards(card)
                model.revealedCards.push(card)
                this.currentState = GAME_STATE.SecondCardAwaits
                break

            case GAME_STATE.SecondCardAwaits:
                view.renderTries(++model.tries)
                view.flipCards(card)
                model.revealedCards.push(card)
                //if success 
                if (model.isRevealedCardsMatched()) {
                    this.currentState = GAME_STATE.CardsMatched
                    view.renderScore(model.score += 10)
                    view.pairedCards(...model.revealedCards)
                    model.clearRevealedCards();
                    if (model.score === 260) {
                        this.currentState = GAME_STATE.GameFinished
                        view.showGameFinished()
                    } else {
                        this.currentState = GAME_STATE.FirstCardAwaits
                    }

                } else { //if failed
                    this.currentState = GAME_STATE.CardMatchFailed
                    view.appendWrongAnimation(...model.revealedCards)
                    setTimeout(this.resetCards, 1000);
                }
                break
        }
    },

    resetCards() {
        view.flipCards(...model.revealedCards)
        model.clearRevealedCards();
        controller.currentState = GAME_STATE.FirstCardAwaits
    },

}

const utility = {
    getRandomNumberArray(count) {
        const number = Array.from(Array(count).keys())
        // Array(52) --> creates an empty array with the length of 52
        //Array.prototype.keys() --> creates a new Array Iterator object that returns the index key (ie, the index number)
        //Array.from() --> creates a new array from the given input (splits input)
        for (let index = number.length - 1; index > 0; index--) {
            const randomIndex = Math.floor(Math.random() * (index + 1));
            [number[index], number[randomIndex]] = [number[randomIndex], number[index]]
        }
        return number
    }
}

controller.generateCards();
document.querySelectorAll('.card').forEach(card => {
    card.addEventListener('click', event => {
        controller.dispatchCardAction(card)
    })
})