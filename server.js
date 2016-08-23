var express = require('express');
var app = express();
var path = require('path');
// may need to change config to config.prod later on
// var config = require('../webpack.config');
// var webpack = require('webpack');
// var webpackDevMiddleware = require('webpack-dev-middleware');
// var webpackHotMiddleware = require('webpack-hot-middleware');

// process.env.PORT sets to hosting service port (Heroku) or 3000
var PORT = process.env.PORT || 3000;
var server = app.listen(PORT);
var io = require('socket.io').listen(server);

app.use(express.static('public'));
// for debugging, REMOVE FOR PRODUCTION including postman endpoints
var data = JSON.stringify([{name: 'steve', message: 'commit message by steve'}, {name: 'sarah', message: 'commit message'}]);
var data2 = JSON.stringify([{name: 'colin', message: 'colin commit message'}, {name: 'binh', message: 'binh commit message'}]);

app.get('/', function(req, res) {
  res.sendFile(path.join(__dirname, './index.html'))
});


// hands this compiler off to the middleware for hot reloading
// var compiler = webpack(config);
// app.use(webpackDevMiddleware(compiler, {
// 	noInfo: true,
// 	// public path simulates publicPath of config file
// 	publicPath: config.output.publicPath
// }));
// app.use(webpackHotMiddleware(compiler));

if (PORT === process.env.PORT) {
  app.use(express.static('./'))
} else {
  app.use(express.static('./dist'));
}

console.log('Polling server is running on http://localhost:' + PORT);


/*************
*** Socket Handling ***
**************/
var connectedClients = 0;
io.sockets.on('connection', function (socket) {
  connectedClients++;
  console.log(`${connectedClients} are Connected on socket server`);
  // room handling
  socket.on('subscribe', function(data) { socket.join(data.room); console.log(`joined room:${data.room}`)})
  socket.on('unsubscribe', function(data) { socket.leave(data.room); console.log(`left room:${data.room}`) })
  // Socket test
  socket.once("echo", function (msg, callback) {
    socket.emit("echo", msg);
  });
  //listening for commit from local client, then broadcasts to all connected clients
	socket.on('broadcastCommit', function(arg){
		console.log('broadcastCommit: ' + arg);
		io.emit('incomingCommit', arg)
	});
  // listening for branch change from local client, then broadcasts to all connected clients
	socket.on('broadcastBranch', function(arg){
		console.log('Branch server event: ' + arg);
		io.emit('incomingCommit', arg)
	});
  socket.on('disconnect', function(){
    connectedClients--;
    console.log(`Disconnection: now ${connectedClients} are Connected on socket server`);
  })
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
