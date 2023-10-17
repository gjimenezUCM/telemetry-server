/**
 * Módulo de conexión con la base de datos usando Mongoose
 * Los datos de conexión se espera que estén en el archivo de entorno que se pasa
 * durante el despliegue de la aplicación
 */
let {
    MONGODB_USER,
    MONGODB_PASSWORD,
    DB_HOST,
    MONGODB_CONTAINER_PORT,
    MONGODB_DATABASE,
} = process.env;

const mongoose = require("mongoose");

const db = {};
db.mongoose = mongoose;
if(!DB_HOST) {
    DB_HOST = "localhost";
}
db.url = `mongodb://${MONGODB_USER}:${MONGODB_PASSWORD}@${DB_HOST}:${MONGODB_CONTAINER_PORT}/${MONGODB_DATABASE}`;


module.exports = {
    /**
     * Inicialización de la base de datos en MongoDB. Se crea una colección para cada grupo. Esta colección está limitada a 20Mb
     * o a 1000 documentos, de modo que si se sobrepasa este umbral se machacará la información más antigua (como si fuese 
     * una cola circular).
     * Si se produce un fallo durante la inicialización entonces se detiene el proceso completo
     * @param {function} onReady Función que se ejecutará en caso de que se haya producido la conexión con la base de datos
     */
    init: async function(onReady) {
        db.mongoose
        .connect(db.url, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        })
        .then(() => {
            console.log("Connected to the database!");
            this.groups = {};
            // Creamos la colección para cada uno de los grupos
            for (let i=1; i<=8; i++){
                let groupId = "grupo0"+i;
                // Capped collections with 20Mb or 1000 documents
                let maxSize = parseFloat(process.env.MAX_SIZE_MB);
                if (isNaN(maxSize)) {
                    // Default Capped collections with 20Mb
                    maxSize = 20;
                    console.log(`MAX_SIZE_MB not valid. Using default ${maxSize}Mb`); 
                }
                maxSize = maxSize* 1024 * 1024;

                // Default Capped collections with 1000 documents
                let maxDocuments = parseInt(process.env.MAX_DOCUMENTS);
                if (isNaN(maxDocuments)) {
                    maxDocuments = 1000;
                    console.log(`MAX_DOCUMENTS not valid. Using default ${maxDocuments} documents`); 
                }

                const anySc = db.mongoose.Schema({ timestamp: String }, { strict: false, collection: groupId, capped: { size: maxSize, max: maxDocuments } });
                anySc.method("toJSON", function() {
                    const { __v, _id, ...object } = this.toObject();
                    return object;
                });
                this.groups[groupId] = db.mongoose.model(groupId, anySc);
            }
            onReady(db);
        })
        .catch(err => {
            // Se ha producido un error: lo avisamos y cerramos el proceso.
            console.error("Cannot connect to the database!", err);
            process.exit(1);
        });
    },
};
