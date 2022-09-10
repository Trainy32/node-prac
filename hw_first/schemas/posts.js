const mongoose = require("mongoose");

// 제목 작성자명 작성날짜 비밀번호 작성내용
const postSchema = new mongoose.Schema({
  postId: {
    type: Number,
    required: true,
    unique: true
  },
  title: {
    type: String,
    required: true,
  },
  writer: {
    type: String,
  },
  password: {
    type: String,
    required: true
  },
  content: {
    type: String,
  },
  createdDate: {
    type: String,
  }

})

module.exports = mongoose.model("Posts", postSchema);