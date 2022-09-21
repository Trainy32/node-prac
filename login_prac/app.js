// app.js

const express = require("express");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken")
const User = require('./models/user')
const authMiddleware = require("./middlewares/auth-middleware")

mongoose.connect("mongodb://localhost/shopping-demo", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));

const app = express();
const router = express.Router();

// create user -> migrated to mySQL
const { Op } = require("sequelize");
const { User } = require("./models");

router.post("/users", async (req, res) => {
  const { email, nickname, password, confirmPassword } = req.body;

  if (password !== confirmPassword) {
    res.status(400).send({
      errorMessage: "패스워드가 패스워드 확인란과 다릅니다.",
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



// router.post('/users', async (req, res) => {
//   const { nickname, email, password, confirmPassword } = req.body

//   if (password !== confirmPassword) {
//     res.status(400).send({
//       errorMessage: '패스워드가 패스워드 확인란과 동일하지 않습니다.',
//     })
//     return;
//   }

//   const existUsers = await User.find({
//     $or: [{ email }, { nickname }]
//   })

//   if (existUsers.length) {
//     res.status(400).send({
//       errorMessage: '이미 가입된 이메일 또는 닉네임이 있습니다.',
//     })   
//     return;
//   }

//   const user = new User({ email, nickname, password })

//   await user.save()


//   // 201 : created
//   res.status(201).send({})
// })

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

router.get("/users/me", authMiddleware, async (req, res) => {
  res.send({ user: res.locals.user });
});

app.use("/api", express.urlencoded({ extended: false }), router);
app.use(express.static("assets"));

app.listen(8080, () => {
  console.log("서버가 요청을 받을 준비가 됐어요");
});