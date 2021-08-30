import React from 'react'
import './index.css';

const cardWidth = 70;
const cardHeight = 94;

const values = ['2', '3', '4', '5', '6', '7', '8', '9', 'T', 'J', 'K', 'Q', 'A']
const suits = ['H', 'C', 'D', 'S'];

function Card(props) {
    var xOffset = 0;
    var yOffset = 0;

    if ('value' in props && props.value.length === 2) {
        xOffset = values.indexOf(props.value[0], 0) + 1;
        yOffset = suits.indexOf(props.value[1], 0);
    }
    
    return (
        <div
         className='Card'
         style={{backgroundImage: 'url(https://img.itch.zone/aW1hZ2UvNzE1Mzg3LzM5NjQ5MzEucG5n/original/iwG3hK.png)',
                 width: cardWidth + 'px',
                 height: cardHeight + 'px',
                 overflow: 'hidden',
                 backgroundPosition: -xOffset * cardWidth + 'px ' + -yOffset * cardHeight + 'px'
               }}
        />
    );
}

function dealHand(arr, player) {
    var out = [];
    for (var i = 0; i < arr.length; i++) {
        out.push(<Card key={(player ? 'Player' : 'Dealer') + i} value={arr[i]} />);
    }
    return (out);
}

function Hit(props) {
    return (
        <div onClick={props.onClick}>
         <b>Hit</b><br />
         <Card />
        </div>
    );
}

function Stand(props) {
    return (
        <div onClick={props.onClick}>
         <b>Stand</b><br />
         <Card />
        </div>
    );
}

class Table extends React.Component {
    constructor(props) {
        super(props);
        
        var deck = [...Array(52).keys()]
        deck = this.shuffleDeck(deck);
        this.state = {
            deck: deck,
            dealerHand: [],
            playerHand: [],
            isStanding: false,
            dealerStanding: false,
        };

        this.state.playerHand.push(this.getCard(this.state.deck.pop()));
        this.state.playerHand.push(this.getCard(this.state.deck.pop()));
        
        this.state.dealerHand.push(this.getCard(this.state.deck.pop()) + 'H');
        this.state.dealerHand.push(this.getCard(this.state.deck.pop()));

        var temp = this.state.dealerHand;
        var dealerScore = this.calculateScore(temp, true);
        if (dealerScore === 21 || this.calculateScore(this.state.playerHand, true) === 21) {
            temp[0] = temp[0].slice(0,-1);
            this.state.dealerHand = temp;
            this.state.isStanding = true;
            this.state.dealerStanding = dealerScore === 21;
        }
    }

    shuffleDeck(arr) {
        var shuffled = [];

        while (arr.length > 0) {
            var index = Math.floor(Math.random() * arr.length);
            var next = arr.splice(index, 1);
            shuffled.push(next[0]);
        }
        return shuffled;
    }

    calculateScore(arr, addHidden) {
        var score = 0;
        var aces = 0;
        for (var i = 0; i < arr.length; i++) {
            // Don't include hidden value
            if (!addHidden && arr[i].length > 2) {
                continue;
            }
            var val = arr[i][0];
            if (!isNaN(val)) {
                score += parseInt(val);
            } 
            else if (val !== 'A') {
                score += 10;
            }
            else {
                aces += 1
            }

        }

        while (aces > 0) {
            // Add 11 if it's the last ace and it still fits
            if (aces === 1 && (score + 11) <= 21) {
                score += 11;
            }
            else {
                score += 1;
            }
            aces--;
        }

        return score;
    }

    getScoreString(arr) {
        var out = '';
        var score = this.calculateScore(arr, false);

        if (score === 21) {
            out = 'Blackjack!';
        }
        else if (score > 21) {
            out = 'Bust!'
        }
        else {
            if (arr[0].length > 2) {
                out += '>';
            }
            out += score.toString();
        }
        return out;
    }

    getCard(cardVal) {
        var suit = Math.floor(cardVal / 13);
        var value = cardVal % 13;
        var out = values[value] + suits[suit]
        return out;
    }

