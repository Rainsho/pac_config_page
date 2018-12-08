const { scheduleJob } = require('node-schedule');
const sync = require('./sync');
const traceMe = require('./traceMe');

// every 12 hours do an IO bakup
scheduleJob('* * */12 * * *', sync);

// every 30 minutes scan my IP
scheduleJob('* */30 * * * *', traceMe);
