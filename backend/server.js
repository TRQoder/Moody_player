require("dotenv").config()
const axios = require("axios");
const app = require("./src/app");
const connectToDB = require("./src/db/db");

connectToDB()

app.listen(3000, () => {
  console.log("Server is running on port 3000");

  const url = "https://mini-auth.onrender.com/ping"; // Must be a valid route
  const interval = 300000; // 300 seconds 5 min

  setInterval(() => {
    axios
      .get(url)
      .then(() => console.log("Self-ping sent to keep Render awake"))
      .catch((err) => console.error("Self-ping failed:", err.message));
  }, interval);
});
