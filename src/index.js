const http = require('http');

const express = require('express');

const socketio = require('socket.io');

const app = express();

const server = http.createServer(app);

const Filter = require('bad-words');

const {generateMsg, generateLocationMessage} = require('./utils/messages.js')

const {addUser, removeUser, getUser, getUsersInRoom}= require('./utils/users.js')

// create new instance of socket.io to configure web sockets to work 
// with our server 

const io = socketio(server);

const path = require('path');

const port = process.env.PORT || 3000;

const publicDirectoryPath = path.join(__dirname, '../public');

app.use(express.static(publicDirectoryPath));

io.on('connection', (socket) => {
    console.log('New Web socket connection');
    
    /*
    // to send something i.e. event from server to client use .emit
    // .emit('name of the event')
    
    socket.emit('countUpdated', count);
    socket.on('increment', () => {
        count = count + 1;
        //socket.emit('countUpdated', count); //this emits to a specific connection
        io.emit('countUpdated', count); // this emits to each n every single connection

    })
    
    

    socket.emit('welcome', generateMsg('Welcome!!'));

    // when v broadcast an event v send it to everybody
    // except the current client

    socket.broadcast.emit('welcome', generateMsg('A new user has joined'));
    */
    socket.on('join', (obj, callback) => {
        const username = obj.username;
        const room = obj.room;

        // use socket.io features given to us 
        // to join individual room
        // use a method which v can only use on server
        // i.e. socket.join() will give access to whole new way to emit events
        // only ppl in that rooms can see those msgs

        // -------- 2 new ways to emit msgs-------
        // io.to.emit }-> it emits everybody to a specific room
        // socket.broadcast.to.emit }-> it emits everybody except a specific client to a specific room

        const {error, user} = addUser({
            id: socket.id,
            username, room
        
        })

        if(error){
            return callback(error);
        }


        socket.join(user.room);

        socket.emit('welcome', generateMsg('Admin','Welcome!!'));

        socket.broadcast.to(user.room).emit('welcome', generateMsg('Admin',`${user.username} has joined`));
        
        io.to(user.room).emit('roomData', {
            room: user.room,
            users: getUsersInRoom(user.room)
        })

        callback();
    })

    socket.on('sendMessage', (value, callback) => {
        // check if there is some bad words i.e. gaali in message
        // .isProfane will return true if gaali present 
        const userData = getUser(socket.id);
        
        const filter = new Filter()
        if(filter.isProfane(value)){
            return callback('Profanity is not allowed')
        }
        

        if(userData){
            io.to(userData.room).emit('welcome', generateMsg(userData.username,value));
            callback(); // call callback to acknowledge user 
        }

    })

    // if a given socket gets disconnected
    socket.on('disconnect', () => {
        const user = removeUser(socket.id);
        
        if(user){
            io.to(user.room).emit('welcome', generateMsg('Admin', `${user.username} has left`));
            io.to(user.room).emit('roomData', {
                room: user.room,
                users: getUsersInRoom(user.room)
            })


        }

    })

    socket.on('sendLocation', (locObj, callback) => {
        const userData = getUser(socket.id);
        if(userData){
        io.to(userData.room).emit('locationMessage', generateLocationMessage(userData.username, `https://google.com/maps?q=${locObj.lat},${locObj.long}`));
        callback('Location shared!!');}
    })

})

server.listen(port, () => {
    console.log('Server is up on port', port);
})
