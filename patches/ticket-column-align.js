const fs = require('fs');
const path = require('path');

module.exports = function() {
    const assetsDir = path.join(__dirname, '..', 'assets');
    const jsFile = fs.readdirSync(assetsDir).find(f => f.startsWith('index-') && f.endsWith('.js'));
    const filePath = path.join(assetsDir, jsFile);
    let code = fs.readFileSync(filePath, 'utf8');

    const idApplied = 'className:"pl-2",children:Q.jsx(nKt,{variant:"outline",children:e.getValue("id")})';
    const idAnchor = 'cell:({row:e})=>Q.jsx(nKt,{variant:"outline",children:e.getValue("id")}),enableSorting:!1,enableHiding:!1}';
    const idReplace = 'cell:({row:e})=>Q.jsx("div",{className:"pl-2",children:Q.jsx(nKt,{variant:"outline",children:e.getValue("id")})}),enableSorting:!1,enableHiding:!1}';

    const userApplied = 'className:"pl-2 font-mono text-sm",children:e.original.user_id';
    const userAnchor = 'className:"font-mono text-sm",children:e.original.user_id';

    if (code.includes(idApplied)) {
        console.log('[略過] ticket-column-align: 工單號已對齊');
    } else {
        if (code.split(idAnchor).length !== 2) {
            throw new Error('ticket-column-align: 找不到唯一的工單號欄位錨點');
        }
        code = code.replace(idAnchor, idReplace);
        console.log('[成功] ticket-column-align: 已對齊工單號');
    }

    if (code.includes(userApplied)) {
        console.log('[略過] ticket-column-align: 用戶 ID 已對齊');
    } else if (!code.includes('id:"user_id"')) {
        console.log('[略過] ticket-column-align: 尚無用戶 ID 欄位，待 ticket-user-column 注入後會直接帶上對齊樣式');
    } else {
        if (code.split(userAnchor).length !== 2) {
            throw new Error('ticket-column-align: 找不到唯一的用戶 ID 欄位錨點');
        }
        code = code.replace(userAnchor, userApplied);
        console.log('[成功] ticket-column-align: 已對齊用戶 ID');
    }

    fs.writeFileSync(filePath, code, 'utf8');
};
