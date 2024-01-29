"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateCode = void 0;
function generateCode(length = 6) {
    if (typeof length !== 'number')
        length = 6;
    let res = '';
    for (let i = 0; i < length; i++) {
        res += Math.floor(Math.random() * 22).toString(22);
    }
    return res;
}
exports.generateCode = generateCode;
