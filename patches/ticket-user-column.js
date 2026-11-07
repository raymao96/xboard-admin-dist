const fs = require('fs');
const path = require('path');

module.exports = function() {
    const assetsDir = path.join(__dirname, '..', 'assets');
    const jsFile = fs.readdirSync(assetsDir).find(f => f.startsWith('index-') && f.endsWith('.js'));
    const filePath = path.join(assetsDir, jsFile);
    let code = fs.readFileSync(filePath, 'utf8');

    if (code.includes('id:"user_id"')) {
        console.log('[略過] ticket-user-column: 已經注入過');
    } else {
        const anchor = 'enableHiding:!1},{accessorKey:"subject",';
        if (code.split(anchor).length !== 2) {
            throw new Error('ticket-user-column: 找不到唯一的工單欄位錨點，可能原作者更新了結構');
        }
        const column = '{id:"user_id",header:({column:e})=>Q.jsx(eQt,{column:e,title:t("columns.user_id")}),cell:({row:e})=>Q.jsx("span",{className:"pl-2 font-mono text-sm",children:e.original.user_id}),enableSorting:!1,enableHiding:!1,size:120},';
        code = code.replace(anchor, 'enableHiding:!1},' + column + '{accessorKey:"subject",');
        fs.writeFileSync(filePath, code, 'utf8');
        console.log('[成功] ticket-user-column: 已注入用戶 ID 欄位');
    }

    const localesDir = path.join(__dirname, '..', 'locales');
    const labels = {
        'zh-CN': { id: '"id": "工单号",', label: '用户 ID' },
        'en-US': { id: '"id": "Ticket ID",', label: 'User ID' },
        'ru-RU': { id: '"id": "ID тикета",', label: 'ID пользователя' }
    };

    Object.entries(labels).forEach(([locale, { id, label }]) => {
        const localePath = path.join(localesDir, `${locale}.js`);
        let content = fs.readFileSync(localePath, 'utf8');
        if (content.includes('"user_id": "' + label + '"')) {
            console.log(`[略過] ticket-user-column: ${locale} 已有 user_id 翻譯`);
            return;
        }
        if (content.split(id).length !== 2) {
            throw new Error(`ticket-user-column: ${locale} 找不到唯一的工單 id 錨點`);
        }
        content = content.replace(id, id + `\n      "user_id": "${label}",`);
        fs.writeFileSync(localePath, content, 'utf8');
        console.log(`[成功] ticket-user-column: 已注入 ${locale} 翻譯`);
    });
};
