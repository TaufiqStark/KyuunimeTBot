const cheerio = require('cheerio')
const fs = require('fs')
const axios = require('axios')
const fetch = require('node-fetch')
const link = 'https://neonime.cc/episode'
//const sc = fs.readFileSync('./neonime.cc-episode.txt').toString()
//const scko = fs.readFileSync('./neonime-kobayashi.txt').toString()
/*const neoUpdate = async () => {
  res = await axios(link)
  const $ = cheerio.load(res.data)
  let update = []
  //let hasil = []
  try {
  await $('td[class=bb] > a')
  .each((i, val) => {
    judul = $(val).text()
    eps = $(val).attr('href')
    update.push({judul, eps})
  })
  } catch (e) {console.log(e)}
  return Promise.all(update)
}*/
function neoUpdate(){
  return new Promise((resolve, reject)=> {
    axios(link).then(res => {
      const $ = cheerio.load(res.data)
      update = []
      $('td[class=bb] > a')
      .each((i, val) => {
        title = $(val).text()
        eps = $(val).attr('href')
        update.push({title, eps})
       })
      resolve(Promise.all(update))
    })
    .catch(reject)
  })
}
function neoLink(epslink){
  return new Promise(async (resolve, reject)=> {
    //let epslink = await neoUpdate()
    axios(epslink.episode || epslink).then(res=>{
      boxDown = []
      const $$ = cheerio.load(res.data)
      $$('div[class=linkstv] > div[class=sbox]').find('a')
      .each((i, val) => {
        host = $$(val).text()
        down = $$(val).attr('href')
        boxDown.push({host, down})
      })
      resolve(Promise.all(boxDown))
    })
    .catch(reject)
  })
}
const neOngoing = async () => {
  hasil = []
  update = await neoUpdate()
  for(let up of update){
    links = await neoLink(up.eps)
    title = up.title
    hasil.push({title, links})
  }
  return Promise.all(hasil)
}
module.exports = { neoUpdate, neoLink, neOngoing }



