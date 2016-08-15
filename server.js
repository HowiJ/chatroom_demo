var express = require('express'),
    path    = require('path'),

    app     = express();

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, './views'));

app.use(express.static(path.join(__dirname, './static')));

app.get('/', function(req, res) {
    res.render('index');
})

var server = app.listen(8000, function() {
    console.log('Hey listen: chatroom 8000');
})

var io       = require('socket.io').listen(server);
var user     = {},
    messages = [{name: 'test', message: 'test message'}];

io.sockets.on('connection', function(socket) {
    console.log(socket.id, 'connected');

    socket.on('join', function(name) {
        if (name && name.length > 0) {
            user[socket.id] = name;

            var message = {name: '____', message: user[socket.id]+' has joined'};
            messages.push(message);

            io.emit('user', user);
            io.emit('message_receive', messages);
        } else {
            socket.emit('nameFail');
        }
    })
    socket.on('message_send', function(message) {
        var eachMessage = {name: user[socket.id], message: message};
        messages.push(eachMessage);

        io.emit('message_receive', messages);
    })

    socket.on('disconnect', function() {
        console.log(socket.id, 'disconnected');

        var message = {name: '____', message: user[socket.id]+' has left the room'};
        messages.push(message);
        delete user[socket.id];
        io.emit('user', user);
        io.emit('message_receive', messages);
    })
})
