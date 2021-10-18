const _url = require('url')
const _https = require('https')
const _fs = require('fs')
const _$ = require('cheerio')
const _axios = require('axios')
//const _proggers = require('cli-progress')
//const _math = require('mathjs')

const clacSize = (a, b) => {
    if (0 == a) return "0 Bytes";
    var c = 1024,
        d = b || 2,
        e = ["Bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"],
        f = Math.floor(Math.log(a) / Math.log(c));
    return parseFloat((a / Math.pow(c, f)).toFixed(d)) + " " + e[f]
}
const toPersen = (curr, total) => {
  return (curr / total * 100).toFixed(1) + '%'
}
exports.GetLink = async (u) => {
    console.log('⏳  ' + `Get Page From : ${u}`)
    const zippy = await _axios({ method: 'GET', url: u }).then(res => res.data).catch(err => false)
    console.log('✅  ' + 'Done')
    const $ = _$.load(zippy)
    if (!$('#dlbutton').length) {
        return { error: true, message: $('#lrbox>div').first().text().trim() }
    }
    console.log('⏳  ' + 'Fetch Link Download...')
    const url = _url.parse($('.flagen').attr('href'), true)
    const urlori = _url.parse(u)
    const key = url.query['key']
    let time;
    let dlurl;
    try {
        time = /var b = ([0-9]+);$/gm.exec($('#dlbutton').next().html())[1]
        dlurl = urlori.protocol + '//' + urlori.hostname + '/d/' + key + '/' + (2 + 2 * 2 + parseInt(time)) + '3/DOWNLOAD'
    } catch (error) {
        time = eval(/ \+ \((.*)\) \+ /gm.exec($('#dlbutton').next().html())[1])
        dlurl = urlori.protocol + '//' + urlori.hostname + '/d/' + key + '/' + (time) + '/DOWNLOAD'
    }
    console.log('✅  ' + 'Done')
    return { error: false, url: dlurl }
}

exports.DLFunc = async (bot, blu, u, fn, cb= () => { }) => {
    const url = await exports.GetLink(u)
    if (url.error) {
        console.log(' ' + url.message + ' ')
        return null
    }
    const req = await _https.get(url.url)
    let msg = await blu.reply('_Starting Download..._',{parse_mode: 'markdown'})
    console.log('🎁  ' + ('Start Download From URL : ' + url.url))
    console.log('⏳  ' + 'Waiting Server Response...');
    await req.on('response', async res => {
        if (!res.headers['content-disposition']) {
            console.log('🔁  ' + ('Server Download Error, Try To Get New Link...'))
            exports.DLFunc(bot, blu, u, fn, cb)
        } else {
            //let dir = './downloads/'
            console.log('✅  ' + ('Server Response'))
            //msg.then(a=>bot.telegram.deleteMessage(a.chat.id,a.message_id))
            const size = parseInt(res.headers['content-length'], 10),
                filename = decodeURIComponent(res.headers['content-disposition'].match(/filename\*?=['"]?(?:UTF-\d['"]*)?([^;\r\n"']*)['"]?;?/)[1])
            let currentSize = 0
            let edt = 1
            console.log(size)
            //let msg = blu.reply('Start Downloading File...')
            console.log('☕  ' + ('Start Downloading File : ' + filename))
            const file = await _fs.createWriteStream(fn || filename)
            try {
              await res.pipe(file)
            } catch (e) {console.log(e)}
            /*const loadbar = new _proggers.Bar({
                format: 'Downloading ' + ('{bar}') + ' {percentage}% | {current}/{size} | ETA: {eta}s | Speed: {speed}',
                barsize: 25
            }, _proggers.Presets.shades_classic)
            loadbar.start(size, 0, {
                size: clacSize(size, 3),
                current: clacSize(currentSize, 3),
                speed: 0
            })*/
            res.on('data', c => {
                currentSize += c.length;
                ed = Math.floor(size / Math.pow(size.toString().length, size.toString().length-2))
                edt = edt >= 100? 1 : edt 
                //console.log(ed)
                //edt++
                if(edt == 1 || size == currentSize){
                  console.log(/*clacSize(currentSize)*/c.length)
                  bot.telegram.editMessageText(msg.chat.id, msg.message_id, '', `_Progress: ${clacSize(currentSize)} of ${clacSize(size)} (${toPersen(currentSize, size)})_`,{parse_mode: 'markdown'})
                }
                edt++
                /*loadbar.increment(c.length, {
                    speed: clacSize(c.length),
                    current: clacSize(currentSize, 3)
                })*/
            })
            res.on('end', _ => {
                //loadbar.stop()
                file.close()
                console.log('✅  ' + ('Success Download File : ' + filename))
                console.log('Size: '+clacSize(currentSize))
                bot.telegram.editMessageText(msg.chat.id, msg.message_id,'',`_Uploading..._`,{parse_mode:'markdown'})
                bot.telegram.sendChatAction(blu.chat.id,'upload_video')
                blu.replyWithVideo({source: fn || filename}, {caption: `${fn || filename}\n${''/*clacSize(currentSize)*/}`}).then(a=>{
                  bot.telegram.copyMessage('@lifenotdaijobu',a.chat.id,a.message_id)
                  bot.telegram.editMessageText(msg.chat.id, msg.message_id,'',`_✅ Done_`,{parse_mode:'markdown'})
                  console.log(a)})
                cb(fn)
            })
            res.on('error', _ => {
                //loadbar.stop()
                console.log('❎  ' + ('Error Download File : ' + filename))
                cb(fn)
            })
        }
    })
}
