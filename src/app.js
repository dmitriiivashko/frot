const INSTALL_URL = 'https://github.com/dmitriiivashko/frontend-boilerplate/archive/master.zip';

import Yargs from 'yargs';
import Path from 'path';
import mkdirp from 'mkdirp';
import request from 'request';
import Progress from 'progress';
import Chalk from 'chalk';
import AdmZip from 'adm-zip';
import cp from 'child_process';

const postinstall = (dir) => {
  process.chdir(dir);
  cp.spawn('bundle', ['install'], { stdio: 'inherit' }).on('close', () => {
    cp.spawn('npm', ['install'], { stdio: 'inherit' });
  });
};

const argv = Yargs
  .usage('Usage: $0 [path]')
  .demand(1)
  .strict()
  .argv;

if (!argv._ || argv._.length !== 1) {
  process.exit(0);
}

const installPath = Path.resolve(process.cwd(), argv._[0]);

mkdirp.sync(installPath);

let bar;
const data = [];
let dataLen = 0;

console.log(`\n${Chalk.bold.green('Installing to:')} ${installPath}`);

request.get(INSTALL_URL, {
  followAllRedirects: true,
  encoding: null,
  headers: {
    'Accept-Encoding': 'gzip, deflate',
  },
})
.on('response', (res) => {
  const len = parseInt(res.headers['content-length'], 10);
  bar = new Progress('Downloading [:bar] :percent :etas', {
    complete: '=',
    incomplete: ' ',
    width: 10000,
    total: len,
  });
})
.on('data', (chunk) => {
  bar.tick(chunk && chunk.length ? chunk.length : 0);
  data.push(chunk);
  dataLen += chunk.length;
})
.on('end', () => {
  const buf = new Buffer(dataLen);
  for (let i = 0, len = data.length, pos = 0; i < len; i++) {
    data[i].copy(buf, pos);
    pos += data[i].length;
  }
  const zip = new AdmZip(buf);
  zip.extractEntryTo('frontend-boilerplate-master/', installPath, false, true);
  console.log();
  postinstall(installPath);
});
