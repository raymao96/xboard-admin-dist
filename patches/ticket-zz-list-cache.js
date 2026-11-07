const fs = require('fs');
const path = require('path');
const {spawnSync} = require('child_process');

module.exports = function () {
    const assets = path.join(__dirname, '..', 'assets');
    const bundle = fs.readdirSync(assets).find(name => /^index-.*\.js$/.test(name));
    if (!bundle) throw new Error('ticket-list-cache: 找不到 bundle');
    const file = path.join(assets, bundle);
    let code = fs.readFileSync(file, 'utf8');
    const old = 'e(),await Promise.all([n.invalidateQueries({queryKey:["ticketSidebarList"]}),n.invalidateQueries({queryKey:["ticketDetail"]})])';
    const updated = 'await Promise.all([n.invalidateQueries({queryKey:["ticketList"]}),n.invalidateQueries({queryKey:["ticketSidebarList"]}),n.invalidateQueries({queryKey:["ticketDetail"]})])';
    const start = code.indexOf('i9t=(e,t,n,i)=>');
    const end = code.indexOf('function b9t(', start);
    if (start < 0 || end < 0) throw new Error('ticket-list-cache: 找不到工單列表操作區塊');
    const section = code.slice(start, end);
    const oldCount = section.split(old).length - 1;
    const newCount = section.split(updated).length - 1;
    if (oldCount === 2 && newCount === 0) {
        code = code.slice(0, start) + section.replaceAll(old, updated) + code.slice(end);
        const check = spawnSync(process.execPath, ['--check', '--input-type=module'], {input: code, encoding: 'utf8'});
        if (check.status !== 0) throw new Error(check.stderr || 'ticket-list-cache: bundle 語法錯誤');
        fs.writeFileSync(file, code);
        console.log('[成功] ticket-list-cache: 關閉及重開後更新全部列表快取');
    } else if (oldCount === 0 && newCount === 2) {
        console.log('[略過] ticket-list-cache: 已注入');
    } else throw new Error(`ticket-list-cache: 操作錨點數量異常 old=${oldCount} new=${newCount}`);
};

if (require.main === module) module.exports();
