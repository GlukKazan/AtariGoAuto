"use strict";

const _ = require('underscore');

const LETTERS = 'ABCDEFGHIJKabcdefghijk';

const N = 0;
const E = 1;
const W = 2;
const S = 3;

let dirs = null;

function dump(board, size) {
    for (let y = 0; y < size; y++) {
        let s = '';
        for (let x = 0; x < size; x++) {
            const pos = y * size + x;
            if (board[pos] > 0) {
                s = s + '* ';
            } else if (board[pos] < 0) {
                s = s + 'o ';
            }  else {
                s = s + '. ';
            }
        }
        console.log(s);
    }
    console.log('');
}

function formatMove(move, size) {
    const col = move % size;
    const row = (move / size) | 0;
    return LETTERS[col] + LETTERS[row].toLowerCase();
}

function getDir(ix, size) {
    if (dirs === null) {
        dirs = [
            -size, // N
            1,     // E
            -1,    // W
            size   // S
        ];
    }
    return dirs[ix];
}

function navigate(size, pos, ix) {
    const x = pos % size;
    const y = (pos / size) | 0;
    if ((ix == N) && (y == 0)) return null;
    if ((ix == E) && (x == size - 1)) return null;
    if ((ix == W) && (x == 0)) return null;
    if ((ix == S) && (y == size - 1)) return null;
    return pos + getDir(ix, size);
}

function expanse(board, size, player, group) {
    let dame = [];
    for (let ix = 0; ix < group.length; ix++) {
        _.each([N, E, W, S], function(dir) {
            const p = navigate(size, group[ix], dir);
            if (p === null) return;
            if (_.indexOf(group, p) >= 0) return;
            if (Math.abs(board[p]) < 0.01) {
                dame.push(p);
                return;
            }
            if (board[p] * player < -0.01) return;
            group.push(p);
        });
    }
    return dame;
}

function apply(board, size, player, pos) {
    if (Math.abs(board[pos]) > 0.01) return null;
    board[pos] = player;
    let done = []; let stat = [];
    let group = []; let dame = 0;
    _.each([N, E, W, S], function(dir) {
        const p = navigate(size, pos, dir);
        if (p === null) return;
        if (_.indexOf(done, p) >= 0) return;
        if (Math.abs(board[p]) < 0.01) {
            dame++;
            return;
        }
        if (board[p] * player > 0.01) {
            group.push(p);
            return;
        }
        let g = [p]; 
        const d = expanse(board, size, -player, g);
        if (d == 0) {
            stat.push({
                group: g,
                dame: d
            });
        }
        done = _.union(done, g);
    });
    if (dame == 0) {
        dame = expanse(board, size, player, group).length;
        if (dame == 0) {
            board[pos] = 0;
            return null;
        }
    }
    return stat;
}

function inflate(board, size, group) {
    let g = [];
    for (let ix = 0; ix < group.length; ix++) {
        _.each([N, E, W, S], function(dir) {
            const p = navigate(size, group[ix], dir);
            if (p === null) return;
            if (_.indexOf(group, p) >= 0) return;
            if (_.indexOf(g, p) >= 0) return;
            if (Math.abs(board[p]) > 0.01) return;
            g.push(p);
        });
    }
    return _.union(group, g);
}

function analyze(board, size) {
    let stat = [];
    let done = [];
    for (let pos = 0; pos < size * size; pos++) {
        if (_.indexOf(done, pos) >= 0) continue;
        const p = board[pos];
        if (Math.abs(p) < 0.01) continue;
        let g = [pos];
        const d = expanse(board, size, p, g);
        stat.push({
            player: p,
            group: g,
            dame: d
        });
        done = _.union(done, g);
    }
    return stat;
}

module.exports.dump = dump;
module.exports.formatMove = formatMove;
module.exports.apply = apply;
module.exports.inflate = inflate;
module.exports.analyze = analyze;
