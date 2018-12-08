const { scheduleJob } = require('node-schedule');
const sync = require('./sync');
const traceMe = require('./traceMe');

const jobs = [];

// every 12 hours do an IO bakup
jobs.push(scheduleJob('* * */12 * * *', sync));

// every 30 minutes scan my IP
jobs.push(scheduleJob('* */30 * * * *', traceMe));

console.log(jobs.map(job => job.name), 'has registered');
