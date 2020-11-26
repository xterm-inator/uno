export default {
  // Determines if a move is legal
  //   topCard: top card of the current stack
  //   card: proposed next move
  isLegal: function(topCard, manualColor, card, hasStack) {
    // rules for picked up cards
    if (card.pickedUp && card.color === 'special') {
      return false
    }

    // stacking rules
    if (hasStack) {
      return card.type === topCard.type
    }

    if(topCard.color == 'special') {
      return card.color == 'special' || card.color == manualColor;
    }
    else {
      return card.color == 'special' || topCard.type == card.type || topCard.color == card.color;
    }
  },

  hasValidMove (topCard, manualColor, hand) {
    return hand.filter(card => this.isLegal(topCard, manualColor, card)).length > 0
  }
}
