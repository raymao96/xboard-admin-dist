const fs = require('fs');
const path = require('path');

module.exports = function() {
    const root = path.join(__dirname, '..');
    const assetsDir = path.join(root, 'assets');
    const jsFile = fs.readdirSync(assetsDir).find(f => f.startsWith('index-') && f.endsWith('.js'));
    if (!jsFile) throw new Error('table-layout-adjustments: 找不到主程式 bundle');
    const filePath = path.join(assetsDir, jsFile);
    let code = fs.readFileSync(filePath, 'utf8');
    let changed = false;

    const replacements = [
        {
            name: '用戶管理 ID 置中',
            anchor: '{accessorKey:"id",header:({column:e})=>Q.jsx(eQt,{column:e,title:r("columns.id")}),cell:({row:e})=>Q.jsx(nKt,{variant:"outline",children:e.original.id}),enableSorting:!0,enableHiding:!1}',
            expected: '{accessorKey:"id",meta:{align:"center",centerSortGroup:!0},header:({column:e})=>Q.jsx(eQt,{column:e,title:r("columns.id")}),cell:({row:e})=>Q.jsx(nKt,{variant:"outline",children:e.original.id}),enableSorting:!0,enableHiding:!1}'
        },
        {
            name: '用戶管理已用流量加寬',
            anchor: 'Q.jsx(Xot,{className:"w-full",children:Q.jsxs("div",{className:"w-full space-y-1",children:[Q.jsxs("div",{className:"flex justify-between text-sm",children:[Q.jsx("span",{className:"text-muted-foreground",children:t}),Q.jsxs("span",{className:"text-xs text-muted-foreground",children:[i.toFixed(1),"%"]})]})',
            previous: 'Q.jsx(Xot,{className:"w-full",style:{minWidth:"145px"},children:Q.jsxs("div",{className:"w-full space-y-1",children:[Q.jsxs("div",{className:"flex justify-between gap-2 whitespace-nowrap text-sm tabular-nums",children:[Q.jsx("span",{className:"text-muted-foreground",children:t}),Q.jsxs("span",{className:"text-xs text-muted-foreground",children:[i.toFixed(1),"%"]})]})',
            expected: 'Q.jsx(Xot,{className:"w-full",style:{minWidth:"165px",paddingRight:"20px"},children:Q.jsxs("div",{className:"w-full space-y-1",children:[Q.jsxs("div",{className:"flex justify-between gap-2 whitespace-nowrap text-sm tabular-nums",children:[Q.jsx("span",{className:"text-muted-foreground",children:t}),Q.jsxs("span",{className:"text-xs text-muted-foreground",children:[i.toFixed(1),"%"]})]})'
        },
        {
            name: '用戶管理總流量靠右對齊表頭純文字',
            anchor: '{accessorKey:"transfer_enable",header:({column:e})=>Q.jsx(eQt,{column:e,title:r("columns.total_traffic")}),cell:({row:e})=>Q.jsx("div",{className:"font-medium text-muted-foreground",children:RS(e.original?.transfer_enable)})}',
            previous: [
                '{accessorKey:"transfer_enable",meta:{align:"center",centerSortGroup:!0},header:({column:e})=>Q.jsx(eQt,{column:e,title:r("columns.total_traffic")}),cell:({row:e})=>Q.jsx("div",{className:"mx-auto w-20 text-right whitespace-nowrap tabular-nums font-medium text-muted-foreground",children:RS(e.original?.transfer_enable)})}',
                '{accessorKey:"transfer_enable",meta:{align:"center",centerSortGroup:!0},header:({column:e})=>Q.jsx(eQt,{column:e,title:r("columns.total_traffic")}),cell:({row:e})=>Q.jsxs("div",{className:"flex items-center gap-2",children:[Q.jsx("div",{className:"flex justify-end whitespace-nowrap tabular-nums font-medium text-muted-foreground",style:{width:"3em"},children:RS(e.original?.transfer_enable)}),Q.jsx("span",{className:"w-4 shrink-0","aria-hidden":!0})]})}'
            ],
            expected: '{accessorKey:"transfer_enable",meta:{align:"center",centerSortGroup:!0},header:({column:e})=>Q.jsx("div",{style:{paddingInline:"8px"},children:Q.jsx(eQt,{column:e,title:r("columns.total_traffic")})}),cell:({row:e})=>Q.jsxs("div",{className:"flex items-center gap-2",style:{paddingInline:"8px"},children:[Q.jsx("div",{className:"flex justify-end whitespace-nowrap tabular-nums font-medium text-muted-foreground",style:{width:"3em"},children:RS(e.original?.transfer_enable)}),Q.jsx("span",{className:"w-4 shrink-0","aria-hidden":!0})]})}'
        },
        {
            name: '節點管理顯隱收緊',
            anchor: 'cell:({row:t})=>Q.jsx(F5t,{node:t.original,refetch:e}),size:50,enableSorting:!1}',
            expected: 'cell:({row:t})=>Q.jsx("div",{style:{width:"44px"},children:Q.jsx(F5t,{node:t.original,refetch:e})}),size:48,enableSorting:!1}'
        },
        {
            name: '節點管理節點欄加寬',
            anchor: 'cell:({row:e})=>Q.jsx(U5t,{node:e.original,t:t}),enableSorting:!1,size:260}',
            expected: 'cell:({row:e})=>Q.jsx("div",{style:{minWidth:"190px"},children:Q.jsx(U5t,{node:e.original,t:t})}),enableSorting:!1,size:260}'
        },
        {
            name: '節點管理部署方式加寬',
            anchor: 'return Q.jsx("div",{className:"flex items-center gap-1.5 px-1",children:Q.jsx(G5t,{node:e.original,machine:i,t:t})})',
            expected: 'return Q.jsx("div",{className:"flex items-center gap-1.5 px-1",style:{minWidth:"150px"},children:Q.jsx(G5t,{node:e.original,machine:i,t:t})})'
        },
        {
            name: '節點管理地址欄上限寬度',
            anchor: 'cell:({row:e})=>Q.jsx($5t,{node:e.original,t:t}),enableSorting:!1,enableHiding:!0}',
            expected: 'cell:({row:e})=>Q.jsx("div",{className:"max-w-[200px]",children:Q.jsx($5t,{node:e.original,t:t})}),enableSorting:!1,enableHiding:!0}'
        },
        {
            name: '節點管理倍率不折行',
            anchor: 'cell:({row:e})=>Q.jsxs(nKt,{variant:"secondary",className:"font-medium",children:[e.getValue("rate")," x"]}),size:80',
            expected: 'cell:({row:e})=>Q.jsxs(nKt,{variant:"secondary",className:"whitespace-nowrap font-medium",children:[e.getValue("rate")," x"]}),size:84'
        },
        {
            name: '節點管理權限組加寬至容納三標籤',
            anchor: 'return Q.jsxs("div",{className:"flex flex-wrap gap-1.5",children:[n.map((e,t)=>Q.jsx(nKt,{variant:"secondary",className:Im("px-2 py-0.5 font-medium","bg-secondary/50 hover:bg-secondary/70"',
            expected: 'return Q.jsxs("div",{className:"flex flex-wrap gap-1.5",style:{minWidth:"144px"},children:[n.map((e,t)=>Q.jsx(nKt,{variant:"secondary",className:Im("px-2 py-0.5 font-medium","bg-secondary/50 hover:bg-secondary/70"'
        },
        {
            name: '支付配置通知地址移除 260px 截斷限制',
            anchor: 'cell:({row:e})=>Q.jsxs("div",{className:"group/url flex items-center gap-1",children:[Q.jsx("span",{className:"max-w-[260px] truncate font-medium",children:e.getValue("notify_url")})',
            expected: 'cell:({row:e})=>Q.jsxs("div",{className:"group/url flex min-w-0 items-center gap-1",children:[Q.jsx("span",{className:"min-w-0 truncate font-medium",title:e.getValue("notify_url"),children:e.getValue("notify_url")})'
        }
    ];

    for (const item of replacements) {
        if (code.includes(item.expected)) {
            continue;
        }
        const previousList = Array.isArray(item.previous)
            ? item.previous
            : item.previous
                ? [item.previous]
                : [];
        const source = previousList.find(prev => code.includes(prev)) || item.anchor;
        if (code.split(source).length !== 2) {
            throw new Error(`table-layout-adjustments: 找不到唯一錨點 (${item.name})`);
        }
        code = code.replace(source, item.expected);
        changed = true;
    }

    if (changed) {
        fs.writeFileSync(filePath, code, 'utf8');
        console.log('[成功] table-layout-adjustments: 已套用表格欄寬與對齊調整');
    } else {
        console.log('[略過] table-layout-adjustments: 已經注入過');
    }

    const manifestPath = path.join(root, 'manifest.json');
    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
    const entry = manifest['index.html'];
    if (entry && entry.file) {
        const assetPath = entry.file.split('?')[0];
        const query = entry.file.includes('?') ? entry.file.split('?')[1] : '';
        const params = new URLSearchParams(query);
        if (params.get('table-layout') !== '3') {
            params.set('table-layout', '3');
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
