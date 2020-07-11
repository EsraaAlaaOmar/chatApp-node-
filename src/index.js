const path = require('path');
const http = require('http');
const express = require('express');
const soketio = require('socket.io');
const app = express();
const server = http.createServer(app);
const io = soketio(server);
const Filter = require('bad-words');
const { generatmessages, generateLocation } = require('./utlis/messages');
const {
  addUser,
  removeUser,
  getUser,
  getUsersInRoom,
} = require('./utlis/useres');

const port = process.env.PORT || 3000;
const publicDirectoryPath = path.join(__dirname, '../public');

app.use(express.static(publicDirectoryPath));
/*let count = 0;
//server transmitter
io.on('connection', (socket) => {
  console.log('New WebSocket connection');
  socket.emit('countUpdated', count);
  //server reciever
  socket.on('increment', () => {
    count++;
    //socket.emit('countUpdated', count);
    io.emit('countUpdated', count);
  });
});*/
//let message = 'welcome';
//server transmitter
io.on('connection', (socket) => {
  console.log('New WebSocket connection M');

  socket.on('join', (options, callback) => {

    const { user, error } = addUser({ id: socket.id, ...options });
    options.id = socket.id
    console.log(options);
    if (error) {
      console.log(error)
      return callback(error);
    }

    socket.join(options.room);
    socket.emit('message', generatmessages('Admin', 'welcome'));

    //tell when user join
    socket.broadcast
      .to(options.room)
      .emit('message', generatmessages('Admin', `${options.username} has joined`));
    io.to(options.room).emit('roomData', {
      room: options.room,
      users: getUsersInRoom(options.room)
    })
    callback();
    //socit.emit --> send to spesific client
    //io.emit --> send to every connected client
    //socet.brodcast.emit --> send to every conected clients exept this client
    //rooms
    //io.to.emit --> send to every on in the room not the other rooms
    //socet.brodcast.to.emit --> send to every conected clients exept this client in the room
  });
  //server reciever
  socket.on('send mesage', (message, callback) => {
    const filter = new Filter();
    if (filter.isProfane(message)) {
      return callback('profanity is not allowed');
    }
    const user = getUser(socket.id)
    console.log(message);
    io.to(user.room).emit('message', generatmessages(user.username, message));
    callback();
  });
  //tell when a user leave
  socket.on('disconnect', () => {
    const user = removeUser(socket.id);
    if (user) {
      io.emit('message', generatmessages('Admin', ` ${user.username} has left`));
      io.to(user.room).emit('roomData', {
        room: user.room,
        users: getUsersInRoom(user.room)
      })
    }
  });
  //recieve location
  socket.on('location', (info, callback) => {
    console.log(info);
    const user = getUser(socket.id)
    io.to(user.room).emit(
      'locationMessage',
      generateLocation(user.username, `http://google.com/maps?q=${info.lat},${info.long}`)
    );
    callback();
  });
});

server.listen(port, () => {
  console.log(`Server is up on port ${port}`);
});
