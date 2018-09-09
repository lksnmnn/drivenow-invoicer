'use strict';

const fs = require('fs');
const https = require('https');

const year = process.argv[2];
if (!year) {
  console.error('Usage: node index.js <year>');
  console.error('  example: node index.js 2016');
  process.exit(1);
}

const mkdirp = path => {
  try {
    fs.mkdirSync(path);
  } catch(e) {
    if (e.code !== 'EEXIST') throw e;
  }
};

const months = Array.apply(null, { length: 12  }).map(Number.call, Number).map(n => n + 1);

months.forEach(m => {
  console.log(`Downloading monthly recap ${m}`);
  const result = require('child_process').spawnSync('curl', [
    `https://www.drive-now.com/crm-api/trips?month=${m}&year=${year}&account=private&country=en&language=en`,
    '--compressed',
    '-b', 'cookies.txt'
  ]);
  if (result.status !== 0) {
    console.error(result.error);
    return;
  }
  fs.writeFileSync(`${m}.json`, result.stdout);
  console.log(`Downloaded file ${m}.json`);
});

const fileNames = months.map(i => `${i}.json`);

const downloadDir = 'invoices';
mkdirp(downloadDir);

const s = fileNames.reduce((sum, fileName) => {
  const f = fs.readFileSync(fileName, 'utf8');

  const json = JSON.parse(f);
  if (!json.trips) {
    return sum;
  }

  const rides = json.trips;
  const s = rides.reduce((sum, p) => {
    const x = p.priceFormatted;
    return sum + parseFloat(x);
  }, 0);

  console.log(`On month ${fileName} you spent ${s.toFixed(2)} €`);

  return sum + s;
}, 0);

console.log('\n-----------------------------------------------');
console.log(`In ${year} you spent a total of ${s.toFixed(2)}`);
console.log('-----------------------------------------------\n');

fileNames.forEach(fileName => {

  const f = fs.readFileSync(fileName, 'utf8');
  const json = JSON.parse(f);
  if (!json.trips) {
    return;
  }

  const paidInvoices = json.trips;
  if (!paidInvoices) {
    return;
  }
  paidInvoices.forEach(invoice => {
    const invoiceId = invoice.invoiceId; 
    const date = new Date(invoice.endTime);
    const year = date.getFullYear();
    const month = date.getMonth();
    const day = date.getDay();
    const fileName = `drivenow-${invoiceId}-${year}-${month}-${day}.pdf`;
    const output = fs.createWriteStream(`${downloadDir}/${fileName}`)
    console.log(`Processing invoice ${invoiceId}`);
    const curl = require('child_process').spawn('curl', [
      `https://www.drive-now.com/crm-api/invoice?invoiceId=${invoiceId}`,
      '--compressed',
      '-b', 'cookies.txt'
    ]);
    curl.stdout.on('data', data => output.write(data));
    curl.stdout.on('end', () => {
       output.end();
       console.log(`file ${fileName} downloaded to ${downloadDir}`);
     });
    curl.stderr.on('error', err => console.error(err));
    curl.on('exit', code => {
      if (code !== 0) {
        console.error(`Failed with code ${code}`);
      }
    });
  });

});

