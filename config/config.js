'use strict';

var path = require('path'),
    fs = require('fs'),
    rootPath = path.normalize(__dirname + '/..'),
    env,
    db,
    port,
    b_port,
    p2p_port;

var packageStr = fs.readFileSync('package.json');
var version = JSON.parse(packageStr).version;


function getUserHome() {
    return process.env[(process.platform == 'win32') ? 'USERPROFILE' : 'HOME'];
}

var home = process.env.INSIGHT_DB || ( getUserHome()  + '/.insight' );

if (process.env.INSIGHT_NETWORK === 'livenet') {
  env = 'livenet';
  db = home;
  port = '3010';
  b_port = '18181';
  p2p_port = '18188';
}
else {
  env = 'testnet';
  db = home + '/testnet';
  port = '3011';
  b_port = '19266';
  p2p_port = '19265';
}


switch(process.env.NODE_ENV) {
  case 'production':
    env += '';
    break;
  case 'test':
    env += ' - test environment';
    break;
  default:
    env += ' - development';
    break;
}

var network = process.env.INSIGHT_NETWORK || 'testnet';

var dataDir = process.env.SOLARCOIND_DATADIR;
var isWin = /^win/.test(process.platform);
var isMac = /^darwin/.test(process.platform);
var isLinux = /^linux/.test(process.platform);
if (!dataDir) {
  if (isWin) dataDir = '%APPDATA%\\DigiByte\\';
  if (isMac) dataDir = process.env.HOME + '/Library/Application Support/DigiByte/';
  if (isLinux) dataDir = process.env.HOME + '/.DigiByte/';
}
dataDir += network === 'testnet' ? 'testnet3' : '';

var safeConfirmations = process.env.INSIGHT_SAFE_CONFIRMATIONS || 6;
var ignoreCache      = process.env.INSIGHT_IGNORE_CACHE || 0;


var solarcoindConf = {
  protocol:  process.env.BITMARKD_PROTO || 'http',
  user: process.env.SOLARCOIND_USER || 'user',
  pass: process.env.SOLARCOIND_PASS || 'pass',
  host: process.env.SOLARCOIND_HOST || '127.0.0.1',
  port: process.env.SOLARCOIND_PORT || b_port,
  p2pPort: process.env.SOLARCOIND_P2P_PORT || p2p_port,
  p2pHost: process.env.SOLARCOIND_P2P_HOST || process.env.SOLARCOIND_HOST || '127.0.0.1',
  dataDir: dataDir,
  // DO NOT CHANGE THIS!
  disableAgent: true
};

/*jshint multistr: true */
console.log(
'\n\
    ____           _       __    __     ___          _ \n\
   /  _/___  _____(_)___ _/ /_  / /_   /   |  ____  (_)\n\
   / // __ \\/ ___/ / __ `/ __ \\/ __/  / /\| \| / __ \\/ / \n\
 _/ // / / (__  ) / /_/ / / / / /_   / ___ |/ /_/ / /  \n\
/___/_/ /_/____/_/\\__, /_/ /_/\\__/  /_/  |_/ .___/_/   \n\
                 /____/                   /_/           \n\
\n\t\t\t\t\t\tv%s\n\
  # Configuration:\n\
\t\tNetwork: %s\tINSIGHT_NETWORK\n\
\t\tDatabase Path:  %s\tINSIGHT_DB\n\
\t\tSafe Confirmations:  %s\tINSIGHT_SAFE_CONFIRMATIONS\n\
\t\tIgnore Cache:  %s\tINSIGHT_IGNORE_CACHE\n\
 # Bicoind Connection configuration:\n\
\t\tRPC Username: %s\tSOLARCOIND_USER\n\
\t\tRPC Password: %s\tSOLARCOIND_PASS\n\
\t\tRPC Protocol: %s\tSOLARCOIND_PROTO\n\
\t\tRPC Host: %s\tSOLARCOIND_HOST\n\
\t\tRPC Port: %s\tSOLARCOIND_PORT\n\
\t\tP2P Port: %s\tSOLARCOIND_P2P_PORT\n\
\t\tData Dir: %s\tSOLARCOIND_DATADIR\n\
\t\t%s\n\
\nChange setting by assigning the enviroment variables in the last column. Example:\n\
 $ INSIGHT_NETWORK="testnet" SOLARCOIND_HOST="123.123.123.123" ./insight.js\
\n\n',
version,
network, home, safeConfirmations, ignoreCache?'yes':'no',
solarcoindConf.user,
solarcoindConf.pass?'Yes(hidden)':'No',
solarcoindConf.protocol,
solarcoindConf.host,
solarcoindConf.port,
solarcoindConf.p2pPort,
dataDir+(network==='testnet'?'*':''),
(network==='testnet'?'* (/testnet3 is added automatically)':'')
);


if (! fs.existsSync(db)){

  console.log('## ERROR ##\n\tDB Directory "%s" not found. \n\tCreate it, move your old DB there or set the INSIGHT_DB environment variable.\n\tNOTE: In older insight-api versions, db was stored at <insight-root>/db', db);
  process.exit(-1);
}

module.exports = {
  root: rootPath,
  publicPath: process.env.INSIGHT_PUBLIC_PATH || false,
  appName: 'Insight ' + env,
  apiPrefix: '/api',
  port: port,
  leveldb: db,
  solarcoind: solarcoindConf, 
  network: network,
  disableP2pSync: false,
  disableHistoricSync: false,
  poolMatchFile: rootPath + '/etc/minersPoolStrings.json',

  // Time to refresh the currency rate. In minutes
  currencyRefresh: 10,
  keys: {
    segmentio: process.env.INSIGHT_SEGMENTIO_KEY
  },
  safeConfirmations: safeConfirmations, // PLEASE NOTE THAT *FULL RESYNC* IS NEEDED TO CHANGE safeConfirmations
  ignoreCache: ignoreCache,
};
