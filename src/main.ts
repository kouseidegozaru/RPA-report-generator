import path from 'node:path';
import { BrowserWindow, app, ipcMain } from 'electron';
import  { readJSONFiles, extractDataTable } from './modules/log/load';


let runningLogs;
let exceptionLogs;


// 開発時には electron アプリをホットリロードする
if (process.env.NODE_ENV === "development") {
  require("electron-reload")(__dirname, {
    electron: path.resolve(
      __dirname,
      process.platform === "win32"
        ? "../node_modules/electron/dist/electron.exe"
        : "../node_modules/.bin/electron",
    ),
    forceHardReset: true,
    hardResetMethod: "exit",
  });
}


const createWindow = () =>  {
  // アプリの起動イベント発火で BrowserWindow インスタンスを作成
  const mainWindow = new BrowserWindow({
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
    },
  });

    // 開発時にはデベロッパーツールを開く
    if (process.env.NODE_ENV === 'development') {
      mainWindow.webContents.openDevTools({ mode: 'detach' });
    }

  // レンダラープロセスをロード
  mainWindow.loadFile('dist/index.html');
};

app.whenReady().then(async () => {
  createWindow();
  // json読み込み処理(仮)
  const baseDirectory = path.join(__dirname, '..','log');

  // `RunningLog.json`ファイルのデータを抽出する
  readJSONFiles(baseDirectory, ['RunningLog.json.json']).then(files => {
    const dataTable = extractDataTable(files);
    runningLogs = dataTable;
    console.log('Running Logs:', runningLogs);
  });

  // `ExceptionLog.json`ファイルのデータを抽出する
  readJSONFiles(baseDirectory, ['ExceptionLog.json']).then(files => {
    const dataTable = extractDataTable(files);
    exceptionLogs = dataTable;
    console.log('Exception Logs:', exceptionLogs);
  });
});

// すべてのウィンドウが閉じられたらアプリを終了する
app.once('window-all-closed', () => app.quit());