const { Telegraf } = require('telegraf');
const TOKEN = process.env.TOKEN || '';
const PORT = process.env.PORT || 3000;
const URL = process.env.URL || 'https://kyunimbot.herokuapp.com';

const bot = new Telegraf(TOKEN);

bot.start(ctx=>ctx.reply(`Hai ${ctx.from.first_name}`))

bot.telegram.setWebhook(`${URL}/bot${TOKEN}`);
bot.startWebhook(`/bot${TOKEN}`, null, PORT)
