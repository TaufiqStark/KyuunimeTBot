const { Telegraf } = require('telegraf');
const TOKEN = process.env.TOKEN || '';
const PORT = process.env.PORT || 3000;
const URL = process.env.URL || 'https://kyunimbot.herokuapp.com';
const { exec } = require('child_process');
const cheerio = require('cheerio');
const axios = require('axios');
const fs = require('fs');
const bot = new Telegraf(TOKEN);
const { GetLink, DLFunc } = require('./zippy.js');
const { neoUpdate, neoLink, neOngoing } = require('./neonime.js');

function makeButton(blu, msg, ...btn){
  //console.log(btn)
  blu.reply(msg, {
    reply_markup: {
      inline_keyboard: btn
    },
    parse_mode: "Markdown",
    disable_web_page_preview: "true" 
  })
}

function evalJs(blu, code){
  try{
    res = JSON.stringify(eval(code), null, 3)
    if(res != '{}' && res != '' && res !== undefined){
      blu.reply(res, {reply_to_message_id: blu.message.message_id})
    }
  }catch(e){
    blu.reply(e.toString(), {reply_to_message_id: blu.message.message_id})
  }
}
function execShell(command){
  return new Promise((resolve, reject) =>{
    exec(command, (error, stdout, stderr) => {
      if (error) {
        reject(error/*+'\n'+stderr*/);
        return;
      }
      resolve(stdout.trim());
    });
  });
}
bot.start(ctx=>ctx.reply(`Hai ${ctx.from.first_name}`))
bot.on('message', async (blu, next) => {
  isOwner = blu.from.id == '1453003802'
  body = blu.message.text || ''
  if(body.startsWith('>') && isOwner){
    await evalJs(blu, body.slice(1))
  }
})

bot.telegram.setWebhook(`${URL}/bot${TOKEN}`);
bot.startWebhook(`/bot${TOKEN}`, null, PORT)
