<template>
  <div class="color-selector-container full-screen" v-show="show">
    <div class="color-selector">
      <p>Select a player to swap hands with!</p>
      <div class="colors-container">
        <div v-for="player in players" :key="player.id" class="color" @click="selectPlayer(player.id)">{{player.name}}</div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'PlayerSelectorModal',
  props: ['show', 'selectPlayer', 'players'],

  data () {
    return {
      uno: null,
      playerId: null
    }
  }
}
</script>

<style lang="scss" scoped>
.color-selector-container {
  background-color: rgba(0, 0, 0, 0.8);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 999;

  .color-selector {
    background-color: #ffffff;
    padding: 16px;
    width: 432px;

    p {
      padding: 16px 0 32px 0;
      text-align: center;
    }

    .colors-container {
      display: flex;

      .color {
        flex: 1 0 100px;
        text-align: center;
        padding: 32px 8px;
        cursor: pointer;

        &.red {
          background-color: #ff5555;
        }

        &.yellow {
          background-color: #ffaa00;
        }

        &.green {
          background-color: #55aa55;
        }

        &.blue {
          background-color: #5555ff;
        }
      }
    }
  }
}
</style>
