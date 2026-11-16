require("./config/env.cjs").loadEnvironment(__dirname);
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

http.createServer(app).listen(Number(process.env.PORT || 4430), process.env.HOST || "0.0.0.0", () => { console.log("Web server listening"); });
