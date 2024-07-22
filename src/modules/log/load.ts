import fs from 'fs/promises';
import path from 'path';
import { JSONData } from './types';

// BOM付きファイルの読み取り
async function readFileWithBOM(filePath: string): Promise<string> {
  const buffer = await fs.readFile(filePath);
  let data = buffer.toString('utf8');
  // UTF-8 BOMのチェックと削除
  if (data.charCodeAt(0) === 0xFEFF) {
    data = data.substring(1);
  }
  return data;
}

// 独自フォーマットを標準JSONに変換する関数
function convertToStandardJSON(data: string): string {
  return data
    .replace(/</g, '{')
    .replace(/>/g, '}')
    .replace(/~"/g, '":')
    .replace(/~\{/g, ': {')
    .replace(/"\~/g, '": ')
    .replace(/::/g, ':');
}

// JSONファイルを読み込む関数
export async function readJSONFiles(baseDir: string, fileNames: string[]): Promise<{ filePath: string; content: JSONData }[]> {
  const jsonData: { filePath: string; content: JSONData }[] = [];
  const files = await fs.readdir(baseDir);

  for (const file of files) {
    const filePath = path.join(baseDir, file);
    const stats = await fs.stat(filePath);

    if (stats.isDirectory()) {
      // 再帰的にサブディレクトリを探索
      jsonData.push(...await readJSONFiles(filePath, fileNames));
    } else if (path.extname(file) === '.json' && fileNames.includes(file)) {
      // 指定されたファイル名のJSONファイルを読み込む
      const data = await readFileWithBOM(filePath);
      const cleanedData = convertToStandardJSON(data);

      try {
        const parsedData = JSON.parse(cleanedData);
        jsonData.push({ filePath, content: parsedData });
      } catch (parseError) {
        console.error(`Error parsing JSON from file ${filePath}:`, parseError);
      }
    }
  }

  return jsonData;
}

// データテーブルとして使用するための整形
export function extractDataTable(jsonData: { filePath: string; content: JSONData }[]): JSONData[] {
  return jsonData.map(item => ({
    filePath: item.filePath,
    ...item.content
  }));
}

// 抽出されたデータをファイルに保存する
export async function saveExtractedData(jsonData: JSONData[], outputPath: string): Promise<void> {
  const dataString = JSON.stringify(jsonData, null, 2);
  await fs.writeFile(outputPath, dataString);
  console.log(`Extracted data saved to ${outputPath}`);
}

// データテーブルをフィルタリングする関数
export function filterDataTable(dataTable: JSONData[], filterFunction: (item: JSONData) => boolean): JSONData[] {
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
