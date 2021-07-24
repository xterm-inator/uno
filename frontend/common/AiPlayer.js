import DeckBuilder from './DeckBuilder'
import Rules from './Rules'
import { sortBy } from 'lodash'

export default {
  animationConfig: {
    searchDelay: 150,
    selectDelay: 250
  },
  // Make a move procedurally, enabling pretty animations
  makeMove: function(hand, manualColor, topCard, setSelectedCard, drawCard, chooseCard, hasStack) {
    const validIndices = [];
    const preferredIndices = [];

    const selectStep = () => {
      let selectedCardIndex;

      if(preferredIndices.length > 0) {
        selectedCardIndex = this.chooseRandom(preferredIndices);
      }
      else if(validIndices.length > 0) {
        selectedCardIndex = this.chooseRandom(validIndices);
      }

      setSelectedCard(selectedCardIndex);
      setTimeout(() => chooseCard(hand[selectedCardIndex]), this.animationConfig.selectDelay);
    }

    const searchStep = i => () => {
      setSelectedCard(i);

      if(i < hand.length && Rules.isLegal(topCard, manualColor, hand[i], hasStack)) {
        validIndices.push(i);

        if(hand[i].color !== 'special') {
          preferredIndices.push(i);
        }
      }

      let searchDelay = this.animationConfig.searchDelay

      if (hand.length > 7) {
        // Set the animation time based on hand size
        searchDelay -= ((hand.length-7) * 5)
      }

      if(i === hand.length - 1 && validIndices.length === 0) {
        drawCard();
        setTimeout(searchStep(i + 1), searchDelay);
      }
      else if(i === hand.length - 1 && validIndices.length > 0) {
        setTimeout(selectStep, searchDelay);
      }
      else {
        setTimeout(searchStep(i + 1), searchDelay);
      }
    }

    searchStep(0)();
  },
  // Returns a card to play given a player's hand, the manualColor of the field, and the topCard of the field
  makeMoveBasic: function(deck, manualColor, topCard) {
    let validMoves = deck.filter(card => Rules.isLegal(topCard, manualColor, card));
    let preferredMoves = validMoves.filter(card => card.type !== 'special');
    if(preferredMoves.length > 0) {
      return this.chooseRandom(preferredMoves);
    }
    else if(validMoves.length > 0) {
      return this.chooseRandom(validMoves);
    }
    else {
      return false;
    }
  },
  selectColor: function(hand) {
    const colorCounts = {};
    for(let card of hand) {
      if (card.color !== 'special') {
        colorCounts[card.color] = colorCounts[card.color] + 1 || 1;
      }
    }

    let max = 0;
    let maxColor = null;
    for(let key in colorCounts) {
      if(colorCounts[key] > max) {
        max = colorCounts[key];
        maxColor = key;
      }
    }

    if(maxColor == null) {
      maxColor = this.chooseRandom(DeckBuilder.deckConfig.colors);
    }

    return maxColor;
  },

  selectPlayer: function(players) {
    return sortBy(players, player => player.hand.length)[0].id
  },

  chooseRandom: function(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
  }
}
