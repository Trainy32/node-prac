// app.js
const express = require("express");
const bodyParser = require("body-parser")
const jwt = require("jsonwebtoken")
const authMiddleware = require("./middlewares/auth-middleware")

const app = express();
const router = express.Router();
app.use(bodyParser.json())

const { Op } = require("sequelize");
const { User, BlogPosting, Comments } = require("./models");

router.post("/users", async (req, res) => {
  const { email, nickname, password, confirmPassword } = req.body;

  console.log( email, nickname, password, confirmPassword)

  if (password !== confirmPassword) {
    res.status(400).send({
      errorMessage: "패스워드가 패스워드 확인란과 다릅니다.",
    });
    return;
  }

  if (nickname.length < 3) {
    res.status(400).send({
      errorMessage: "닉네임이 너무 짧습니다.",
    });
    return;
  }

  if (password.length < 4) {
    res.status(400).send({
      errorMessage: "비밀번호가 너무 짧습니다.",
    });
    return;
  } else if (password.includes(nickname)) {
    res.status(400).send({
      errorMessage: "비밀번호는 닉네임을 포함할수 없습니다.",
    });
    return;
  }

  // email or nickname이 동일한게 이미 있는지 확인하기 위해 가져온다.
  const existsUsers = await User.findAll({
    where: {
      [Op.or]: [{ email }, { nickname }],
    },
  });
  if (existsUsers.length) {
    res.status(400).send({
      errorMessage: "이메일 또는 닉네임이 이미 사용중입니다.",
    });
    return;
  }

  await User.create({ email, nickname, password });
  res.status(201).send({});
});


router.post("/auth", async (req, res) => {
  const { email, password } = req.body;

  // const user = await User.findOne({ email }).exec();
  
  // Getting user info -> migrated to mySQL
  const user = await User.findOne({
    where: {
      email,
    },
  });

  // NOTE: 인증 메세지는 자세히 설명하지 않는것을 원칙으로 한다: https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html#authentication-responses
  if (!user || password !== user.password) {
    res.status(400).send({
      errorMessage: "이메일 또는 패스워드가 틀렸습니다.",
    });
    return;
  }

  const token = jwt.sign({ userId: user.userId }, "customized-secret-key")

  res.send({
    token,
  });
});

router.post("/blog-posting", authMiddleware, async (req, res) => {
  const { userId } = res.locals.user;
  const { contents } = req.body;

  if (!contents) {
    res.status(400).send({
      errorMessage: "내용을 입력해주세요",
    });
    return;
  }

  await BlogPosting.create({ userId, contents });
  res.status(201).send({});
});

router.get("/blog-posting/:postId", async (req, res) => {
  const { postId } = req.params;

  const post = await BlogPosting.findOne({
    where: {
      postId
    }
  })

  if(!post) {
    res.status(400).send({
      errorMessage: "잘못된 요청입니다",
    });
    return;
  }

  res.send({ post });
});

router.post("/blog-posting/:postId/comments", authMiddleware, async (req, res) => {
  const { userId } = res.locals.user;
  const { postId } = req.params;
  const { contents } = req.body;

  if (!contents) {
    res.status(400).send({
      errorMessage: "댓글 내용을 입력해주세요",
    });
    return;
  }

  await Comments.create({ userId, postId, contents });
  res.status(201).send({});
});

router.get("/blog-posting/:postId/comments", async (req, res) => {
  const { postId } = req.params;

  const commentList = await Comments.findAll({
    where: {
      postId
    }
  })

  res.send({ commentList });
});

router.delete("/blog-posting/:postId/comments/:commentId", authMiddleware, async (req, res) => {
  const { postId, commentId } = req.params;
  const { userId } = res.locals.user;

  const item = await Comments.findOne({
    where: {
      postId, commentId
    }
  })

  if(!item) {
    res.status(400).send({
      errorMessage: "존재하지 않는 댓글입니다",
    });
  } else if (userId !== item.userId) {
    res.status(400).send({
      errorMessage: "작성자만 삭제할 수 있어요",
    });
  } else {
    await item.destroy()
    res.send({ });
  }
});

router.put("/blog-posting/:postId/comments/:commentId", authMiddleware, async (req, res) => {
  const { postId, commentId } = req.params;
  const { userId } = res.locals.user;
  const { contents } = req.body;

  const item = await Comments.findOne({
    where: {
      postId, commentId
    }
  })

  if(!item) {
    res.status(400).send({
      errorMessage: "존재하지 않는 댓글입니다",
    });
  } else if (userId !== item.userId) {
    res.status(400).send({
      errorMessage: "작성자만 삭제할 수 있어요",
    });
  } else if (!contents) {
    res.status(400).send({
      errorMessage: "수정할 내용을 작성해주세요",
    });
  } else {
    item.contents = contents
    await item.save()
    res.send({ });
  }
});


router.get("/users/me", authMiddleware, async (req, res) => {
  res.send({ user: res.locals.user });
});

app.use("/api", express.urlencoded({ extended: false }), router);
app.use(express.static("assets"));

app.listen(8080, () => {
  console.log("서버가 요청을 받을 준비가 됐어요");
});