const { scheduleJob } = require('node-schedule');
const traceMe = require('./traceMe');

const jobs = [];

// every 30 minutes scan my IP
jobs.push(scheduleJob('20,50 * * * *', traceMe));

console.log(jobs.map(job => job.name), 'has registered');
