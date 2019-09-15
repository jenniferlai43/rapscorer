const express = require('express');
const bodyParser = require('body-parser');

const revai = require('revai-node-sdk');

const app = express();
var http = require('http').createServer(app);
var io = require('socket.io')(http);

const port = 8000;

app.set('view engine', 'ejs');

app.use(express.static('./static'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false}));

app.get('/', (req, res) => {
  res.render('index');
});

io.on('connection', (socket) => {

  	socket.on('enter room', (userData) => { 
  		var name = userData.name;
  		var room = userData.room;
    	console.log(name + ' joining room ' + room);
    	socket.nickname = name;
    	socket.join(room);
    	//var playerCount = io.sockets.clients(room).length;
    	var players = io.sockets.adapter.rooms[room];
    	console.log(players);
	  	io.to(room).emit('display game', players.length);
	})

  	socket.on('disconnect', () => {
    	console.log('user disconnected');
  	});

  	socket.on('line drop', ({room, line}) => {
  		console.log('received line drop');
  		socket.to(room).emit('print line', line);
  	});

  	socket.on('turn finished', (room) => {
    	socket.to(room).emit('start turn');
  	});
});

http.listen(port, function(){
  console.log("Listening on port " + port);
});