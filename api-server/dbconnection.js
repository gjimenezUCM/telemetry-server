let {
    MONGODB_USER,
    MONGODB_PASSWORD,
    DB_HOST,
    MONGODB_DOCKER_PORT,
    MONGODB_DATABASE,
} = process.env;

const mongoose = require("mongoose");

const db = {};
db.mongoose = mongoose;
if(!DB_HOST) DB_HOST = "localhost";
db.url = `mongodb://${MONGODB_USER}:${MONGODB_PASSWORD}@${DB_HOST}:${MONGODB_DOCKER_PORT}/${MONGODB_DATABASE}`;


module.exports = {
    init: async function(onReady) {
        console.log(db.url);
        db.mongoose
        .connect(db.url, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        })
        .then(() => {
            console.log("Connected to the database!");
            this.groups = {};
            for (let i=1; i<=8; i++){
                let groupId = "grupo0"+i;
                // Capped collections with 20Mb or 1000 documents
                const anySc = db.mongoose.Schema({ timestamp: String }, { strict: false, collection: groupId , capped: { size: 20971520, max: 1000} });
                anySc.method("toJSON", function() {
                    const { __v, _id, ...object } = this.toObject();
                    return object;
                });
                this.groups[groupId] = db.mongoose.model(groupId, anySc);
            }
            onReady(db);
        })
        .catch(err => {
            console.log("Cannot connect to the database!", err);
            process.exit();
        });
    },
};
