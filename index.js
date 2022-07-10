const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const redis = require('redis');
const cors = require('cors');

const {
  MONGO_USER,
  MONGO_PASSWORD,
  MONGO_IP,
  MONGO_PORT,
  REDIS_URL,
  REDIS_PORT,
  SESSION_SECRET
} = require('./config');

let RedisStore = require('connect-redis')(session);

let redisClient = redis.createClient({
  url: `redis://${REDIS_URL}:${REDIS_PORT}`,
  legacyMode: true
});
redisClient.connect();

const userRouter = require('./routes/user');
const postRouter = require('./routes/post');

const app = express();

const connectWithRetry = () => {
  mongoose
    .connect(`mongodb://${MONGO_USER}:${MONGO_PASSWORD}@${MONGO_IP}:${MONGO_PORT}/?authSource=admin`)
    .then(() => console.log('Connected to DB'))
    .catch((e) => {
      console.log(e)
      setTimeout(connectWithRetry, 5000);
    });
}
connectWithRetry();

/* If configured Nginx */
app.enable('trust proxy');

app.use(cors({}));

app.use(session({
  store: new RedisStore({ client: redisClient }),
  secret: SESSION_SECRET,
  saveUninitialized: false,
  resave: false,
  cookie: {
    secure: false,
    httpOnly: true, // javascript/browser cannot access it
    maxAge: 60000 // 60 seconds
  }
}))
app.use(express.json());

const apiVersion = '/api/v1';

app.get(apiVersion, (req, res) => {
  console.log('api hit');
  res.send(`<h2>Node Docker POC!</h2><h1>${process.env.NODE_ENV}</h1>`);
})

app.use(`${apiVersion}/posts`, postRouter);
app.use(`${apiVersion}/users`, userRouter);

const port = process.env.PORT || 3000;

app.listen(port, () => console.log(`Listening on port ${port}`));