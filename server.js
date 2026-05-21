const https = require("https");
const fs = require("fs");
const express = require("express");
const path = require("path");
const http = require("http");

const app = express();

app.use(express.static(path.join(__dirname, "build")));

app.use((req, res) => {
  res.sendFile(path.join(__dirname, "build", "index.html"));
});

http.createServer(app).listen(4430, () => {console.log("Run on 4430")})
