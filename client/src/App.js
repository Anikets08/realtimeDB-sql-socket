import "./App.css";
import io from "socket.io-client";
import { useEffect, useState } from "react";
import axios from "axios";
const socket = io.connect("http://localhost:3001");

function App() {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    axios.get("http://localhost:3001/users").then((res) => {
      setUsers(res.data);
    });
  }, []);

  useEffect(() => {
    socket.on("connect", () => {
      console.log("connected");
    });
    socket.on("message", (data) => {
      console.log(data);
    });

    socket.on("user_added", (data) => {
      setUsers((prev) => [...prev, data]);
    });
  }, [socket]);
  return (
    <div className="App">
      <div
        className="wrapper"
        style={{
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        {users.map((user, index) => {
          return (
            <div
              key={index}
              style={{
                border: "1px solid black",
                width: "fit-content",
                padding: "10px",
                borderRadius: "10px",
              }}
            >
              <h1>{user.name}</h1>
              <h2>{user.email}</h2>
              <h3>{user.password}</h3>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default App;
