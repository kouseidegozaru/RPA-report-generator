"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_path_1 = __importDefault(require("node:path"));
const electron_1 = require("electron");
// 開発時には electron アプリをホットリロードする
if (process.env.NODE_ENV === "development") {
    require("electron-reload")(__dirname, {
        electron: node_path_1.default.resolve(__dirname, process.platform === "win32"
            ? "../node_modules/electron/dist/electron.exe"
            : "../node_modules/.bin/electron"),
        forceHardReset: true,
        hardResetMethod: "exit",
    });
}
electron_1.app.whenReady().then(() => {
    // アプリの起動イベント発火で BrowserWindow インスタンスを作成
    const mainWindow = new electron_1.BrowserWindow({
        webPreferences: {
            // tsc or webpack が出力したプリロードスクリプトを読み込み
            preload: node_path_1.default.join(__dirname, 'preload.js'),
        },
    });
    // レンダラープロセスをロード
    mainWindow.loadFile('dist/index.html');
});
// すべてのウィンドウが閉じられたらアプリを終了する
electron_1.app.once('window-all-closed', () => electron_1.app.quit());
