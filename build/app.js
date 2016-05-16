'use strict';

var _yargs = require('yargs');

var _yargs2 = _interopRequireDefault(_yargs);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _mkdirp = require('mkdirp');

var _mkdirp2 = _interopRequireDefault(_mkdirp);

var _request = require('request');

var _request2 = _interopRequireDefault(_request);

var _progress = require('progress');

var _progress2 = _interopRequireDefault(_progress);

var _chalk = require('chalk');

var _chalk2 = _interopRequireDefault(_chalk);

var _admZip = require('adm-zip');

var _admZip2 = _interopRequireDefault(_admZip);

var _child_process = require('child_process');

var _child_process2 = _interopRequireDefault(_child_process);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var INSTALL_URL = 'https://github.com/dmitriiivashko/frontend-boilerplate/archive/master.zip';

var postinstall = function postinstall(dir) {
  process.chdir(dir);
  _child_process2.default.spawn('bundle', ['install'], { stdio: 'inherit' }).on('close', function () {
    _child_process2.default.spawn('npm', ['install'], { stdio: 'inherit' });
  });
};

var argv = _yargs2.default.usage('Usage: $0 [path]').demand(1).strict().argv;

if (!argv._ || argv._.length !== 1) {
  process.exit(0);
}

var installPath = _path2.default.resolve(process.cwd(), argv._[0]);

_mkdirp2.default.sync(installPath);

var bar = void 0;
var data = [];
var dataLen = 0;

console.log('\n' + _chalk2.default.bold.green('Installing to:') + ' ' + installPath);

_request2.default.get(INSTALL_URL, {
  followAllRedirects: true,
  encoding: null,
  headers: {
    'Accept-Encoding': 'gzip, deflate'
  }
}).on('response', function (res) {
  var len = parseInt(res.headers['content-length'], 10);
  bar = new _progress2.default('Downloading [:bar] :percent :etas', {
    complete: '=',
    incomplete: ' ',
    width: 10000,
    total: len
  });
}).on('data', function (chunk) {
  bar.tick(chunk.length);
  data.push(chunk);
  dataLen += chunk.length;
}).on('end', function () {
  var buf = new Buffer(dataLen);
  for (var i = 0, len = data.length, pos = 0; i < len; i++) {
    data[i].copy(buf, pos);
    pos += data[i].length;
  }
  var zip = new _admZip2.default(buf);
  zip.extractEntryTo('frontend-boilerplate-master/', installPath, false, true);
  console.log();
  postinstall(installPath);
});