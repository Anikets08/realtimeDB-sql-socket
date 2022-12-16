const express = require("express");
const app = express();
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const sqlite3 = require("sqlite3").verbose();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket) => {
  console.log(`User Connected: ${socket.id}`);
  socket.send("Welcome to the server");
  socket.on("join_room", (data) => {
    socket.join(data);
  });

  socket.on("send_message", (data) => {
    socket.to(data.room).emit("receive_message", data);
  });
});

const db = new sqlite3.Database("./mock.db", sqlite3.OPEN_READWRITE, (err) => {
  if (err) {
    console.error(err.message);
  } else {
    db.run(
      `CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name text,
        email text UNIQUE,
        password text
        )`,
      (err) => {
        if (err) {
          console.error(err.message);
        }
      }
    );
  }
});

let insert = "INSERT INTO users (name, email, password) VALUES (?,?,?)";
let del = "DELETE FROM USERS WHERE email = ?";
let select = "SELECT * FROM users WHERE email = ?";

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.post("/addUser", (req, res) => {
  const { name, email, password } = req.body;
  db.run(insert, [name, email, password], (err) => {
    if (err) {
      res.send(err.message);
    } else {
      io.emit("user_added", { name, email, password });
      res.send("User added successfully");
    }
  });
});

app.post("/deleteUser", (req, res) => {
  const { email } = req.body;
  db.run(del, [email], (err) => {
    if (err) {
      res.send(err.message);
    } else {
      res.send("User deleted successfully");
    }
  });
});

app.post("/user", (req, res) => {
  console.log(req.body);
  const { email } = req.body;
  db.get(select, [email], (err, row) => {
    if (err) {
      res.send(err.message);
    } else {
      res.send(row);
    }
  });
});

app.get("/users", (req, res) => {
  db.all("SELECT * FROM users", (err, rows) => {
    if (err) {
      res.send(err.message);
    } else {
      res.send(rows);
    }
  });
});

server.listen(3001, () => {
  console.log("SERVER IS RUNNING");
});
