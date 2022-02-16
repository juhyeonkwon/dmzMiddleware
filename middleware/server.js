/*
*  server.js 
*  middleware(DMZ)서버에서 내부 DB서버로 접근이 바로 가능할 때 이 모듈을 사용하면 됩니다
*
*  date : 2021.11.10
*  author : juHyeonKwon (dxdata)
*
*/

const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const cors = require('cors')
const fs = require('fs');


let api = require('./routes/data');
let crane = require('./routes/crane');
let welding = require('./routes/welding');
let auth = require('./routes/user');
let elecar = require('./routes/elecar');
let board = require('./routes/board');

const { request } = require('express');
const {swaggerUi, specs } = require('./modules/swagger');
var app = express();


app.use('/swagger', swaggerUi.serve, swaggerUi.setup(specs));

const server = require('http').createServer(app);

const io = require('socket.io')(server, {
  allowEIO3: true,
  cors:{
    origin:"*",   //나중에 서비스 할 때 origin을 변경해줘야 합니다 (cors문제)
    methods: ["GET","POST"],
    credentials: true,
    allowEIO3: true
    },
    transport: ['websocket']
});

//cors 설정
app.use(cors({ origin : '*' }));
app.set("io", io);

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

//log setting
let accessLogStream = fs.createWriteStream(path.join(__dirname, 'access.log'), { flags: 'a' })

app.use(express.static(path.join(__dirname, 'public')));
app.use(logger('dev'));
app.use(logger('combined', { stream: accessLogStream }));

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.use('/api', api);
app.use('/crane', crane);
app.use('/welding', welding)
app.use('/auth', auth);
app.use('/elecar', elecar);
app.use('/board', board);
// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  res.status(err.status || 500);
  res.render('error');
});

app.use(express.static(__dirname + '/public'));


//소켓 관련 함수
io.on('connection', (socket) => {
  console.log('user connected');

  socket.on('index', (data) => {
    console.log(data);
    io.emit('index', {a : 1, b : 2});
  })

  socket.on('disconnect', () => {
    console.log('user discconnected');
  });

  
})


server.listen("3333", () => {console.log("server running 3333")});


module.exports = app;
