<template>
  <div class="chat-view" :class="{ dark: dark }">
    <div class="chat-header" v-if="players">
<!--      <h1>Players</h1> <font-awesome-icon icon="times-circle" size="2x" />-->
      <h1>Players</h1>
    </div>
    <div class="players-box" v-if="players">
      <div v-for="(player, i) in players" :key="i" class="players">
        <font-awesome-icon v-show="player.id === currentPlayer" class="icon" icon="user" />
        <span class="player" :class="{ current: player.id === currentPlayer }">{{ player.name }}</span>
        <span class="drinks">
          <font-awesome-icon icon="beer" />
          {{ player.drinks }}
        </span>
      </div>
    </div>
    <div class="chat-header">
      <h1>Chat</h1>
    </div>
    <div class="chat-box" v-chat-scroll v-slimscroll="{ height: '100%' }">
      <div v-for="(message, i) in messages" :key="i" class="message">
        <span class="sender">{{ message.sender }}</span> <span class="content">{{ message.content }}</span>
      </div>
    </div>
    <div class="compose-container">
      <input type="text" class="message-input" v-model="messageDraft" placeholder="Type a message..." @keyup.enter="sendMessage()" />
      <button @click="sendMessage()" class="vbtn">Send</button>
    </div>
  </div>
</template>

<script>

export default {
  name: 'ChatView',
  props: ['dark', 'players', 'currentPlayer'],
  data() {
    return {
      messages: [],
      messageDraft: ''
    }
  },
  sockets: {
    newMessage(payload) {
      this.messages.push(payload);
    }
  },
  methods: {
    sendMessage() {
      if(this.messageDraft.length == 0) return;
      this.$network.emit('newMessage', this.messageDraft);
      this.messageDraft = '';
    }
  }
}
</script>

<style lang="scss" scoped>
  .chat-view {
    display: flex;
    flex-direction: column;
    height: 100%;
    max-width: 21vw;

    &.dark {
      background-color: rgba(0, 0, 0, 0.8);
      color: #dfe6e9;

      .chat-header {
        margin: 16px;
      }

      .chat-box {
        border: 0;
      }

      .compose-container {
        padding: 16px;
      }
    }
  }

  .chat-header {
    display: flex;
    flex-direction: row;
    text-align: center;
    margin: 16px 0;

    h1 {
      flex: 1;
    }

    svg {
      cursor: pointer;
    }
  }

  .chat-box {
    flex: 1;
    border: 1px solid #bdc3c7;
    overflow-y: scroll;
    margin-bottom: 10px;
    min-height: 200px;
    padding: 8px;
    border-radius: 8px;

    .message {
      margin-bottom: 8px;

      .sender {
        font-weight: bold;
        margin-right: 8px;
      }
    }
  }

  .compose-container {
    display: flex;
    flex-direction: row;
    padding-top: 8px;

    .message-input {
      font-family: 'Josefin Sins', sans-serif;
      flex: 1;
      padding: 4px;
      margin-right: 8px;
      border: 1px solid #bdc3c7;
      padding: 8px 16px;
    }
  }

  .players-box {
    border: 0px solid #bdc3c7;
    margin-bottom: 10px;
    padding: 8px;
    border-radius: 8px;

    .players {
      margin-bottom: 8px;

      .icon {
        position: absolute;
      }

      .player {
        &.current {
          font-weight: bold;
        }

        margin-right: 8px;
        margin-left: 30px;
      }

      .drinks {
        margin-right: 20px;
        float: right;
      }
    }
  }
</style>
