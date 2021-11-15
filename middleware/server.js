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

let api = require('./routes/data');
let crane = require('./routes/crane');

var app = express();

let server = require('http').createServer(app);

const io = require('socket.io')(server);


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.use('/api', api);
app.use('/crane', crane);


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




server.listen("3333", () => {console.log("server running 3333")});


module.exports = app;