var express = require('express'),
    Pusher = require('pusher'),
    http = require('http'),
    fs = require('fs'),
    path = require('path');

var config = JSON.parse(fs.readFileSync('config.json', 'utf8'));

var app = express();

app.set('port', process.env.PORT || 9000);
app.set('views', __dirname + '/views');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(express.cookieParser());
app.use(express.cookieSession({
  secret: process.env['COOKIE_SESSION_SECRET'] || config.COOKIE_SESSION_SECRET
}));
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.errorHandler());

var pusher = new Pusher({
  appId: process.env['PUSHER_APP_ID'] || config.PUSHER_APP_ID,
  key: process.env['PUSHER_KEY'] || config.PUSHER_KEY,
  secret: process.env['PUSHER_SECRET'] || config.PUSHER_SECRET
});

var nextId = 0;

app.post('/register', function (req, res) {
  req.session.userid = nextId++;
  req.session.username = req.body.username;
  res.send(200);
});

app.post('/pusher/auth', function (req, res) {
  var socketId = req.body.socket_id;
  var channel = req.body.channel_name;
  var auth = pusher.auth(socketId, channel, {
    user_id: req.session.userid,
    user_info: { username: req.session.username }
  });
  res.send(auth);
});

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
