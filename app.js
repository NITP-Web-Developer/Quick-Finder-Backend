var httpError = require("http-errors");
var express = require("express");
var app = express();
var cookieParser = require("cookie-parser");
var logger = require("morgan");
var bodyParser = require("body-parser");
var cors = require("cors");
require("dotenv").config();

var LoginBackend = require("./LoginBackend/signup");
var BackSell = require("./backend/backsell");
var MyServer = require("./mybackend/myserver.js");
var Payment = require("./backend/order");
app.use(logger("dev"));
app.use(express.json());
app.use(cookieParser());
app.use(cors());
app.use("", LoginBackend);
app.use("/backend", BackSell);
app.use("", MyServer);
app.use("/payment", Payment);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(httpError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500).json({ message: "Server Error" });
});
module.exports = app;
