export default {
  validColors: ['red', 'yellow', 'green', 'blue', 'special'],
  validTypes: ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'skip', 'reverse', '+2', 'wild', 'wild+4'],
  deckConfig: {
    colors: ['red', 'yellow', 'green', 'blue'],
    colorCounts: {
      0: 1,
      1: 2,
      2: 2,
      3: 2,
      4: 2,
      5: 2,
      6: 2,
      7: 2,
      8: 2,
      9: 2,
      'skip': 2,
      'reverse': 2,
      '+2': 2
    },
    specialCounts: {
      'wild': 4,
      'wild+4': 4
    }
  },
  handConfig: {
    initialCount: 7
  },
  topConfig: {
    validColors: ['red', 'yellow', 'green', 'blue'],
    validTypes: ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9']
  },

  // Creates a card with a given color and type
  createCard: function(color, type) {
    if(this.validColors.indexOf(color) == -1) {
      throw 'Invalid card color ' + color;
    }

    if(this.validTypes.indexOf(type) == -1) {
      throw 'Invalid card type ' + type;
    }

    return {
      color: color,
      type: type
    }
  },

  // Creates a deck of cards according to the rules in deckConfig
  createDeck: function(numPlayers = 1) {
    const res = [];

    this.deckConfig.colors.forEach(color => {
      Object.keys(this.deckConfig.colorCounts).forEach(type => {
        for(let i = 0; i < this.deckConfig.colorCounts[type]; i++) {
          res.push(this.createCard(color, type));
        }
      });
    });

    Object.keys(this.deckConfig.specialCounts).forEach(type => {
      for(let i = 0; i < this.deckConfig.specialCounts[type]; i++) {
        res.push(this.createCard('special', type));
      }
    });

    if(numPlayers > 10) {
      res.push(...this.createDeck(numPlayers - 10));
    }

    return res;
  },

  // Returns a hand, subtracting cards from a given deck
  createHand: function(deck) {
    const hand = [];
    for(let i = 0; i < this.handConfig.initialCount; i++) {
      const j = Math.floor(Math.random() * deck.length);
      hand.push(deck[j]);
      deck.splice(j, 1);
    }
    return hand;
  },

  // Returns a valid card to go on top of the stack
  getTop: function(deck) {
    const card = deck.filter(card => this.topConfig.validColors.indexOf(card.color) > -1 && this.topConfig.validTypes.indexOf(card.type) > -1)[0];
    return {
      index: deck.indexOf(card),
      card: card
    }
  },

  // Durstenfeld shuffle: https://stackoverflow.com/a/12646864/1110858
  shuffleDeck: function(deck) {
    for (let i = deck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [deck[i], deck[j]] = [deck[j], deck[i]];
    }
  },

  equals(a, b) {
    return a && b && a.color == b.color && a.type == b.type;
  },

  indexOf(hand, card) {
    for(let i = 0; i < hand.length; i++) {
      if(this.equals(hand[i], card)) {
        return i;
      }
    }

    return -1;
  }
}
