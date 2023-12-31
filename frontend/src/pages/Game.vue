<template>
  <div class="game-container full-screen" :class="[currentColor]" v-if="uno != null">

    <ChatView :dark="true" :players="uno.players" :current-player="uno.currentPlayer" />

    <div class="game" ref="game">
      <div class="fly-id-container" v-if="drinkMessage" @animationend="handleMessageAnimationEnd">
        <div id="fly-in">
          <div v-if="drinkMessage.reason === 'pickup'"><span>You picked up {{ drinkMessage.drinks }} card{{ drinkMessage.drinks > 1 ? 's': ''}}</span>Drink {{drinkMessage.drinks}}</div>
          <div v-if="drinkMessage.reason === 'deck'"><span>You finished the deck</span>Finish Your Drink</div>
          <div v-if="drinkMessage.reason === '+2' || drinkMessage.reason === '+4'"><span>You had to pick up {{ drinkMessage.drinks }} card{{ drinkMessage.drinks > 1 ? 's': ''}}</span>Drink {{drinkMessage.drinks}}</div>
          <div v-if="drinkMessage.reason === '7' || drinkMessage.reason === '0'"><span>You received {{ drinkMessage.drinks }} card{{ drinkMessage.drinks > 1 ? 's': ''}}</span>Drink {{drinkMessage.drinks}}</div>
        </div>
      </div>

      <SpinBackground :direction="direction" />

      <OpponentDetailLayer :opponents="opponents" :currentPlayer="uno.currentPlayer" :players="uno.players" />

      <OpponentHandLayer :opponents="opponents" :getPlayer="uno.getPlayer" :players="uno.players" />

      <CardStack :stack="uno.stack" />

      <CardDeck :stack="uno.deck" @click.native="draw" />

      <ColorSelectorModal :show="needColor" :selectColor="selectColor" />

      <PlayerSelectorModal :show="needPlayer" :selectPlayer="selectPlayer" :players="opponents" />

      <div class="player-controls">
        <transition-group name="list" tag="div" class="player-hand" ref="playerHand" :class="{ inactive: !playerTurn }" :style="{ marginLeft: shrinkAmountPadding }">
          <Card
            v-for="(card, i) in playerHand"
            :key="'hand' + i"
            @click.native="selectCard(card, i)"
            @mouseover.native="mouseover(i)"
            :color="card.color"
            :type="card.type"
            :animateIn="true"
            :animateDisabled="i !== removeIndex && removing"
            :animateRemoving="i === removeIndex"
            :hoverFocus="true"
            :shrinkAmount="shrinkAmountPx"
            padding="32px" />
        </transition-group>
      </div>
    </div>

    <div class="modal-overlay" v-if="showWinnerModal || showLoserModal">
      <div class="modal winner-modal" v-if="showWinnerModal">
        <img src="/static/koala-celebrating.png" class="illustration" />
        <div class="modal-content">
          <h1>Winner!</h1>
          <p>
            Congratulations, you won! Play again?
          </p>
          <button class="vbtn" @click="quit()">Quit to lobby</button>
        </div>
      </div>
      <div class="modal loser-modal" v-if="showLoserModal">
        <img src="/static/koala-celebrating.png" class="illustration" />
        <div class="modal-content">
          <h1>{{ winnerName }} won!</h1>
          <p>
            Nice job, but {{ winnerName }} won! Play again?
          </p>
          <button class="vbtn" @click="quit()">Quit to lobby</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import AiPlayer from 'common/AiPlayer';
import Store from '@/Store';
import Rules from 'common/Rules';
import Uno from 'common/Uno';

import Card from '@/components/Card';
import CardStack from '@/components/CardStack';
import CardDeck from '@/components/CardDeck';
import ChatView from '@/components/ChatView';
import ColorSelectorModal from '@/components/ColorSelectorModal';
import PlayerSelectorModal from '@/components/PlayerSelectorModal';
import OpponentDetailLayer from '@/components/OpponentDetailLayer';
import OpponentHandLayer from '@/components/OpponentHandLayer';
import SpinBackground from '@/components/SpinBackground';

