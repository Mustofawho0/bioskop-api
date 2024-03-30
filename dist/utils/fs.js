"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WriteFile = exports.ReadFile = void 0;
const fs_1 = __importDefault(require("fs"));
const ReadFile = () => {
    return JSON.parse(fs_1.default.readFileSync("./db/db.json").toString());
};
exports.ReadFile = ReadFile;
const WriteFile = (db) => {
    fs_1.default.writeFileSync("./db/db.json", JSON.stringify(db));
};
exports.WriteFile = WriteFile;
