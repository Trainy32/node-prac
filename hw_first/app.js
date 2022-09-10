// express
const express = require('express');
const app = express();
const port = 3000;
app.use(express.json());

// middleware
const postsRouter = require("./routes/posts");
const commentsRouter = require("./routes/comments");
app.use("/api", [ postsRouter, commentsRouter ]);

// mongoose schemas
const connect = require("./schemas");
connect();

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.listen(port, () => {
  console.log(port, '포트로 서버가 열렸어요!');
});