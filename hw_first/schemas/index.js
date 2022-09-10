const mongoose = require("mongoose");


// db name = hw_first
const connect = () => {
  mongoose
    .connect("mongodb://localhost:27017/hw_first")
    .catch(err => console.log(err));
};

mongoose.connection.on("error", err => {
  console.error("몽고디비 연결 에러", err);
});

module.exports = connect;