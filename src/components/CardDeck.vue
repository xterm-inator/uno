<template>
  <div class="stack">
    <card-back
      v-for="(card, i) in topCards"
      :key="'field-' + i"
      :selectable="true"
      :style="{ zIndex: i, left: i * 2 + 'px', transform: 'translate(0, -50%)' }"
    />
    <card-back
        v-if="topCards.length === 0"
        :key="'field-1'"
        :selectable="true"
        :style="{ zIndex: 1, left: 0 + 'px', transform: 'translate(0, -50%)' }"
    />
  </div>
</template>

<script>
import PersistentRotation from '@/lib/PersistentRotation';

import CardBack from '@/components/CardBack';

export default {
  name: 'CardDeck',
  components: {
    CardBack
  },
  props: [
    'stack'
  ],

  computed: {
    topCards () {
      return this.stack.filter((card, index) => index < 10)
    }
  },

  methods: {
    getStackRotation: PersistentRotation.getRotation.bind(PersistentRotation),
  }
}
</script>

<style lang="scss" scoped>
.stack {
  position: absolute;
  left: 55%;
  top: 50%;
  transform: translate(-50%, -50%);
  z-index: 12;

  & /deep/ .card-back {
    position: absolute;
    top: 0;
    left: 0;
  }
}
</style>
