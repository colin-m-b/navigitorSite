var express = require('express');
var app = express();
var path = require('path');

var PORT = process.env.PORT || 3000;
var server = app.listen(PORT);
var io = require('socket.io').listen(server);

app.use(express.static('public'));

app.get('/', function(req, res) {
  res.sendFile(path.join(__dirname, './index.html'))
});

if (PORT === process.env.PORT) {
  app.use(express.static('./'))
} else {
  app.use(express.static('./dist'));
}

console.log('Polling server is running on http://localhost:' + PORT);


/***************************
*** Socket Handling + RxJS ***
TODO: handle subscribe/getRepo functionality on client side
****************************/
io.sockets.on('connection', function(socket){
	// Room Handling
	const socketJoinRoomObservable = Rx.Observable.create(function(observer){
		socket.on('subscribe', function(data) {
			try {
				EventController.getRepo(data, function(x) {
					socket.emit('completeDBLog', x)
				})
				socket.join(data.room)
				observer.next(data.room);
			} catch (err) {
				observer.error(err);
			}
		}
		);
	})

	const socketJoinRoomObserver = socketJoinRoomObservable
		.subscribe(x => console.log('joined team: ' + x), e => 'connection error: ' + e, () => console.log('team connected complete'))

	const socketLeaveRoomObservable = Rx.Observable.create(function(observer){
		socket.on('unsubscribe', function(data) {
			try{
				socket.leave(data.room);
				observer.next(data.room);
			} catch (err) {
				observer.error(err);
			}
		});
	});

	const socketLeaveRoomObserver = socketLeaveRoomObservable
		.subscribe(x => console.log('left room: ' + x), e => console.log('error on leave: ' + e),() => console.log('left room completed'))

	// Broadcasting Git Actions from local clients to connected team members
	const socketGitBroadcastingObservable = Rx.Observable.create(function(observer){
		socket.on('broadcastGit', function(arg){
			try {
				console.log('from server bcast git ' + arg.data)
				EventController.saveEvent(arg);
				io.in(arg.room).emit('incomingCommit', arg.data);
			} catch (err) {
				observer.error(err);
			}
		});
	});

	const socketGitBroadcastingObserver = socketGitBroadcastingObservable
		.subscribe(x => console.log('broadcasted'), e => console.log(e), () => console.log('git broadcasted and saved | complete'))
		//Chat room
	  socket.on('sendMessage', function (data) {
	    socket.broadcast.to(data.room).emit('sendMessage', {
	      text: data.text
	    });

	    console.log(data.text);
	  });
});

/***********************
 *** User Sign in/up ***
 ***********************/

app.post('/signup', (req, res) => {
  UserController.add(req, () => {
    console.log('hi')
  })
  //console.log('signed up')
})

app.post('/verify', (req, res) => {
  UserController.verify(req, function(data) {
    console.log('data from server: ', data)
    res.send(data)
  })
  //console.log(req)
})

/*****************
 *** Analytics ***
 *****************/

app.get('/days', (req, res) => {
  EventController.getByTime(req, function() {
    res.send(data)
  })

})

module.exports = server
