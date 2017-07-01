const fs = require('fs');
const os = require('os');

const CST = require('./constants');
const origin = `${CST.path}/gwf.pac`;
const target = `${CST.path}/new.pac`;
const lan = CST.lan;

module.exports = {
    'GET /': async (ctx, next) => {
        const html = fs.readFileSync('views/pac.html', 'utf-8');
        ctx.response.type = 'text/html;charset=utf-8';
        ctx.response.body = html;
    },

    'GET /get/address': async (ctx, next) => {
        const ips = os.networkInterfaces()[lan];
        const ip0 = ips.find(x => x.family == 'IPv4').address;
        const data = fs.readFileSync(target, 'ASCII');
        const lines = data.split('\n');
        const ip1 = /\d+.\d+.\d+.\d+/.exec(lines[3])[0];
        ctx.response.type = 'application/json';
        ctx.response.body = {
            onServer: ip0,
            onFile: ip1
        };
    },

    'PUT /put/newpac': async (ctx, next) => {
        const ips = os.networkInterfaces()[lan];
        const ip = ips.find(x => x.family == 'IPv4').address;
        let data = fs.readFileSync(origin, 'ASCII');
        data = data.replace('192.168.100.200', ip);
        fs.writeFileSync(target, data);
        ctx.response.type = 'application/json';
        ctx.response.body = {
            onServer: ip,
            onFile: ip
        };
    },
};
