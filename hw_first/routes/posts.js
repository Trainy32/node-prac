const express = require("express");
const router = express.Router();
const Posts = require("../schemas/posts");

// Create
router.post("/posts", async (req, res) => {
  const { postId, title, writer, password, content } = req.body;

  const postlist = await Posts.find({ postId });

  if (postlist.length) {
    return res.status(400).json({ success: false, errorMessage: "이미 존재하는 포스트 ID 입니다." });
  } else if (title === "") {
    return res.status(400).json({ success: false, errorMessage: "제목을 입력해주세요" });
  } else if (password === "") {
    return res.status(400).json({ success: false, errorMessage: "비밀번호를 입력해주세요" });
  }

  const createdDate = new Date().toLocaleString()
  const createdPost = await Posts.create({ postId, title, writer, password, content, createdDate });

  res.json({ post: createdPost });
});

// Read (all posts)
router.get("/posts", async (req, res) => {
  const posts = await Posts.find().sort({ createdDate: 'desc' });

  res.json({ posts: posts });
});

// Read (one post detail)
router.get("/posts/:postId", async (req, res) => {
  const { postId } = req.params;
  const detail = await Posts.find({ postId: Number(postId) })

  res.json({ detail: detail });
});

// Update
router.put("/posts/:postId", async (req, res) => {
  const { postId } = req.params;
  const { content, password } = req.body;
  const subjectedPost = await Posts.find({ postId: Number(postId) });

  if ( !subjectedPost.length ) {
    res.status(400).json({ errorMessage: "존재하지 않는 포스트입니다." });
  } else if(password !== subjectedPost[0].password) {
    res.status(400).json({ errorMessage: "비밀번호가 일치하지 않습니다" });
    return;
  } else {
    await Posts.updateOne({ postId: Number(postId) }, { $set: { content } });
  }

  res.json({ success: true });
});


// Delete
router.delete("/posts/:postId", async (req, res) => {
  const { postId } = req.params;
  const { password } = req.body;
  const subjectedPost = await Posts.find({ postId: Number(postId) });

  if ( !subjectedPost.length ) {
    res.status(400).json({ errorMessage: "존재하지 않는 포스트입니다." });
  } else if(password !== subjectedPost[0].password) {
    res.status(400).json({ errorMessage: "비밀번호가 일치하지 않습니다" });
    return;
  } else {
    await Posts.deleteOne({ postId: Number(postId) });
  }

  res.json({ success: true });
});

module.exports = router;
