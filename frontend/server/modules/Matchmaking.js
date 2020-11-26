import Match from '../models/Match.js';

export default {
  apply: (socket, connection) => {
    socket.on('refreshMatches', () => {
      socket.emit('refreshMatches', Match.getOpenMatches());
    });

    socket.on('refreshLobby', () => {
      socket.emit('refreshLobby', {
        playerName: connection.getName(),
        playerId: connection.getId(),
        matches: Match.getOpenMatches()
      })
    });

    socket.on('addHumanSlot', () => {
      if(!connection.inMatch()) {
        socket.emit('onError', 'You are not in a match.');
        return;
      }

      if(!connection.isMatchAdmin()) {
        socket.emit('onError', 'You are not a match admin.');
        return;
      }

      connection.getMatch().addHumanSlot();
    });

    socket.on('addBotSlot', () => {
      if(!connection.inMatch()) {
        socket.emit('onError', 'You are not in a match.');
        return;
      }

      if(!connection.isMatchAdmin()) {
        socket.emit('onError', 'You are not a match admin.');
        return;
      }

      connection.getMatch().addBotSlot();
    });

    socket.on('joinMatch', matchId => {
      if(!Match.matchExists(matchId)) {
        socket.emit('onError', 'There is no match with id ' + matchId);
        return;
      }

      if(Match.getMatch(matchId).hasPlayer(connection)) {
        connection.emit('joinMatch', Match.getMatch(matchId).toParcel());
        return;
      }

      const error = Match.getMatch(matchId).addHumanPlayer(connection);

      if(error) {
        socket.emit('onError', 'That game is full.');
      }
      else {
        connection.joinMatch(matchId);
      }
    })

    socket.on('createMatch', name => {
      if(connection.inMatch()) {
        socket.emit('onError', 'You cannot create a new game while you are already in a game.');
        return;
      }

      if(Match.matchExists(name)) {
        let newName = name;
        let newCount = 2;
        while(Match.matchExists(newName)) {
          newName = name + ' ' + newCount;
          newCount++;
        }
        name = newName;
      }

      const newMatch = new Match(name);
      newMatch.addHumanSlot();
      newMatch.addHumanPlayer(connection, true);
    });

    socket.on('updateMatchName', name => {
      if(!connection.inMatch()) {
        socket.emit('onError', 'You are not in a match.');
        return;
      }

      if(!connection.isMatchAdmin()) {
        socket.emit('onError', 'You are not a match admin.');
        return;
      }

      if(Match.matchExists(name)) {
        socket.emit('onError', 'There is another match named ' + name + ' already. Try another name.');
      }
      else {
        connection.getMatch().rename(name);
      }
    });

    socket.on('kickPlayer', index => {
      if(!connection.inMatch()) {
        socket.emit('onError', 'You are not in a match.');
        return;
      }

      if(!connection.isMatchAdmin()) {
        socket.emit('onError', 'You are not a match admin.');
        return;
      }

      connection.getMatch().removePlayerAtIndex(index);
    });

    socket.on('leaveMatch', () => {
      if(!connection.inMatch()) {
        socket.emit('onError', 'You are not in a match');
        return;
      }

      connection.getMatch().removePlayer(connection.getId());
    });
  }
}
