var express = require('express');
var app = express();
var path = require('path');
var EventController = require('./database/event-controller.js');
// var UserController = require('./database/user-controller.js');

var PORT = process.env.PORT || 3000;
var server = app.listen(PORT);
var io = require('socket.io').listen(server);

app.use(express.static('public'));

app.get('/', function(req, res) {
  res.sendFile(path.join(__dirname, './index.html'))
});

// if (PORT === process.env.PORT) {
//   app.use(express.static('./'))
// } else {
//   app.use(express.static('./dist'));
// }

console.log('Polling server is running on http://localhost:' + PORT);

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

/***************************
*** Socket Handling + RxJS ***
TODO: handle subscribe/getRepo functionality on client side
****************************/

io.sockets.on('connection', function (socket) {
  // room handling
  socket.on('subscribe', function(data) {socket.join(data.room)});
  socket.on('unsubscribe', function(data) { socket.leave(data.room)});
  // Socket test
  socket.once("echo", function (msg, callback) {
    socket.emit("echo", msg);
  });
  //listening for Git Action from local client, then broadcasts to all connected clients in team
	// TODO: handle callback in post method
	socket.on('broadcastGit', function(arg){
		io.in(arg.room).emit('incomingCommit', arg.data);
	});
});






/*************
*** O Auth ***
**************/
// var options = {
//   client_id: 'INSERT CLIENT ID',
//   client_secret: 'INSERT CLIENT SECRET'
// }
//
// var oauth = require("oauth").OAuth2;
// var OAuth2 = new oauth(options.client_id, options.client_secret, "https://github.com/", "login/oauth/authorize", "login/oauth/access_token");
//
// app.get('/auth/github',function(req,res){
//
//   res.writeHead(303, {
//     Location: OAuth2.getAuthorizeUrl({
//       redirect_uri: 'http://localhost:3000/auth/github/callback',
//       scope: "user,repo,gist"
//     })
//   });
//   res.end();
// });
//
//
// app.get('/auth/github/callback',function (req, res) {
//   var code = req.query.code;
//   OAuth2.getOAuthAccessToken(code, {}, function (err, access_token, refresh_token) {
//     if (err) {
//       console.log(err);
//     }
//     accessToken = access_token;
//     // authenticate github API
//     console.log("AccessToken: "+accessToken+"\n");
//     github.authenticate({
//       type: "oauth",
//       token: accessToken
//     });
//   });
//   res.redirect('/');
// });


module.exports = server;
