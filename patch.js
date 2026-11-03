const fs = require('fs');
const path = require('path');

const patchesDir = path.join(__dirname, 'patches');

// 1. 自動讀取 patches 目錄下的所有 .js 檔案
const patchFiles = fs.readdirSync(patchesDir).filter(file => file.endsWith('.js'));

console.log('--- 開始應用補丁 ---');

patchFiles.forEach(file => {
    try {
        const patchPath = path.join(patchesDir, file);
        const patchFunction = require(patchPath);
        
        if (typeof patchFunction === 'function') {
            console.log(`[執行] 應用補丁: ${file}`);
            patchFunction();
        } else {
            console.warn(`[略過] ${file} 沒有導出 function`);
        }
    } catch (e) {
        console.error(`[失敗] 執行 ${file} 時發生錯誤:`, e);
    }
});

console.log('--- 所有補丁處理完畢 ---');