export default {
  name: 'Game',
  components: { Card, CardDeck, CardStack, ChatView, ColorSelectorModal, OpponentDetailLayer, OpponentHandLayer, SpinBackground, PlayerSelectorModal },
  mounted() {
    this.uno = new Uno(Store.get('players'), this.emit);
    this.playerId = Store.get('playerId');

    if(this.$network.online) {
      this.$network.emit('resyncGame');
    }

    this.$nextTick(() => {
      this.windowWidth = this.$refs.game.clientWidth;
      window.addEventListener('resize', () => {
        this.windowWidth = this.$refs.game.clientWidth;
      });
    });
  },
  beforeDestroy() {
    if(this.$network.online) {
      this.$network.emit('leaveMatch');
    }
  },
  data () {
    return {
      playerId: 'Andrey',
      uno: null,
      localGame: this.$network.offline,
      needColor: false,
      needPlayer: false,
      removeIndex: -1,
      removing: false,
      windowWidth: 1920,
      shrinkAmount: 0,
      showChat: this.$network.online,
      winnerName: '',
      showWinnerModal: false,
      showLoserModal: false,
      drinkMessages: [],
      drinkMessage: null
    }
  },

  watch: {
    currentPlayer(currentPlayer) {
      const player = this.uno.getPlayer(currentPlayer);
      player.selectedCardIndex = -1;

      if(player.human === false && player.remote === false) {
        const setSelectedCard = index => {
          player.selectedCardIndex = index;
        }
        const drawCard = () => {
          this.uno.draw(this.currentPlayer);
        }
        const chooseCard = card => {
          setSelectedCard(-1);
          this.uno.playCard(this.currentPlayer, card);
        }

        AiPlayer.makeMove(player.hand, this.uno.manualColor, this.uno.topStack, setSelectedCard, drawCard, chooseCard);
      }
    },
    playerHand()  {
      this.removeIndex = -1;
      this.computeShrinkAmount();
    },
    windowWidth() {
      this.computeShrinkAmount();
    },
    showChat() {
      this.$nextTick(() => {
        window.dispatchEvent(new Event('resize'));
      });
    }
  },

  computed: {
    currentColor() {
      if(this.uno.topStack == null) return '';
      if(this.uno.topStack.color !== 'special') {
        return this.uno.topStack.color;
      }
      return this.uno.manualColor || 'special';
    },
    playerHand() {
      if(this.uno === null) return [];
      return this.uno.getPlayer(this.playerId).hand;
    },
    currentPlayer() {
      if(this.uno === null) return '';
      return this.uno.currentPlayer;
    },
    playerTurn() {
      return this.currentPlayer === this.playerId;
    },
    direction() {
      return this.uno.boardDirection;
    },
    opponents() {
      if(this.uno === null) return [];

      // Order players so that player is at index 0
      // Otherwise, positions on the board are out-of-order.
      const players = this.uno.getPlayers().slice();
      while(players[0].id !== this.playerId) {
        players.push(players.shift()); // rotate one step
      }

      return players.filter(player => player.id !== this.playerId);
    },
    compressed() {
      return 180 * this.playerHand.length > this.windowWidth;
    },
    shrinkAmountPadding() {
      return this.shrinkAmount * 1.2 + 'px';
    },
    shrinkAmountPx()  {
      return '-' + this.shrinkAmount + 'px';
    }
  },

  methods: {
    emit (event) {
      if (this.localGame) {
        const player = this.uno.getPlayer(this.uno.currentPlayer);
        if (event === 'needColor' && player.human === false && player.remote === false) {
          this.uno.setManualColor(AiPlayer.selectColor(player.hand));
        } else if (event === 'needColor') {
          this.needColor = true;
        } else if (event === 'needPlayer') {
          this.needPlayer = true;
        }
        else if (event === 'win') {
          alert('winner: ' + event.data);
        }
      } else if (event === 'needColor') {
        this.needColor = true;
      } else if (event === 'needPlayer') {
        this.needPlayer = true;
      }
    },
    selectColor (color) {
      this.needColor = false;
      if(this.localGame) {
        this.uno.setManualColor(color);
      } else {
        this.$network.emit('userSelectColor', color);
      }
    },

    selectPlayer (playerId) {
      this.needPlayer = false;
      if (this.localGame) {
        this.uno.setManualPlayer(playerId)
      } else {
        this.$network.emit('userSelectPlayer', playerId)
      }
    },

    draw () {
      if(this.localGame) {
        this.uno.draw(this.playerId);
      }
      else {
        this.$network.emit('draw');
      }
    },
    selectCard(card, i) {
      if(this.localGame && !Rules.isLegal(this.uno.topStack, this.uno.manualColor, card)) {
        alert('That is not a valid move.');
        return;
      }
      if(this.removeIndex === -1) {
        this.removeIndex = i;
        this.removing = true;
        setTimeout(() => {
          this.playCard(card, i);
          setTimeout(() => this.removing = false, 250);
        }, 250);
      }
    },
    playCard(card) {
      if(this.localGame) {
        this.uno.playCard(this.playerId, card);
      }
      else {
        this.$network.emit('playCard', card);
      }
    },
    mouseover(i) {
      if(!this.localGame && this.playerTurn) {
        this.$network.emit('userHighlightCard', i);
      }
    },
    computeShrinkAmount() {
      if(this.compressed) {
        const numCards = this.playerHand.length;
        const handRealWidth = (120 + 32) * (numCards + 1);
        this.shrinkAmount = (handRealWidth - this.windowWidth) / numCards;
      }
      else {
        this.shrinkAmount = 0;
      }
    },
    quit() {
      if(!this.localGame) {
        if(this.$network.online) {
          this.$network.emit('leaveMatch');
        }
        this.$router.push({ path: '/lobby/' });
      }
      else {
        this.$router.push({ path: '/lobby/offline/' });
      }
    },

    handleMessageAnimationEnd () {
      this.drinkMessage = null

      if (this.drinkMessages.length) {
        this.$nextTick(() => {
          this.showNextDrinkMessage()
        })
      }
    },

    showNextDrinkMessage () {
      this.drinkMessage = this.drinkMessages.shift()
    }
  },

  sockets: {
    onError(text) {
      console.log('Error from server: ' + text);
    },
    onWin(playerId) {
      if(playerId === this.playerId) {
        this.showWinnerModal = true;
      }
      else {
        this.showLoserModal = true;
        this.winnerName = this.uno.getPlayer(playerId).name;
      }
    },
    onGameEmit(event) {
      this.emit(event);
    },
    setPlayerHand({ id, hand }) {
      this.uno.remoteSetPlayerHand(id, hand);
    },
    setPlayerHandLength({ id, length }) {
      this.uno.remoteSetPlayerHandLength(id, length);
    },
    setPlayerSelectCardIndex({ id, index }) {
      this.uno.remoteSetPlayerSelectedCardIndex(id, index);
    },
    setCurrentPlayer(id) {
      this.uno.remoteSetCurrentPlayer(id);
    },
    setBoardDirection(direction) {
      this.uno.remoteSetBoardDirection(direction);
    },
    setManualColor(color) {
      this.uno.remoteSetManualColor(color);
    },
    setStack(stack) {
      this.uno.remoteSetStack(stack);
    },
    unoStateUpdate(unoState) {
      this.uno.remoteSetState(unoState);
    },
    drinksReceived(message) {
      this.drinkMessages.push(message)

      if (this.drinkMessage === null) {
        this.showNextDrinkMessage()
      }
    }
  }
}
</script>

