import DeckBuilder from './DeckBuilder';
import Players from './Players';
import Rules from './Rules';
import UnoState from './UnoState';
import { clone } from 'lodash';

export default class {
  constructor(playerConfig, emit) {
    const deck = DeckBuilder.createDeck(playerConfig.length);
    DeckBuilder.shuffleDeck(deck);

    const top = DeckBuilder.getTop(deck);
    deck.splice(top.index, 1);

    this.deck = deck;
    this.secondaryDeck = [];
    this.stack = [top.card];
    this.players = Players.createPlayers(playerConfig, deck);
    this.boardDirection = +1;
    this.manualColor = null;
    this.currentPlayer = this.players[0].id;
    this.currentPickupCount = 0;
    this.nextQueued = false;
    this.currentStack = 0;

    this.emit = emit;
  }

  get topStack() {
    return this.stack[0];
  }

  getPlayers() {
    return this.players;
  }

  get playerList() {
    return this.players.map(player => player.id);
  }

  get nextPlayer() {
    let nextIndex = this.playerList.indexOf(this.currentPlayer) + this.boardDirection;
    if(nextIndex >= this.playerList.length) nextIndex = 0;
    else if(nextIndex < 0)  nextIndex = this.playerList.length - 1;
    return this.playerList[nextIndex];
  }

  getPlayer(playerId) {
    return this.players.filter(player => player.id == playerId)[0] || {};
  }

  playCard(playerId, card) {
    if(Rules.isLegal(this.topStack, this.manualColor, card, this.currentStack > 0)) {
      this.stack.unshift(card);
      this.secondaryDeck.push(card);

      let spliceIndex = DeckBuilder.indexOf(this.getPlayer(playerId).hand, card);
      this.getPlayer(playerId).hand.splice(spliceIndex, 1);
      this.getPlayer(playerId).selectedCardIndex = -1;

      if (this.currentPickupCount > 0) {
        this.emit('drink', { player: this.getPlayer(playerId), reason: 'pickup', drinks: this.currentPickupCount })
        this.currentPickupCount = 0
      }

      if(this.playSideEffects(playerId, card) === true) return;

      this.nextTurn();
    }
  }

  playSideEffects(playerId, card) {
    if(card.type === 'skip') {
      this.nextTurn(true);
    }
    if(card.type === 'reverse') {
      this.boardDirection *= -1;
      if(this.players.length === 2) {
        this.nextTurn(true);
      }
    }
    if(card.type === '+2') {
      // check if the next player has the same card before giving it to them to allow stacking
      if (this.getPlayer(this.nextPlayer).hand.filter(playerCard => playerCard.type === card.type).length === 0) {
        this.draw(this.nextPlayer, (this.currentStack + 1) * 2)
        this.emit('drink', { player: this.getPlayer(this.nextPlayer), reason: '+2', drinks: (this.currentStack + 1) * 2})
        this.currentStack = 0
        this.nextTurn(true, true);
      } else {
        this.currentStack++
      }
    }
    if(card.type === 'wild' || card.type === 'wild+4') {
      this.manualColor = null;

      if(card.type === 'wild+4') {
        // check if the next player has the same card before giving it to them to allow stacking
        if (this.getPlayer(this.nextPlayer).hand.filter(playerCard => playerCard.type === card.type).length === 0) {
          this.draw(this.nextPlayer, (this.currentStack + 1)  * 4)
          this.emit('drink', { player: this.getPlayer(this.nextPlayer), reason: '+4', drinks: (this.currentStack + 1) * 4})
          this.currentStack = 0
          this.nextTurn(true, true);
        } else {
          this.currentStack++
        }
      }

      this.emit('needColor');

      return true;
    }

    if (card.type === '7') {
      if (this.checkWin()) {
        return true;
      }
      this.emit('needPlayer')
      return true
    }
    if (card.type === '0') {
      if (this.checkWin()) {
        return true;
      }
      this.rotateCards()
    }
  }

