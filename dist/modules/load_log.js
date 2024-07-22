"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.readJSONFiles = readJSONFiles;
exports.extractDataTable = extractDataTable;
exports.saveExtractedData = saveExtractedData;
exports.filterDataTable = filterDataTable;
const promises_1 = __importDefault(require("fs/promises"));
const path_1 = __importDefault(require("path"));
// BOM付きファイルの読み取り
async function readFileWithBOM(filePath) {
    const buffer = await promises_1.default.readFile(filePath);
    let data = buffer.toString('utf8');
    // UTF-8 BOMのチェックと削除
    if (data.charCodeAt(0) === 0xFEFF) {
        data = data.substring(1);
    }
    return data;
}
// 独自フォーマットを標準JSONに変換する関数
function convertToStandardJSON(data) {
    return data
        .replace(/</g, '{')
        .replace(/>/g, '}')
        .replace(/~"/g, '":')
        .replace(/~\{/g, ': {')
        .replace(/"\~/g, '": ')
        .replace(/::/g, ':');
}
// JSONファイルを読み込む関数
async function readJSONFiles(baseDir, fileNames) {
    const jsonData = [];
    const files = await promises_1.default.readdir(baseDir);
    for (const file of files) {
        const filePath = path_1.default.join(baseDir, file);
        const stats = await promises_1.default.stat(filePath);
        if (stats.isDirectory()) {
            // 再帰的にサブディレクトリを探索
            jsonData.push(...await readJSONFiles(filePath, fileNames));
        }
        else if (path_1.default.extname(file) === '.json' && fileNames.includes(file)) {
            // 指定されたファイル名のJSONファイルを読み込む
            const data = await readFileWithBOM(filePath);
            const cleanedData = convertToStandardJSON(data);
            try {
                const parsedData = JSON.parse(cleanedData);
                jsonData.push({ filePath, content: parsedData });
            }
            catch (parseError) {
                console.error(`Error parsing JSON from file ${filePath}:`, parseError);
            }
        }
    }
    return jsonData;
}
// データテーブルとして使用するための整形
function extractDataTable(jsonData) {
    return jsonData.map(item => ({
        filePath: item.filePath,
        ...item.content
    }));
}
// 抽出されたデータをファイルに保存する
async function saveExtractedData(jsonData, outputPath) {
    const dataString = JSON.stringify(jsonData, null, 2);
    await promises_1.default.writeFile(outputPath, dataString);
    console.log(`Extracted data saved to ${outputPath}`);
}
// データテーブルをフィルタリングする関数
function filterDataTable(dataTable, filterFunction) {
    return dataTable.filter(filterFunction);
}
// // メイン処理
// const baseDirectory = path.join(__dirname, 'LOG');
// readJSONFiles(baseDirectory).then(files => {
//   const dataTable = extractDataTable(files);
//   // 例: `RunningLog.json`ファイルのデータを抽出する
//   const runningLogs = filterDataTable(dataTable, (item): item is RunningLog => 'ScenarioPath' in item);
//   console.log('Running Logs:', runningLogs);
//   // 例: `ExceptionLog.json`ファイルのデータを抽出する
//   const exceptionLogs = filterDataTable(dataTable, (item): item is ExceptionLog => 'ErrorMessage' in item);
//   console.log('Exception Logs:', exceptionLogs);
// });
