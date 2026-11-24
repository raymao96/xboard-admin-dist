const fs = require('fs');
const path = require('path');

module.exports = function() {
    const assetsDir = path.join(__dirname, '..', 'assets');
    const jsFile = fs.readdirSync(assetsDir).find(f => f.startsWith('index-') && f.endsWith('.js'));
    const filePath = path.join(assetsDir, jsFile);
    let code = fs.readFileSync(filePath, 'utf8');

    const oldColumn = '{id:"user_remarks",header:({column:e})=>Q.jsx(eQt,{column:e,title:t("table.columns.userRemarks")}),cell:({row:e})=>{const n=e.original.user?.remarks;return n?Q.jsx("span",{className:"block max-w-32 truncate text-sm sm:max-w-44",title:n,children:n}):Q.jsx("span",{className:"text-muted-foreground",children:"-"})},enableSorting:!1},';
    const column = '{id:"user_remarks",accessorFn:e=>e.user?.remarks||"__EMPTY__",header:({column:e})=>Q.jsx(eQt,{column:e,title:t("table.columns.userRemarks")}),cell:({row:e})=>{const n=e.original.user?.remarks;return n?Q.jsx("span",{className:"block max-w-32 truncate text-sm sm:max-w-44",title:n,children:n}):Q.jsx("span",{className:"text-muted-foreground",children:"-"})},enableSorting:!1},';
    const anchor = 'enableSorting:!0,enableHiding:!1},{accessorKey:"commission_balance",header:({column:e})=>Q.jsx(eQt,{column:e,title:t("table.columns.commission")})';
    const expected = 'enableSorting:!0,enableHiding:!1},' + column + '{accessorKey:"commission_balance",header:({column:e})=>Q.jsx(eQt,{column:e,title:t("table.columns.commission")})';

    if (code.includes(expected)) {
        console.log('[略過] order-user-remarks: 已經注入過');
    } else {
        if (code.includes(oldColumn)) {
            code = code.replace(oldColumn, '');
        }
        if (code.includes(column)) {
            code = code.replace(column, '');
        }
        if (code.split(anchor).length !== 2) {
            throw new Error('order-user-remarks: 找不到唯一的訂單狀態欄位錨點，可能原作者更新了結構');
        }
        code = code.replace(anchor, expected);
        fs.writeFileSync(filePath, code, 'utf8');
        console.log('[成功] order-user-remarks: 已注入備註欄位至訂單狀態後面');
    }

    const localesDir = path.join(__dirname, '..', 'locales');
    const labels = {
        'zh-CN': { anchor: '"tradeNo": "订单号",', label: '备注' },
        'en-US': { anchor: '"tradeNo": "Order No.",', label: 'Remarks' },
        'ru-RU': { anchor: '"tradeNo": "№ Заказа",', label: 'Примечание' }
    };

    Object.entries(labels).forEach(([locale, { anchor, label }]) => {
        const localePath = path.join(localesDir, `${locale}.js`);
        let content = fs.readFileSync(localePath, 'utf8');
        if (content.includes('"userRemarks": "' + label + '"')) {
            console.log(`[略過] order-user-remarks: ${locale} 已有 userRemarks 翻譯`);
            return;
        }
        if (/"userRemarks":\s*"[^"]*"/.test(content)) {
            content = content.replace(/"userRemarks":\s*"[^"]*"/, `"userRemarks": "${label}"`);
            fs.writeFileSync(localePath, content, 'utf8');
            console.log(`[成功] order-user-remarks: 已更新 ${locale} 翻譯`);
            return;
        }
        if (content.split(anchor).length !== 2) {
            throw new Error(`order-user-remarks: ${locale} 找不到唯一的訂單 tradeNo 錨點`);
        }
        content = content.replace(anchor, anchor + `\n        "userRemarks": "${label}",`);
        fs.writeFileSync(localePath, content, 'utf8');
        console.log(`[成功] order-user-remarks: 已注入 ${locale} 翻譯`);
    });
};

if (require.main === module) module.exports();
