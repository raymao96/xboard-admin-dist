const fs = require('fs');
const path = require('path');

module.exports = function() {
    const assetsDir = path.join(__dirname, '..', 'assets');
    const jsFile = fs.readdirSync(assetsDir).find(f => f.startsWith('index-') && f.endsWith('.js'));
    const filePath = path.join(assetsDir, jsFile);
    const original = fs.readFileSync(filePath, 'utf8');
    let code = original;

    // Remove the old per-cell offsets now that the shared table aligns the headers.
    const idWithPadding = 'cell:({row:e})=>Q.jsx("div",{className:"pl-2",children:Q.jsx(nKt,{variant:"outline",children:e.getValue("id")})}),enableSorting:!1,enableHiding:!1}';
    const idWithoutPadding = 'cell:({row:e})=>Q.jsx(nKt,{variant:"outline",children:e.getValue("id")}),enableSorting:!1,enableHiding:!1}';
    const userWithPadding = 'className:"pl-2 font-mono text-sm",children:e.original.user_id';
    const userWithoutPadding = 'className:"font-mono text-sm",children:e.original.user_id';

    for (const [anchor, replacement] of [[idWithPadding, idWithoutPadding], [userWithPadding, userWithoutPadding]]) {
        const count = code.split(anchor).length - 1;
        if (count > 1) throw new Error('ticket-column-align: 找不到唯一的舊版對齊錨點');
        if (count === 1) code = code.replace(anchor, replacement);
    }

    if (code !== original) fs.writeFileSync(filePath, code, 'utf8');
};

if (require.main === module) module.exports();
