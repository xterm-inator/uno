import Connection from '../models/Connection';

export default {
  apply: (socket, connection) => {
    socket.on('setPlayerName', newName => {
      if(Connection.usernameTaken(newName))  {
        socket.emit('onError', 'Username ' + newName + ' is already taken!');
        return;
      }
  
      connection.setName(newName);
  
      if(connection.inMatch()) {
        connection.getMatch().emitUpdate();
      }
    });

    socket.on('newMessage', content => {
      if(!connection.inMatch()) {
        socket.emit('onError', 'You are not in a match');
        return;
      }
  
      connection.getMatch().sendMessage(connection.getName(), 'text', content);
    });
  }
}