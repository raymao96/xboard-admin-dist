const fs = require('fs');
const path = require('path');

module.exports = function() {
    const root = path.join(__dirname, '..');
    const manifestPath = path.join(root, 'manifest.json');
    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
    const entry = manifest['index.html'];
    if (!entry || !entry.file) throw new Error('order-commission-filter: 找不到 manifest 入口');
    const assetPath = entry.file.split('?')[0];
    if (!/^assets\/index-[^/]+\.js$/.test(assetPath)) throw new Error('order-commission-filter: 入口路徑不符合預期');
    const bundlePath = path.join(root, assetPath);
    let bundle = fs.readFileSync(bundlePath, 'utf8');
    const oldPatch = /^\s*\/\* order-commission-filter-patch \*\/[\s\S]*?\n\}\)\(\);\s*/;
    bundle = bundle.replace(oldPatch, '');

    const anchor = 'queryFn:()=>FD({pageSize:d.pageSize,current:d.pageIndex+1,filter:o,sort:l})';
    const replacement = 'queryFn:()=>FD({pageSize:d.pageSize,current:d.pageIndex+1,filter:o,sort:l,...o.some(e=>e&&e.id==="commission_status"&&e.value!=null&&(!Array.isArray(e.value)||e.value.length>0))?{is_commission:!0}:{}})';
    if (!bundle.includes(replacement)) {
        if (bundle.split(anchor).length !== 2) throw new Error('order-commission-filter: 找不到唯一訂單查詢錨點');
        bundle = bundle.replace(anchor, replacement);
    }

    const indexPath = path.join(root, 'index.html');
    let html = fs.readFileSync(indexPath, 'utf8');
    const asset = './' + assetPath;
    const scriptPattern = new RegExp(asset.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '(?:\\?[^"\\s]*)?(?=")', 'g');
    if ((html.match(scriptPattern) || []).length !== 1) throw new Error('order-commission-filter: 找不到唯一 HTML 入口');
    const versionedAsset = assetPath + '?order-commission-filter=3';
    html = html.replace(scriptPattern, './' + versionedAsset);
    entry.file = versionedAsset;

    fs.writeFileSync(bundlePath, bundle);
    fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + '\n');
    fs.writeFileSync(indexPath, html);
    console.log('[成功] 訂單佣金篩選已注入查詢錨點');
};

if (require.main === module) module.exports();
