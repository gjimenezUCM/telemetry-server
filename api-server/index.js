const express = require('express');
const bodyParser = require('body-parser');
require("dotenv").config({path: "../.env"});

const path = require('path');


//const apiSpec = path.resolve(__dirname, './openapi.yaml');
const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use((err, req, res, next) => {
    // format errors
    res.status(err.status || 500).json({
        message: err.message,
        errors: err.errors,
        status: err.status
    });
});

function initDatabaseConnection(onReady) {
    const db = require("./dbconnection.js");
    db.init(onReady);
}

const PORT = process.env.NODE_DOCKER_PORT || 3000;
app.listen(PORT, ()=> {
    console.log(`Server is running on port ${PORT}.`);
    initDatabaseConnection(() =>  {
        require('./controller.js')(app);
        app.emit("ready");
    });
});