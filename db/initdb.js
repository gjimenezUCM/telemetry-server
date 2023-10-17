/**
 * Script que se ejecuta la primera vez que se crea el volumen asociado a la base de datos.
 * Crea el usuario que se encargará de comunicarse con MongoDB y que será responsable de almacenar la información en la base de datos
 * Las credenciales están en el archivo .env usado durante el despliegue
 */
let uajUser = process.env.MONGODB_USER;
let uajPwd = process.env.MONGODB_PASSWORD;
let dbName = process.env.MONGO_INITDB_DATABASE;

db = new Mongo().getDB(dbName);
print("INITDB: Connected to "+db.getName());

// Creación del usuario
db.createUser({
  user: uajUser,
  pwd: uajPwd,
  roles: [
      {
        role: 'readWrite',
        db: db.getName()
      }
  ]
});