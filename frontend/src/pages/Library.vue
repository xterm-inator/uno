<template>
  <div class="game">
    <Card
      v-for="(card, i) in deck"
      :key="i"
      :color="card.color"
      :type="card.type" />
  </div>
</template>

<script>
  import DeckBuilder from 'common/DeckBuilder';
  import Card from '@/components/Card';
  export default {
    name: 'Library',
    components: { Card },
    mounted() {
      const deck = DeckBuilder.createDeck();
      DeckBuilder.shuffleDeck(deck);
      this.deck = deck;
    },
    data () {
      return {
        deck: []
      }
    }
  }
</script>

<style lang="scss" scoped>
  .game {
    display: flex;
    flex-wrap: wrap;
  }
</style>
