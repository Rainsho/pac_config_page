const fs = require('fs');
const os = require('os');
const net = require('net');
const { exec } = require('child_process');
const ping = require('ping');

const { path, conf, lan, hosts } = require('../constants');
const origin = `${path}/gwf.pac`;
const target = `${path}/new.pac`;
const config = `${conf}/config.json`;

const exec_ext = (command) => exec(command, (error, stdout, stderr) => {
    if (error) {
        console.error(`exec error:\n${error}`);
        return;
    }
    console.log(`stdout:\n${stdout}`);
    console.log(`stderr:\n${stderr}`);
});

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

    'GET /get/ping': async (ctx, next) => {
        const data = fs.readFileSync(config, 'ASCII');
        const lines = data.split('\n');
        const currentHost = /\d+.\d+.\d+.\d+/.exec(lines[2])[0];
        let pingInfo = null;
        await Promise.all(hosts.map(x => ping.promise.probe(x, { min_reply: 10 })))
            .then(x => pingInfo = x);
        if (pingInfo) pingInfo = pingInfo
            .filter(x => x.alive && x.avg !== 'unknown');
        ctx.response.type = 'application/json';
        ctx.response.body = { pingInfo, currentHost };
    },

    'PUT /put/config': async (ctx, next) => {
        const { cur, min } = ctx.request.body;
        if (net.isIPv4(cur) && net.isIP(min)) {
            let data = fs.readFileSync(config, 'ASCII');
            const lines = data.split('\n');
            const currentHost = /\d+.\d+.\d+.\d+/.exec(lines[2])[0];
            if (cur !== currentHost) return;
            data = data.replace(cur, min);
            fs.writeFileSync(config, data);
            if (process.env.NODE_ENV === 'production') {
                await exec_ext('sudo supervisorctl restart kcptun');
            }
            ctx.response.type = 'application/json';
            ctx.response.body = { currentHost: min };
        }
    },
};
