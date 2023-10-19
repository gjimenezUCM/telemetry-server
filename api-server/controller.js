const crypto = require('crypto');

module.exports = app => {
    let router = require("express").Router();
    router.get("/telemetry/:groupId", getEvents);
    router.post("/telemetry/:groupId", pushEvents);
    app.use("/", router);
};

let {
  SECRET
} = process.env;

/**
 * Valida la clave de autorización que se ha enviado para acceder al endpoint
 * de un grupo identificado por el groupId
 * @param {string} key Clave a validar
 * @param {string} groupId Identificador del grupo
 * @returns True si la clave es válida para el grupo `grouId`. False e.o.c.
 */
function validateKey(key, groupId) {
  let validationKey = groupId+SECRET;
  let hash = crypto.createHash('md5').update(validationKey).digest('hex');
  return hash === key;
}

const db = require("./dbconnection.js");

/**
 * Función para la gestión de las peticiones GET.
 * @param {Request} req Objeto de petición Express
 * @param {Response} res Objeto de respuesta en Express
 * @returns Crea un promise que devuelve lo solicitado o genera un error
 */
function getEvents (req, res) {
  // Se obtiene el identificador del grupo
  const groupId = req.params.groupId;
  // Se obtiene el token de autenticación
  const key = req.headers['x-api-key'];
  // Se valida el token contra el identificador de grupo
  if (!validateKey(key,groupId)) {
    res.status(400).send("Wrong key");
    return;
  }
  new Promise(function(resolve, reject) {
    let result = {};
    let group = db.groups[groupId];
    // Comprobamos que existe el grupo pedido
    if (group){   
      // Lanzamos la consulta a la BBDD y componemos lo que se va a devolver     
      group.find({}).then(function(data){
        let items = [];
        if (data.length>0){
          let i=0;
          data.forEach(element => {
            items[i] = element.toJSON();
            i++;
          });
        }
        let result = {};
        result['application/json'] = items;
        // Devolvemos la lista de eventos si se han recuperado eventos
        if (Object.keys(result).length > 0) {
          resolve(result[Object.keys(result)[0]]);
        } else {
          // Si no, se devuelve la lista vacía
          resolve();
        }
      }, function(error) {
        // Error en el find que accede a la base de datos.
        console.error(error);
        reject("Error accessing the database");
      }); 
    } else {
      // Error: el grupo no existe.
      reject("Wrong group id");
    }
  })
  .then(function (response) {
    res.send(response);
  })
  .catch(function (response) {
    // Error: el grupo no existe.
    res.status(400).send("Wrong group id");
  });
}

/**
 * Función para la gestión de las peticiones POST.
 * @param {Request} req Objeto de petición Express
 * @param {Response} res Objeto de respuesta en Express
 * @returns Crea un promise que devuelve información 
 *          de lo que se ha añadido o genera un error
 */
function pushEvents (req, res) {
  // Se obtiene el identificador del grupo
  const groupId = req.params.groupId;
  const events = req.body;
  // Se obtiene el token de autenticación
  const key = req.headers['x-api-key'];
  // Se valida el token contra el identificador de grupo
  if (!validateKey(key,groupId)) {
    // El token no es válido => Error 400
    res.status(400).send("Wrong key");
    return;
  }
  // Solo guardamos en la base de datos si nos han enviado
  // los eventos en una lista
  if ( events && Array.isArray(events) ) {
    new Promise(function(resolve, reject) {
      let result = {};
      let GroupEvent = db.groups[groupId];
      // Almacenamos cada uno de los eventos en la BBDD
      if (GroupEvent){   
        let i=0;
        for (let e of events ){
          let grEvent = new GroupEvent(e);
          grEvent.save();
          i++;
        }
        resolve(i);     
        
      } else {
        // Error: el grupo no existe.
        reject("Wrong group id");
      }
    })
    .then(function (response) {
      // Todo fue bien. Devolvemos el número de eventos que hemos metido en la BBDD
      res.send("Added ("+response+")");
    })
    .catch(function (response) {
      // Error: el grupo no existe.
      res.status(400).send("Wrong group id");
    }); 
  } else {
    // Error: O no nos han enviado eventos o no están en una lista
    let msg = "Wrong format: events must be in a list.";
    if (Array.isArray(events)) {
      msg = "Empty body";
    }
    res.status(400).send(msg);
  }

}

