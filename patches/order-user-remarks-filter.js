const fs = require('fs');
const path = require('path');

module.exports = function() {
    const root = path.join(__dirname, '..');
    const assetsDir = path.join(root, 'assets');
    const jsFile = fs.readdirSync(assetsDir).find(f => f.startsWith('index-') && f.endsWith('.js'));
    if (!jsFile) throw new Error('order-user-remarks-filter: 找不到主程式 bundle');
    const filePath = path.join(assetsDir, jsFile);
    let code = fs.readFileSync(filePath, 'utf8');
    let changed = false;

    const sigAnchor = 'function _6t({table:e,refetch:t}){';
    const sigExpected = 'function _6t({table:e,refetch:t,remarksOptions:l=[]}){';
    if (!code.includes(sigExpected)) {
        if (code.split(sigAnchor).length !== 2) {
            throw new Error('order-user-remarks-filter: 找不到唯一的訂單工具列函式錨點');
        }
        code = code.replace(sigAnchor, sigExpected);
        changed = true;
    }

    const callAnchor = 'toolbar:Q.jsx(_6t,{table:m,refetch:h})';
    const callExpected = 'toolbar:Q.jsx(_6t,{table:m,refetch:h,remarksOptions:g?.remarks_options??[]})';
    if (!code.includes(callExpected)) {
        if (code.split(callAnchor).length !== 2) {
            throw new Error('order-user-remarks-filter: 找不到唯一的訂單工具列呼叫錨點');
        }
        code = code.replace(callAnchor, callExpected);
        changed = true;
    }

    const filterAnchor = 'e.getColumn("commission_status")&&Q.jsx(g6t,{column:e.getColumn("commission_status"),title:n("table.columns.commissionStatus"),options:a})';
    const filterAddon = ',e.getColumn("user_remarks")&&Q.jsx(g6t,{column:e.getColumn("user_remarks"),title:n("table.columns.userRemarks"),options:[...(Array.isArray(l)?l:[]).map(e=>({label:Array.from(String(e)).slice(0,5).join(""),value:String(e)})),{label:n("table.columns.noRemarks"),value:"__EMPTY__"}]})';
    const filterExpected = filterAnchor + filterAddon;
    if (!code.includes(filterExpected)) {
        if (code.split(filterAnchor).length !== 2) {
            throw new Error('order-user-remarks-filter: 找不到唯一的佣金篩選器錨點');
        }
        code = code.replace(filterAnchor, filterExpected);
        changed = true;
    }

    if (changed) {
        fs.writeFileSync(filePath, code, 'utf8');
        console.log('[成功] order-user-remarks-filter: 已注入訂單備註篩選器');
    } else {
        console.log('[略過] order-user-remarks-filter: 已經注入過');
    }

    const localesDir = path.join(root, 'locales');
    const labels = {
        'zh-CN': { anchor: '"tradeNo": "订单号",', label: '无' },
        'en-US': { anchor: '"tradeNo": "Order No.",', label: 'None' },
        'ru-RU': { anchor: '"tradeNo": "№ Заказа",', label: 'Нет' }
    };

    Object.entries(labels).forEach(([locale, { anchor, label }]) => {
        const localePath = path.join(localesDir, `${locale}.js`);
        let content = fs.readFileSync(localePath, 'utf8');
        if (content.includes('"noRemarks": "' + label + '"')) {
            console.log(`[略過] order-user-remarks-filter: ${locale} 已有 noRemarks 翻譯`);
            return;
        }
        if (/"noRemarks":\s*"[^"]*"/.test(content)) {
            content = content.replace(/"noRemarks":\s*"[^"]*"/, `"noRemarks": "${label}"`);
            fs.writeFileSync(localePath, content, 'utf8');
            console.log(`[成功] order-user-remarks-filter: 已更新 ${locale} 翻譯`);
            return;
        }
        if (content.split(anchor).length !== 2) {
            throw new Error(`order-user-remarks-filter: ${locale} 找不到唯一的訂單 tradeNo 錨點`);
        }
        content = content.replace(anchor, anchor + `\n        "noRemarks": "${label}",`);
        fs.writeFileSync(localePath, content, 'utf8');
        console.log(`[成功] order-user-remarks-filter: 已注入 ${locale} 翻譯`);
    });

    const manifestPath = path.join(root, 'manifest.json');
    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
    const entry = manifest['index.html'];
    if (entry && entry.file) {
        const assetPath = entry.file.split('?')[0];
        const query = entry.file.includes('?') ? entry.file.split('?')[1] : '';
        const params = new URLSearchParams(query);
        if (params.get('order-user-remarks-filter') !== '1') {
            params.set('order-user-remarks-filter', '1');
            const versionedAsset = `${assetPath}?${params.toString()}`;
            entry.file = versionedAsset;
            fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + '\n', 'utf8');

            const indexPath = path.join(root, 'index.html');
            let html = fs.readFileSync(indexPath, 'utf8');
            const asset = './' + assetPath;
            const scriptPattern = new RegExp(asset.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '(?:\\?[^"\\s]*)?(?=")', 'g');
            if ((html.match(scriptPattern) || []).length === 1) {
                html = html.replace(scriptPattern, './' + versionedAsset);
                fs.writeFileSync(indexPath, html, 'utf8');
            }
        }
    }
};

if (require.main === module) module.exports();
