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
function randText(){
  char = [0,1,2,3,4,5,6,7,8,9,'a','b','c','d','e','f','g','h','i','j','k','l','m','n','o','p','q','r','s','t','u','v','w','x','y','z']
  rText = ''
  for(i=1; i<=20; i++){
    rIn = Math.floor(Math.random() * char.length)
    rChar = rIn%2 ? char[rIn] : typeof(char[rIn]) == 'number' ? char[rIn] : char[rIn].toUpperCase()
    rText+=rChar.toString()
  }
  return rText;
}     

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
bot.start( async ctx=>{
dbtg = await axios('https://db.kyuki.tk/tg').then(res=>res.data)
console.log(dbtg)
rid = ctx.message.text.match(/\/start (.+)/i)
if(rid == null) return await ctx.reply(`Hai ${ctx.from.first_name}`)
file = rid[1].startsWith('v') ? dbtg.video[rid[1]] : dbtg
ctx.replyWithVideo(file.video.file_id, {caption: file.caption})
})
bot.on('video', async (ctx) => { 
prm = 'v'+randText()
dbtg = await axios('https://db.kyuki.tk/tg').then(res=>res.data)
dbtg.video[prm] = ctx.message
axios.post('https://db.kyuki.tk/tg', JSON.stringify(dbtg, null, 2))
ctx.reply(`https://t.me/${ctx.botInfo.username}?start=${prm}`,{reply_to_message_id: ctx.message.message_id})
})
bot.on('message', async (blu, next) => {
  isOwner = blu.from.id == '1453003802'
  body = blu.message.text || ''
  if(body.startsWith('>') && isOwner){
    await evalJs(blu, body.slice(1))
  }
  if(body.startsWith('=>') && isOwner){
    await execShell(body.slice(2))
    .then(async res=>{
      await blu.reply(res, {reply_to_message_id: blu.message.message_id})
    }).catch(e=>blu.reply(e, {reply_to_message_id: blu.message.message_id}))
  }
})

bot.telegram.setWebhook(`${URL}/bot${TOKEN}`);
bot.startWebhook(`/bot${TOKEN}`, null, PORT)
