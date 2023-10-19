const crypto = require('crypto');
require("dotenv").config({ path: "../.env" });

/**
 * Script para la creación de las claves que se usarán para cada uno de los grupos y que sirven para validar
 * el acceso a la API de telemetría.
 * Para componer usa el mismo SECRET del .env usado durante el despliegue.
 */
let SECRET = process.env.SECRET;
for (i=1; i<=8; i++) {
    let groupId = "grupo0"+i;
    let validationKey = groupId+SECRET;
    console.log(groupId, crypto.createHash('md5').update(validationKey).digest('hex'));
}