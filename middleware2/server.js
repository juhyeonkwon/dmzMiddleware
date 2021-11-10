/*
*  server.js 
*  middleware(DMZ)서버에서 내부 DB서버로 접근이 불가능할때의 middleware application
*  구성 -> 미들웨어에서 redis 혹은 mongo 를 이용하여 캐싱, 내부서버에서 해당 파일을 가져옴. 또는 전역변수화 해서 함수 실행 후 가져가게 하는것도 있다.
*  date : 2021.11.10
*  author : juHyeonKwon (dxdata)
*
*/

var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

let api = require('./routes/data');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.use('/api', api);

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


app.listen("3333", () => {console.log("server running 3333")});


module.exports = app;
