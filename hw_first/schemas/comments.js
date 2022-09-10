const mongoose = require("mongoose");

// 제목 작성자명 작성날짜 비밀번호 작성내용
const commentSchema = new mongoose.Schema({
  commentId: {
    type: Number,
    required: true,
    unique: true
  },  
  postId: {
    type: Number,
    required: true,
  },
  writer: {
    type: String,
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  createdDate: {
    type: String,
  }

})

module.exports = mongoose.model("Comments", commentSchema);