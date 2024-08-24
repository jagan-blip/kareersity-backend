const mongoose = require("mongoose");
const config = require("../nodedetails/config");

mongoose.set("strictQuery", false);
console.log(config.dbConnection);
mongoose
  .connect(config.dbConnection)
  .then(() => console.log("DB connection successful"))
  .catch((err) => console.error(err));

mongoose.connection.on("connected", function () {
  console.log("Front Mongoose default connection open");
});

mongoose.connection.on("error", function (err) {
  console.log("Front Mongoose default connection error: " + err);
});

mongoose.connection.on("disconnected", function () {
  console.log("Front Mongoose default connection disconnected");
});

process.on("SIGINT", function () {
  mongoose.connection.close(function () {
    console.log(
      "Front Mongoose default connection disconnected through app termination"
    );
    process.exit(0);
  });
});
