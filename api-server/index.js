const express = require('express');
const bodyParser = require('body-parser');
require("dotenv").config({path: "../.env"});
const path = require('path');


/**
 * Punto de entrada del servidor de Express
 */
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

/**
 * Inicialización de la conexión con la base de datos.
 * @param {function} onReady Función que se llamará si la conexión con la base de datos ha sido exitosa
 */
function initDatabaseConnection(onReady) {
    const db = require("./dbconnection.js");
    db.init(onReady);
}


/**
 * Inicialización de Express
 */
const PORT = process.env.API_CONTAINER_PORT || 3000;
app.on("ready", () => { console.log(`Server is running on port ${PORT}.`); });
app.listen(PORT, ()=> {
    initDatabaseConnection(() =>  {
        require('./controller.js')(app);
        app.emit("ready");        
    });
});

