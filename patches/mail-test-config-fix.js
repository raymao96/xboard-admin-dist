const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

module.exports = function () {
    const assets = path.join(__dirname, '..', 'assets');
    const bundle = fs.readdirSync(assets).find(file => /^index-.*\.js$/.test(file));
    if (!bundle) throw new Error('mail-test-config-fix: 找不到 bundle');

    const file = path.join(assets, bundle);
    let code = fs.readFileSync(file, 'utf8');
    const original = 'children:n.config.driver}),Q.jsx("div",{className:"text-muted-foreground",children:"服务器"}),Q.jsx("div",{children:n.config.host}),Q.jsx("div",{className:"text-muted-foreground",children:"端口"}),Q.jsx("div",{children:n.config.port}),Q.jsx("div",{className:"text-muted-foreground",children:"加密方式"}),Q.jsx("div",{children:n.config.encryption||"无"}),Q.jsx("div",{className:"text-muted-foreground",children:"发件人"}),Q.jsx("div",{children:n.config.from.address?`${n.config.from.address}${n.config.from.name?` (${n.config.from.name})`:""}`:"未设置"}),Q.jsx("div",{className:"text-muted-foreground",children:"用户名"}),Q.jsx("div",{children:n.config.username||"未设置"})';
    const fixed = original.replaceAll('n.config.', 'n.config?.').replaceAll('n.config?.from.', 'n.config?.from?.');
    const previous = original.replace('n.config.from.address?', 'n.config?.from?.address?');
    if (code.includes(fixed) && !code.includes(original)) {
        console.log('[略過] mail-test-config-fix: bundle 已注入');
        return;
    }
    const anchor = code.includes(original) ? original : previous;
    if (code.split(anchor).length !== 2) throw new Error('mail-test-config-fix: 找不到唯一錨點');
    code = code.replace(anchor, fixed);
    const check = spawnSync(process.execPath, ['--check', '--input-type=module'], { input: code, encoding: 'utf8' });
    if (check.status !== 0) throw new Error(check.stderr || 'mail-test-config-fix: bundle 語法錯誤');
    fs.writeFileSync(file, code);
    console.log('[成功] mail-test-config-fix: 缺少寄件人設定時顯示未设置');
};
