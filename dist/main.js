"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_path_1 = __importDefault(require("node:path"));
const electron_1 = require("electron");
const load_log_1 = require("./modules/load_log");
let runningLogs;
let exceptionLogs;
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
const createWindow = () => {
    // アプリの起動イベント発火で BrowserWindow インスタンスを作成
    const mainWindow = new electron_1.BrowserWindow({
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            preload: node_path_1.default.join(__dirname, 'preload.js'),
        },
    });
    // 開発時にはデベロッパーツールを開く
    if (process.env.NODE_ENV === 'development') {
        mainWindow.webContents.openDevTools({ mode: 'detach' });
    }
    // レンダラープロセスをロード
    mainWindow.loadFile('dist/index.html');
};
electron_1.app.whenReady().then(async () => {
    createWindow();
    // json読み込み処理(仮)
    const baseDirectory = node_path_1.default.join(__dirname, '..', 'log');
    // `RunningLog.json`ファイルのデータを抽出する
    (0, load_log_1.readJSONFiles)(baseDirectory, ['RunningLog.json.json']).then(files => {
        const dataTable = (0, load_log_1.extractDataTable)(files);
        runningLogs = dataTable;
        console.log('Running Logs:', runningLogs);
    });
    // `ExceptionLog.json`ファイルのデータを抽出する
    (0, load_log_1.readJSONFiles)(baseDirectory, ['ExceptionLog.json']).then(files => {
        const dataTable = (0, load_log_1.extractDataTable)(files);
        exceptionLogs = dataTable;
        console.log('Exception Logs:', exceptionLogs);
    });
});
// すべてのウィンドウが閉じられたらアプリを終了する
electron_1.app.once('window-all-closed', () => electron_1.app.quit());
