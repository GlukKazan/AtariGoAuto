"use strict";

const _ = require('underscore');

const utils = require('./utils');

function ai(size) {
    this.size = size;
}

ai.prototype.move = async function(board, player) {
    let c = 0;
    for (let pos = 0; pos < this.size * this.size; pos++) {
        if (Math.abs(board[pos]) < 0.01) continue;
        c++;
    }
    if (c == 0) {
        const x = _.random(2, this.size - 3);
        const y = _.random(2, this.size - 3);
        return y * this.size + x;
    }
    const stat = utils.analyze(board, this.size, player);
    let dame = [];
    for (let i = 0; i < stat.length; i++) {
        dame = _.union(dame, stat[i].dame);
        if (stat[i].player * player > 0.01) continue;
        if (stat[i].dame.length == 1) return stat[i].dame[0];
    }
    for (let i = 0; i < stat.length; i++) {
        if (stat[i].player * player < -0.01) continue;
        if (stat[i].dame.length == 1) return stat[i].dame[0];
    }
    if (dame.length == 0) return null;
    dame = utils.inflate(board, this.size, dame);
    let ix = 0;
    if (dame.length > 1) {
        ix = _.random(0, dame.length - 1);
    }
    return dame[ix];
}

function create(size, model) {
    return new ai(size, model);
}

module.exports.create = create;
