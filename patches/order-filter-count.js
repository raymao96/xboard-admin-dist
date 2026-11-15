const fs = require('fs');
const path = require('path');

module.exports = function() {
    const assetsDir = path.join(__dirname, '..', 'assets');
    const files = fs.readdirSync(assetsDir).filter(f => /^index-.*\.js$/.test(f));
    if (files.length !== 1) throw new Error('order-filter-count: 無法唯一識別主程式');
    const file = path.join(assetsDir, files[0]);
    const code = fs.readFileSync(file, 'utf8');
    const start = code.indexOf('function g6t({column:e,title:t,options:n})');
    const end = code.indexOf('function ', start + 10);
    if (start < 0 || end < 0) throw new Error('order-filter-count: 找不到篩選元件');
    const section = code.slice(start, end);
    const anchor = 'i?.get(t.value)&&Q.jsx("span",{className:"ml-auto flex h-4 w-4 items-center justify-center font-mono text-xs",children:i.get(t.value)})';
    const marker = 'null/* order-filter-count-patch */';
    if (!section.includes(marker)) {
        if (section.split(anchor).length !== 2) throw new Error('order-filter-count: 找不到唯一的計數錨點');
        fs.writeFileSync(file, code.slice(0, start) + section.replace(anchor, marker) + code.slice(end));
        console.log('[成功] 已隱藏訂單篩選選項的本頁計數');
    } else {
        console.log('[略過] order-filter-count: 已經注入過');
    }
    const indexPath = path.join(__dirname, '..', 'index.html');
    const html = fs.readFileSync(indexPath, 'utf8');
    const asset = './assets/' + files[0];
    const cacheKey = '?order-filter-count=1';
    if (!html.includes(asset + '?')) {
        if (html.split(asset + '"').length !== 2) throw new Error('order-filter-count: 找不到主程式載入錨點');
        fs.writeFileSync(indexPath, html.replace(asset + '"', asset + cacheKey + '"'));
    }
};

if (require.main === module) module.exports();
