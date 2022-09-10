const express = require('express');
const router = express.Router();
const Comments = require("../schemas/comments");


// Create
router.post("/comments/:postId", async (req, res) => {
  const { commentId, writer, content } = req.body;
  const { postId } = req.params;
  const commentlist = await Comments.find({ commentId });

  if (commentlist.length) {
    return res.status(400).json({ success: false, errorMessage: "잘못된 요청입니다." });
  } else if (content === "") {
    return res.status(400).json({ success: false, errorMessage: "댓글 내용을 입력해주세요" });
  }

  const createdDate = new Date().toLocaleString()
  const createdComment = await Comments.create({ postId, commentId, writer, content, createdDate });

  res.json({ comment: createdComment });
});

// Read (all comments)
router.get("/comments/:postId", async (req, res) => {
  const { postId } = req.params;
  const comments = await Comments.find({ postId: postId }).sort({ createdDate: 'desc' });

  res.json({ comments : comments });
});

// Update
router.put("/comments/:commentId", async (req, res) => {
  const { commentId } = req.params;
  const { content } = req.body;
  const subjectedComment = await Comments.find({ commentId: Number(commentId) });

  if ( !subjectedComment.length ) {
    res.status(400).json({ errorMessage: "잘못된 요청입니다." });
  } else if (!content) {
    return res.status(400).json({ success: false, errorMessage: "댓글 내용을 입력해주세요" });
  } else {
    await Comments.updateOne({ commentId: Number(commentId) }, { $set: { content } });
  }

  res.json({ success: true });
});


// Delete
router.delete("/comments/:commentId", async (req, res) => {
  const { commentId } = req.params;
  const subjectedPost = await Comments.find({ commentId: Number(commentId) });

  if ( !subjectedPost.length ) {
    res.status(400).json({ errorMessage: "잘못된 요청입니다." });
  } else {
    await Comments.deleteOne({ commentId: Number(commentId) });
  }

  res.json({ success: true });
});



module.exports = router;