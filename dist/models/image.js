"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ImageModel = void 0;
const mongoose_1 = require("mongoose");
exports.ImageModel = (0, mongoose_1.model)('Image', new mongoose_1.Schema({
    data: { type: Buffer, required: true }
}));
