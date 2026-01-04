require("dotenv").config();
const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("One Hit Wonder backend running");
});

const PORT = process.env.PORT || 4242;
app.listen(PORT, () => console.log(`Server running on ${PORT}`));
