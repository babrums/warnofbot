import * as mongoose from 'mongoose';
import * as Tg from 'node-telegram-bot-api';
import Handler from './Handler';

/** Read .env file and set temporary environmental variables */
import * as dotenv from 'dotenv';
dotenv.config({ path: `${__dirname}/../.env` });

const log_level = process.env.log_level;
export default log_level;

/** Set mongoose promise library to native NodeJS Promise library */
(<any>mongoose).Promise = global.Promise;

/** Setup Telegram bot and Mongo server */
const bot = new Tg(process.env.bot_token, { polling: true });
const Mongoose = mongoose.connect(process.env.mongo_uri);

/** Run */
let botHandler;
Mongoose.then(() => {
  console.log(`Mongo connected to ${process.env.mongo_uri}`);
  botHandler = new Handler(bot, process.env.bot_username)
}).catch(err => {
  console.log(`Mongo error: ${err.name}: ${err.message}`);
});