    handleHit() {
        var hand = this.state.playerHand;
        if (this.state.isStanding ||
            this.calculateScore(this.state.dealerHand, true) === 21 ||
            this.calculateScore(hand, true) >= 21) {
            return;
        }

        var deck = this.state.deck;
        hand.push(this.getCard(deck.pop()));

        var dealer = this.state.dealerHand;
        var blackjack = this.calculateScore(hand, true) === 21;
        var bust = this.calculateScore(hand, true) > 21;
        if (this.calculateScore(hand, true) >= 21) {
            dealer[0] = dealer[0].slice(0, 2);
        }
        this.setState({
            deck: deck,
            playerHand: hand,
            dealerHand: dealer,
            isStanding: blackjack || bust,
            dealerStanding: bust,
        });
    }

    handleStand() {
        if (this.state.isStanding ||
            this.calculateScore(this.state.playerHand, false) >= 21) {
            return;
        }
        var temp = this.state.dealerHand;
        temp[0] = temp[0].slice(0, 2);
        this.setState({                        
            deck: this.state.deck,                        
            dealerHand: temp, 
            playerHand: this.state.playerHand, 
            isStanding: true, 
            dealerStanding: this.state.dealerStanding,
        });                                    
    }

    getStateText() {
        var out = '';

        var playerScore = this.calculateScore(this.state.playerHand, true);
        var dealerScore = this.calculateScore(this.state.dealerHand, true);

        if (!this.state.isStanding || !this.state.dealerStanding) {
            return out;
        }
        if (playerScore > dealerScore) {
            out = 'You Win!';
        }
        else {
            out = 'Dealer Wins!';
        }

        if (playerScore === 21 && dealerScore === 21) {
            out = 'Draw!';
        }

        if (playerScore > 21) {
            out = 'Dealer Wins!';
        }
        else if (dealerScore > 21) {
            out = 'You Win!';
        }

        return out;
    }

    sleep = (milliseconds) => {
        return new Promise(resolve => setTimeout(resolve, milliseconds))
    }

    hitDealer() {
        var hand = this.state.dealerHand;
        var deck = this.state.deck;
        if (this.calculateScore(hand, true) < 17 &&
            this.calculateScore(hand, true) < this.calculateScore(this.state.playerHand, true)) {
            hand.push(this.getCard(deck.pop()));
        }
        var stand = this.calculateScore(hand, true) >= 17 ||
                    this.calculateScore(hand, true) >= this.calculateScore(this.state.playerHand, true);
        this.sleep(1000).then(r => {
            this.setState({
                deck: deck,
                playerHand: this.state.playerHand,
                dealerHand: hand,
                isStanding: this.state.isStanding,
                dealerStanding: stand,
            });
        });
    }

    componentDidMount() {
        if (this.state.isStanding && !this.state.dealerStanding) {
            this.hitDealer();
        }
    }

    componentDidUpdate() {
        if (this.state.isStanding && !this.state.dealerStanding) {
            this.hitDealer();
        }
    }

    render() {
        return (
            <div>
             <div className='Hand'>
              <b>You: {this.getScoreString(this.state.playerHand)}</b><br />
              <div>
               {dealHand(this.state.playerHand, true)}
              </div>
             </div>
             <div className='Dealer'>
              <div>
               {dealHand(this.state.dealerHand, false)}
              </div>
              <b>Dealer: {this.getScoreString(this.state.dealerHand)}</b><br />
             </div>
             <div className='Hit'>
              <Hit onClick={() => this.handleHit()} />
             </div>
             <div className='Stand'>
              <Stand  onClick={() => this.handleStand()} />
             </div>
             <div className='EndText'>
              <b>{this.getStateText()}</b>
             </div>
            </div>
        );
    }
}

class Game extends React.Component {
    render() {
        return (
            <div className='Window'>
             <div className='Table'>
              <Table /> 
             </div>
             <div className='Reset'>
              <button onClick={() => window.location.reload(false)}>New Game</button>
             </div>
            </div>
        );
    }
}
export default Game;
