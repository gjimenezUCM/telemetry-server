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

function validateKey(key, groupId) {
  let validationKey = groupId+SECRET;
  let hash = crypto.createHash('md5').update(validationKey).digest('hex');
  return hash === key;
}

const db = require("./dbconnection.js");
function getEvents (req, res) {
  const groupId = req.params.groupId;
  const key = req.headers['x-api-key'];
  if (!validateKey(key,groupId)) {
    res.status(400).send("invalid key");
    return;
  }
  new Promise(function(resolve, reject) {
    let result = {};
    let group = db.groups[groupId];
    if (group){        
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
        if (Object.keys(result).length > 0) {
          resolve(result[Object.keys(result)[0]]);
        } else {
          resolve();
        }
      }, function(error) {
        console.log(error);
        reject("Error en el find");
      }); 
    } else {
      reject("invalid group id");
    }
  })
  .then(function (response) {
    res.send(response);
  })
  .catch(function (response) {
    res.status(400).send("invalid group id");
  });
}

function pushEvents (req, res) {
  const groupId = req.params.groupId;
  const events = req.body;
  const key = req.headers['x-api-key'];
  if (!validateKey(key,groupId)) {
    res.status(400).send("invalid key");
    return;
  }
  if ( events && Array.isArray(events) ) {
    new Promise(function(resolve, reject) {
      let result = {};
      let GroupEvent = db.groups[groupId];
      if (GroupEvent){   
        let i=0;
        for (let e of events ){
          let grEvent = new GroupEvent(e);
          grEvent.save();
          i++;
        }
        resolve(i);     
        
      } else {
        reject("invalid group id");
      }
    })
    .then(function (response) {
      res.send("Added ("+response+")");
    })
    .catch(function (response) {
      res.status(400).send("invalid group id");
    }); 
  } else {
    let msg = "Not an array";
    if (Array.isArray(events)) {
      msg = "Empty body";
    }
    res.status(400).send(msg);
  }

}

