var express = require("express"),
  path = require("path"), // ADDED: Required for path.resolve
  async = require("async"),
  { Pool } = require("pg"),
  cookieParser = require("cookie-parser"),
  app = express(),
  server = require("http").Server(app),
  io = require("socket.io")(server);

var port = 80; // UPDATED: Standard port for containerized web apps

io.on("connection", function (socket) {
  socket.emit("message", { text: "Welcome!" });

  socket.on("subscribe", function (data) {
    socket.join(data.channel);
  });
});

const pool = new Pool({
  user: "postgres",
  host: "db",
  database: "postgres",
  password: "password",
  port: 5432,
});

async.retry(
  { times: 1000, interval: 1000 },
  function (callback) {
    pool.connect(function (err, client, done) {
      if (err) {
        console.error("Waiting for db...");
      }
      callback(err, client);
    });
  },
  function (err, client) {
    if (err) {
      return console.error("Giving up");
    }
    console.log("Connected to db");
    getVotes(client);
  },
);

function getVotes(client) {
  client.query(
    "SELECT vote, COUNT(id) AS count FROM votes GROUP BY vote",
    [],
    function (err, result) {
      if (err) {
        // Log instead of error to avoid crashing while waiting for Worker to create table
        console.log("Waiting for Worker to create 'votes' table...");
      } else {
        var votes = collectVotesFromResult(result);
        io.sockets.emit("scores", JSON.stringify(votes));
      }

      setTimeout(function () {
        getVotes(client);
      }, 1000);
    },
  );
}

function collectVotesFromResult(result) {
  var votes = { a: 0, b: 0 };

  result.rows.forEach(function (row) {
    votes[row.vote] = parseInt(row.count);
  });

  return votes;
}

app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(__dirname + "/views"));

app.get("/", function (req, res) {
  res.sendFile(path.resolve(__dirname + "/views/index.html"));
});

server.listen(port, function () {
  console.log("App running on port " + port);
});