<style lang="scss" scoped>
  .game-container {
    display: flex;
    transition: background-color 750ms;

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

    &.special {
      background-color: #b2bec3;
    }
  }

  .game {
    flex: 1;
    position: relative;
  }

  .player-controls {
    position: absolute;
    bottom: 20px;
    left: 0;
    right: 0;

    .player-hand {
      display: flex;
      flex-direction: row;
      justify-content: center;
      transition: all 250ms;

      &.inactive {
        filter: grayscale(50%);
        transform: scale(0.8);
        transform-origin: bottom;
      }
    }

    .player-btns {
      display: flex;
      flex-direction: row;
      justify-content: space-around;

      & > div {
        padding: 8px;
        margin: 8px;
        cursor: pointer;
      }

      .draw {
        background-color: #ff7675;
      }
    }
  }

  .modal-overlay {
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    background-color: rgba(0, 0, 0, 0.7);
    z-index: 999;
    display: flex;
    justify-content: center;
    align-items: center;

    .modal {
      background-color: white;
      border: 1px solid #bdc3c7;
      border-radius: 8px;
      padding: 16px 32px;
      display: flex;
      align-items: center;
      max-width: 800px;

      .illustration {
        width: 200px;
        height: 200px;
        margin-right: 16px;
      }

      p {
        margin: 8px 0;
      }
    }
  }

  .fly-id-container {
    pointer-events: none;
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    background-color: rgba(0, 0, 0, 0.7);
    z-index: 999;
    display: flex;
    justify-content: center;
    align-items: center;

    color: #fff;
    text-align: center;
    width: 100vw;
    height: 100vh;
    font-weight: 700;
    overflow: hidden;
    opacity: 0;
    animation: background 6s linear;

    #fly-in {
      font-size: 4em;
      margin: 40vh auto;
      height: 20vh;
      text-transform: uppercase;
    }

    #fly-in span {
      display: block;
      font-size: .4em;
      opacity: .8;
    }

    #fly-in div {
      position: fixed;
      margin: 2vh 0;
      opacity: 0;
      left: 10vw;
      width: 80vw;
      animation: switch 6s linear;
    }

    @keyframes switch {
      0% { opacity: 0;filter: blur(20px); transform:scale(12)}
      20% { opacity: 1;filter: blur(0); transform:scale(1)}
      60% { opacity: 1;filter: blur(0); transform:scale(.9)}
      90% { opacity: 0;filter: blur(10px); transform:scale(.1)}
      100% { opacity: 0}
    }

    @keyframes background {
      0% {
        opacity: 0;
      }
      20% {
        opacity: 1;
      }
      60% {
        opacity: 0.8;
      }
      90% {
        opacity: 0;
      }
    }
  }
</style>