  setManualColor (color) {
    this.manualColor = color;
    this.nextTurn();
  }

  setManualPlayer (playerId) {
    const currentHand = clone(this.getPlayer(this.currentPlayer).hand)
    this.getPlayer(this.currentPlayer).hand = clone(this.getPlayer(playerId).hand)
    this.getPlayer(playerId).hand = currentHand

    this.emit('drink', { player: this.getPlayer(playerId), reason: '7', drinks: this.getPlayer(playerId).hand.length })
    this.emit('drink', { player: this.getPlayer(this.currentPlayer), reason: '7', drinks: this.getPlayer(this.currentPlayer).hand.length })

    this.nextTurn();
  }

  rotateCards () {
    let hands = []

    this.players.forEach((player) => {
      player.hand.forEach(card => card.pickedUp = false)

      hands.push(clone(player.hand))
    })

    if (this.boardDirection > 0) {
      this.players.forEach((player, index) => {
        let useIndex = index - 1

        if (useIndex < 0) {
          useIndex = this.players.length - 1
        }
        this.players[index].hand = clone(hands[useIndex])

        this.emit('drink', { player, reason: '0', drinks: this.players[index].hand.length })
      })
    } else {
      this.players.forEach((player, index) => {
        let useIndex = index + 1

        if (useIndex === this.players.length) {
          useIndex = 0
        }
        this.players[index].hand = clone(hands[useIndex])

        this.emit('drink', { player, reason: '0', drinks: this.players[index].hand.length })
      })
    }
  }

  draw (playerId, n = 1) {
    if(this.deck.length < n) {
      for(let i = 0; i < this.secondaryDeck.length; i++) {
        this.deck.unshift(clone(this.secondaryDeck[i]));
      }

      this.secondaryDeck = []

      this.stack.splice(1, this.stack.length - 1)

      DeckBuilder.shuffleDeck(this.deck);

      this.emit('drink', { player: this.getPlayer(this.currentPlayer), reason: 'deck', drinks: 'finish' })
    }

    for(let i = 0; i < n; i++) {
      const drawIndex = Math.floor(Math.random() * this.deck.length);
      let card = this.deck[drawIndex]
      card.pickedUp = true
      this.getPlayer(playerId).hand.push(card);
      this.deck.splice(drawIndex, 1);
    }

    if (n === 1) {
      this.currentPickupCount++
    }

    this.emit('draw')
  }

  checkWin () {
    if(this.getPlayer(this.currentPlayer).hand.length === 0) {
      this.emit('win', this.currentPlayer);
      this.currentPlayer = null;
      return true
    }
  }

  nextTurn (isEffect = false, delayUntilNextCall = false) {
    if(this.nextQueued) {
      this.nextQueued = false;
      this.nextTurn(true);
    }

    if(delayUntilNextCall) {
      this.nextQueued = true;
      return;
    }

    if(this.getPlayer(this.currentPlayer).hand.length === 0) {
      this.emit('win', this.currentPlayer);
      this.currentPlayer = null;
      return;
    }

    this.getPlayer(this.currentPlayer).hand.forEach(card => card.pickedUp = false)

    this.currentPlayer = this.nextPlayer;

    if(!isEffect) {
      this.emit('nextTurn');
    }
  }

  remoteSetState (unoState) {
    UnoState.apply(this, unoState);
  }

  remoteSetPlayerHand (id, hand) {
    this.getPlayer(id).hand = hand;
  }

  remoteSetPlayerHandLength (id, length) {
    this.getPlayer(id).hand = UnoState.generateHandWithLength(length);
  }

  remoteSetPlayerSelectedCardIndex (id, index)  {
    this.getPlayer(id).selectedCardIndex = index;
  }

  remoteSetCurrentPlayer (id) {
    this.currentId = id;
  }

  remoteSetBoardDirection (direction) {
    this.boardDirection = direction;
  }

  remoteSetManualColor (color) {
    this.manualColor = color;
  }

  remoteSetStack (stack) {
    this.stack = stack;
  }
}
