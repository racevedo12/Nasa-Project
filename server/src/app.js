// Importing Packages
const express = require("express");
const app = express();
const cors = require("cors");
const path = require("path");
const morgan = require("morgan");

// Importing Routers
const api = require("./routes/api");

// Middlewares
app.use( cors
({
    origin: "http://localhost:3000",
}) );

// Logging Requests With Morgan
app.use( morgan("combined") );

app.use( express.json() );

// Setting static file for prod mode with node
app.use( express.static( path.join(__dirname, "../public") ) );

// Using Routers
app.use("/v1", api);

app.get("/*", (req, res) =>
{
    res.sendFile( path.join(__dirname, "../public/index.html") );
});

module.exports = app;