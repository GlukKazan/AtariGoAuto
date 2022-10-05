"use strict";

const ai = require('./random-ai');
const utils = require('./utils');

const DO_TOTAL = 100000;
const SIZE  = 9;

var winston = require('winston');
require('winston-daily-rotate-file');

const logFormat = winston.format.combine(
    winston.format.timestamp({
        format: 'HH:mm:ss'
    }),
    winston.format.printf(
        info => `${info.level}: ${info.timestamp} - ${info.message}`
    )
);

var transport = new winston.transports.DailyRotateFile({
    dirname: '',
    filename: 'atari-go-%DATE%.log',
    datePattern: 'YYYY-MM-DD',
    zippedArchive: true,
    maxSize: '20m',
    maxFiles: '14d'
});

var logger = winston.createLogger({
    format: logFormat,
    transports: [
      transport
    ]
});

function estimate(v) {
    let r = '';
    if (v < 0) {
        r = '-';
        v = -v;
    }
    for (let i = 0; i < 3; i++) {
        v = v * 10;
        r = r + (v | 0);
    }
    return r;
}

async function run() {
    const a = ai.create(SIZE);
    const b = ai.create(SIZE);

    const t0 = Date.now();
    let w = 0; let l = 0;
    for (let i = 0; i < DO_TOTAL; i++) {
        const board = new Float32Array(SIZE * SIZE);
        let r = '';
        for (let j = 0; j < (SIZE * SIZE) / 2; j++) {
            let player = 1;
            let s = null;
            let e = [];
            let m = await a.move(board, player, e);
            if (m === null) {
                utils.dump(board, SIZE);
                return;
            }
            s = utils.apply(board, SIZE, player, m);
            if (s === null) {
                l++;
                console.log('Lose [2]:' + r);
                logger.info('Lose [2]:' + r);
                utils.dump(board, SIZE);
                break;
            }
            if (e.length > 0) {
                r = r + estimate(e[0]);
            }
            r = r + utils.formatMove(m, SIZE);
            if (s.length > 0) {
                w++;
                console.log('Won [1]: ' + r);
                logger.info('Won [1]: ' + r);
                utils.dump(board, SIZE);
                break;
            }
            player = -1;
            s = null;
            e = [];
            m = await b.move(board, player, e);
            if (m === null) {
                utils.dump(board, SIZE);
                return;
            }
            s = utils.apply(board, SIZE, player, m);
            if (s === null) {
                w++;
                console.log('Won [2]: ' + r);
                logger.info('Won [2]: ' + r);
                utils.dump(board, SIZE);
                break;
            }
            if (e.length > 0) {
                r = r + estimate(e[0]);
            }
            r = r + utils.formatMove(m, SIZE);
            if (s.length > 0) {
                l++;
                console.log('Lose [1]:' + r);
                logger.info('Lose [1]:' + r);
                utils.dump(board, SIZE);
                break;
            }
        }
    }
    const t1 = Date.now();

    console.log('Total: ' + w + '/' + l + ' (' + (+w + +l) + '), time = ' + (t1 - t0) / 1000);
    logger.info('Total: ' + w + '/' + l + ' (' + (+w + +l) + '), time = ' + (t1 - t0) / 1000);
}

(async () => { await run(); })();
