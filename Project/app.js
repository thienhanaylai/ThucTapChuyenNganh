var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
const { engine } = require("express-handlebars");
const session = require("express-session");

var indexRouter = require("./routes/index");
var adminRouter = require("./routes/admin");
const { default: mongoose } = require("mongoose");
const urlDb = "mongodb://127.0.0.1:27017/test";
var app = express();

app.engine(
  "hbs",
  engine({
    extname: ".hbs",
    defaultLayout: "layouts",
    partialsDir: path.join(__dirname, "views", "partials"),
    layoutsDir: path.join(__dirname, "views", "layouts"),
    helpers: {
      times: function (n, block) {
        // nhận vào số n vòng lặp sau đó render ra n số element
        let init = "";
        for (let i = 0; i < n; i++) {
          init += block.fn(this);
        }
        return init;
      },
    },
  })
);

async function connectDB() {
  try {
    await mongoose.connect(urlDb);
    console.log(`Connect to ${urlDb}`);
  } catch (e) {
    console.error(e);
  }
}

connectDB();

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "hbs");

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.use(
  session({
    secret: "1622004",
    resave: false,
    saveUninitialized: true,
    cookie: {
      secure: false,
      httpOnly: true,
      maxAge: 60 * 60 * 1000, //thời gian hết hạn của cookie (60 giây * 60 = 1 tiếng - tính bằng mili giây)
    },
  })
);

app.use((req, res, next) => {
  res.locals.user = req.session.user;
  next();
});

app.use("/", indexRouter);
app.use("/admin", adminRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  res.status(err.status || 500);
  res.render("error", { errStatus: err.status });
});

module.exports = app;
