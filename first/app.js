const express = require('express');
const app = express();
const port = 3000;
const goodsRouter = require('./routes/goods.js')
// const cartsRouter = require("./routes/carts");

const connect = require("./schemas");
connect();

app.use(express.json());

// app.use('/api', [goodsRouter, cartsRouter] )
app.use('/api', [goodsRouter] )

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.listen(port, () => {
  console.log(port, '포트로 서버가 열렸어요!');
});

