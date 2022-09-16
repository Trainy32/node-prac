const express = require("express");
const bodyParser = require("body-parser");

const Todo = require('./models/todo')

const app = express();
const router = express.Router();


router.get("/", (req, res) => {
  res.send("Hi!");
});

app.use("/api", bodyParser.json(), router);
app.use(express.static("./assets"));

app.listen(8080, () => {
  console.log("서버가 켜졌어요!");
});

// mongoDB
const mongoose = require("mongoose");

mongoose.connect("mongodb://localhost/todo-demo", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));


router.post("/todos", async (req, res) => {
  const { value } = req.body;
  const maxOrderByUserId = await Todo.findOne().sort("-order").exec();

  const order = maxOrderByUserId ? maxOrderByUserId.order + 1 : 1;
  const todo = new Todo({ value, order });
  await todo.save();
  res.send({ todo });
});

router.get("/todos", async (req, res) => {
  const todos = await Todo.find().sort("-order").exec();

  res.send({ todos });
});

router.patch("/todos/:todoId", async (req, res) => {
  const { todoId } = req.params;
  const { order } = req.body;

  const currentTodo = await Todo.findById(todoId);
  if (!currentTodo) {
    throw new Error("존재하지 않는 todo 데이터입니다.");
  }

  if (order) {
    const targetTodo = await Todo.findOne({ order }).exec();
    if (targetTodo) {
      targetTodo.order = currentTodo.order;
      await targetTodo.save();
    }
    currentTodo.order = order;
  }

  await currentTodo.save();

  res.send({});
});

router.delete("/todos/:todoId", async (req, res) => {
  const { todoId } = req.params;

  const todo = await Todo.findById(todoId).exec();
  await todo.delete();

  res.send({});
});


router.put("/todos/:todoId", async (req, res) => {
  const { todoId } = req.params;
  const { order, value, done } = req.body;

  const todo = await Todo.findById(todoId).exec();

  if (order) {
    const targetTodo = await Todo.findOne({ order }).exec();
    if (targetTodo) {
      targetTodo.order = todo.order;
      await targetTodo.save();
    }
    todo.order = order;
  } else if (value) {
    todo.value = value;
  } else if (done !== undefined) {
    todo.doneAt = done ? new Date() : null;
  }

  await todo.save();

  res.send({});
});


// app.js

const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const SECRET_KEY = `HangHae99`;

app.use(cookieParser());

let tokenObject = {}; // Refresh Token을 저장할 Object

app.get("/set-token/:id", (req, res) => {
  const id = req.params.id;
  const accessToken = createAccessToken(id);
  const refreshToken = createRefreshToken();

  tokenObject[refreshToken] = id; // Refresh Token을 가지고 해당 유저의 정보를 서버에 저장합니다.
  res.cookie('accessToken', accessToken); // Access Token을 Cookie에 전달한다.
  res.cookie('refreshToken', refreshToken); // Refresh Token을 Cookie에 전달한다.

  return res.status(200).send({ "message": "Token이 정상적으로 발급되었습니다." });
})

// Access Token을 생성합니다.
function createAccessToken(id) {
  const accessToken = jwt.sign(
    { id: id }, // JWT 데이터
    SECRET_KEY, // 비밀키
    { expiresIn: '10s' }) // Access Token이 10초 뒤에 만료되도록 설정합니다.

  return accessToken;
}

// Refresh Token을 생성합니다.
function createRefreshToken() {
  const refreshToken = jwt.sign(
    {}, // JWT 데이터
    SECRET_KEY, // 비밀키
    { expiresIn: '7d' }) // Refresh Token이 7일 뒤에 만료되도록 설정합니다.

  return refreshToken;
}

app.get("/get-token", (req, res) => {
  const accessToken = req.cookies.accessToken;
  const refreshToken = req.cookies.refreshToken;

  if (!refreshToken) return res.status(400).json({ "message": "Refresh Token이 존재하지 않습니다." });
  if (!accessToken) return res.status(400).json({ "message": "Access Token이 존재하지 않습니다." });

  const isAccessTokenValidate = validateAccessToken(accessToken);
  const isRefreshTokenValidate = validateRefreshToken(refreshToken);

  if (!isRefreshTokenValidate) return res.status(419).json({ "message": "Refresh Token이 만료되었습니다." });


  if (!isAccessTokenValidate) {
    const accessTokenId = tokenObject[refreshToken];
    if (!accessTokenId) return res.status(419).json({ "message": "Refresh Token의 정보가 서버에 존재하지 않습니다." });

    const newAccessToken = createAccessToken(accessTokenId);
    res.cookie('accessToken', newAccessToken);
    return res.json({ "message": "Access Token을 새롭게 발급하였습니다." });
  }

  const { id } = getAccessTokenPayload(accessToken);
	return res.json({ "message": `${id}의 Payload를 가진 Token이 성공적으로 인증되었습니다.` });
})


// Access Token을 검증합니다.
function validateAccessToken(accessToken) {
  try {
    jwt.verify(accessToken, SECRET_KEY); // JWT를 검증합니다.
    return true;
  } catch (error) {
    return false;
  }
}

// Refresh Token을 검증합니다.
function validateRefreshToken(refreshToken) {
  try {
    jwt.verify(refreshToken, SECRET_KEY); // JWT를 검증합니다.
    return true;
  } catch (error) {
    return false;
  }
}

// Access Token의 Payload를 가져옵니다.
function getAccessTokenPayload(accessToken) {
  try {
    const payload = jwt.verify(accessToken, SECRET_KEY); // JWT에서 Payload를 가져옵니다.
    return payload;
  } catch (error) {
    return null;
  }
}