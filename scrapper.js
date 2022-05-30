import fetch from 'node-fetch';
import jsdom from 'jsdom';
import * as fs from 'fs';

const dico = {
  list: []
}

async function httpCall(page = 1) {
  const url = 'https://www.listesdemots.net/touslesmots' + (page !== 1 ? 'page' + page : '') + '.htm'
  const response = await fetch(url);
  const data = await response.text();
  console.log('response aquired');

  const html = new jsdom.JSDOM(data).window.document;
  const divObj = html.querySelector('span.mot');

  fillDico(divObj.textContent);
}

function fillDico(liste) {
  if (liste == undefined || liste === '') {
    console.log('not valid, bye bye');
    return;
  }

  console.log('pushing in dico');
  liste.split(' ').forEach(element => {
    dico.list.push(element);
  });
}

function writeJsonFile() {
  console.log('writing ...');
  fs.writeFileSync('dic.json', JSON.stringify(dico), { flag: 'w+' });
  console.log('Operation completed !')
}

//process start
for (var i = 1; i < 919; i++) {
  console.log('call n°' + i + ' starting');
  await httpCall(i);
  console.log('call n°' + i + ' done');
}

writeJsonFile();

console.log('Program finished');