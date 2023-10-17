let uajUser = process.env.MONGODB_USER;
let uajPwd = process.env.MONGODB_PASSWORD;
let dbName = process.env.MONGO_INITDB_DATABASE;
db = new Mongo().getDB(dbName);
print("INITDB: Connected to "+db.getName());

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

for (let i = 1; i <= 9; i++) {
  let collectionName = "grupo0"+i;
  // Capped collections with 20Mb or 1000 documents
  db.createCollection(collectionName, { capped: true, size: 20971520, max: 1000 }).then(function(collection) {
    console.log('Collection'+ collectionName+' was created!');
  });
}
