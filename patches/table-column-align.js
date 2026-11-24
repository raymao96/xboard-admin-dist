const fs = require('fs');
const path = require('path');

module.exports = function() {
    const root = path.join(__dirname, '..');
    const manifestPath = path.join(root, 'manifest.json');
    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
    const entry = manifest['index.html'];
    const [asset, query] = entry.file.split('?');
    if (!/^assets\/index-[^/]+\.js$/.test(asset)) {
        throw new Error('table-column-align: 入口路徑不符合預期');
    }
    const filePath = path.join(root, asset);
    const original = fs.readFileSync(filePath, 'utf8');
    let code = original;
    const sortChildren = 'onClick:()=>e.toggleSorting("asc"===e.getIsSorted()),children:[';
    const sortLabel = 'Q.jsx("span",{children:t})';
    const sortSpacer = 'Q.jsx("span",{className:"w-4 shrink-0","aria-hidden":!0})';
    const expiryHeader = 'header:({column:e})=>Q.jsx(eQt,{column:e,title:r("columns.expire_time")})';

    const replacements = [
        ['h-11 bg-card px-4 text-muted-foreground', 'h-11 bg-card px-2 text-muted-foreground'],
        ['-ml-3 flex h-8 items-center gap-2 text-nowrap font-medium hover:bg-muted/60', 'flex h-8 items-center gap-2 px-0 text-nowrap font-medium hover:bg-muted/60'],
        // The order number uses a button with its own horizontal padding.
        ['{column:e,title:t("table.columns.tradeNo")}', '{column:e,title:t("table.columns.tradeNo"),className:"pl-2"}'],
        ['className:Im("bg-card",(t||n)&&["sticky z-20"', 'className:Im("bg-card",e.column.columnDef.meta?.align==="center"&&"text-center",(t||n)&&["sticky z-20"'],
        ['{accessorKey:"type",header:({column:e})=>Q.jsx(eQt,{column:e,title:t("table.columns.type")}),cell:({row:e})=>{const n=e.getValue("type"),i=null!=n?w6t', '{accessorKey:"type",meta:{align:"center"},header:({column:e})=>Q.jsx(eQt,{column:e,title:t("table.columns.type"),className:"justify-center"}),cell:({row:e})=>{const n=e.getValue("type"),i=null!=n?w6t'],
        ['{accessorKey:"period",header:({column:e})=>Q.jsx(eQt,{column:e,title:t("table.columns.period")})', '{accessorKey:"period",meta:{align:"center"},header:({column:e})=>Q.jsx(eQt,{column:e,title:t("table.columns.period"),className:"justify-center"})'],
        ['function eQt({column:e,title:t,tooltip:n,className:i}){return e.getCanSort()?Q.jsx("div",{className:"flex items-center gap-1"', 'function eQt({column:e,title:t,tooltip:n,className:i}){const centered=e.columnDef.meta?.align==="center";return e.getCanSort()?Q.jsx("div",{className:Im("flex items-center gap-1",centered&&"justify-center")'],
        ['className:Im("flex items-center space-x-1 text-nowrap py-2 font-medium text-muted-foreground",i)', 'className:Im("flex items-center space-x-1 text-nowrap py-2 font-medium text-muted-foreground",centered&&"justify-center",i)'],
        // Keep label-only centering for columns that do not center the entire sort control.
        [
            sortChildren + sortLabel,
            `${sortChildren}centered&&!e.columnDef.meta?.centerSortGroup&&${sortSpacer},${sortLabel}`,
            `${sortChildren}centered&&${sortSpacer},${sortLabel}`,
        ],
        ['children:kGt(e.column.columnDef.cell,e.getContext())},e.id)})},e.id))', 'children:e.column.columnDef.meta?.align==="center"?Q.jsx("div",{className:"flex justify-center",children:kGt(e.column.columnDef.cell,e.getContext())}):kGt(e.column.columnDef.cell,e.getContext())},e.id)})},e.id))'],
        ['{accessorKey:"banned",header:({column:e})=>Q.jsx(eQt,{column:e,title:r("columns.status")})', '{accessorKey:"banned",meta:{align:"center"},header:({column:e})=>Q.jsx(eQt,{column:e,title:r("columns.status")})'],
        [
            `{accessorKey:"expired_at",${expiryHeader}`,
            `{accessorKey:"expired_at",meta:{align:"center",centerSortGroup:!0},${expiryHeader}`,
            `{accessorKey:"expired_at",meta:{align:"center"},${expiryHeader}`,
        ],
        ['className:Im("w-full justify-center transition-colors",i?"border-destructive/50 bg-destructive/10 text-destructive":t?', 'className:Im("w-full justify-center whitespace-nowrap transition-colors",i?"border-destructive/50 bg-destructive/10 text-destructive":t?'],
        // Match the amount cell's currency prefix and gap without displaying them in the header.
        ...[['balance', 'balance'], ['commission_balance', 'commission']].map(([field, label]) => {
            const header = `{accessorKey:"${field}",header:({column:e})=>`;
            const title = `Q.jsx(eQt,{column:e,title:r("columns.${label}")})`;
            return [
                header + title,
                `${header}Q.jsxs("div",{className:"flex items-center gap-1 font-medium",children:[Q.jsx("span",{className:"invisible text-sm","aria-hidden":!0,children:"¥"}),${title}]})`,
            ];
        }),
        ['{accessorKey:"level",header:({column:e})=>Q.jsx(eQt,{column:e,title:t("columns.level")})', '{accessorKey:"level",meta:{align:"center"},header:({column:e})=>Q.jsx(eQt,{column:e,title:t("columns.level")})'],
        ['{accessorKey:"type",header:({column:e})=>Q.jsx(eQt,{column:e,title:t("table.columns.type")}),cell:({row:e})=>Q.jsx(nKt,', '{accessorKey:"type",meta:{align:"center"},header:({column:e})=>Q.jsx(eQt,{column:e,title:t("table.columns.type")}),cell:({row:e})=>Q.jsx(nKt,'],
        ['Q.jsx("span",{children:e.original.name})}),enableSorting:!1,size:800', 'Q.jsx("span",{className:"min-w-[8rem]",children:e.original.name})}),enableSorting:!1,size:800'],
        ['Q.jsx(nKt,{variant:"outline",children:t(`table.toolbar.types.${e.original.type}`)})', 'Q.jsx(nKt,{variant:"outline",className:"whitespace-nowrap",children:t(`table.toolbar.types.${e.original.type}`)})'],
        ['Q.jsx(nKt,{variant:"secondary",children:e.original.code}),enableSorting:!0},{accessorKey:"limit_use"', 'Q.jsx(nKt,{variant:"secondary",className:"whitespace-nowrap",children:e.original.code}),enableSorting:!0},{accessorKey:"limit_use"'],
        ['{accessorKey:"type",header:({column:e})=>Q.jsx(eQt,{column:e,title:t("template.table.columns.type")})', '{accessorKey:"type",meta:{align:"center"},header:({column:e})=>Q.jsx(eQt,{column:e,title:t("template.table.columns.type")})'],
        ['{accessorKey:"status",header:({column:e})=>Q.jsx(eQt,{column:e,title:t("columns.status")}),cell:({row:e})=>{const n=e.getValue("status"),i=e.original.reply_status', '{accessorKey:"status",meta:{align:"center"},header:({column:e})=>Q.jsx(eQt,{column:e,title:t("columns.status")}),cell:({row:e})=>{const n=e.getValue("status"),i=e.original.reply_status'],
        // Status labels and their icons must stay together beside the actions menu.
        ...['i', 's'].map(status => [
            `className:"flex items-center gap-2",children:[${status}.icon&&Q.jsx(${status}.icon,`,
            `className:"flex shrink-0 items-center gap-2 whitespace-nowrap",children:[${status}.icon&&Q.jsx(${status}.icon,`,
        ]),
        ...['i.value===Z$t.PENDING', 's.value===J$t.PENDING&&i===Z$t.COMPLETED'].map(condition => {
            const menu = `${condition}&&Q.jsxs(Vst,{modal:!0,children:[Q.jsx(Wst,{asChild:!0,children:Q.jsxs(xtt,{variant:"ghost",size:"sm",className:"`;
            return [`${menu}h-8 w-8 p-0`, `${menu}h-8 w-8 shrink-0 p-0`];
        }),
        // Leave one break opportunity between the formatted date and time.
        ['})]})})})]})}function eQt(', '})]})})})]})}function TicketTableTimestamp({value:e}){const[t,n]=SS(e).split(" ");return n?Q.jsxs(Q.Fragment,{children:[Q.jsx("span",{className:"inline-block whitespace-nowrap",children:t})," ",Q.jsx("span",{className:"inline-block whitespace-nowrap",children:n})]}):t}function eQt('],
        [
            'Q.jsxs("div",{className:"flex items-center space-x-2 text-muted-foreground",children:[Q.jsx(J8t,{className:"h-4 w-4"}),Q.jsx("span",{className:"text-sm",children:SS(e.getValue("updated_at"))})]})',
            'Q.jsx("div",{className:"text-sm text-muted-foreground",children:Q.jsx(TicketTableTimestamp,{value:e.getValue("updated_at")})})',
            'Q.jsxs("div",{className:"flex items-center space-x-2 text-muted-foreground",children:[Q.jsx(J8t,{className:"h-4 w-4 shrink-0"}),Q.jsx("span",{className:"text-sm",children:Q.jsx(TicketTableTimestamp,{value:e.getValue("updated_at")})})]})',
        ],
        ['children:SS(e.getValue("created_at"))}),enableSorting:!0,meta:{isFlexGrow:!0}', 'children:Q.jsx(TicketTableTimestamp,{value:e.getValue("created_at")})}),enableSorting:!0,meta:{isFlexGrow:!0}'],
    ];

    for (const [anchor, replacement, previous] of replacements) {
        const originalCount = code.split(anchor).length - 1;
        const previousCount = previous ? code.split(previous).length - 1 : 0;
        const before = originalCount + previousCount;
        const after = code.split(replacement).length - 1;
        if (before === 0 && after === 1) continue;
        if (before !== 1 || after !== 0) {
            throw new Error(`table-column-align: 找不到唯一的表格錨點 ${anchor}`);
        }
        code = code.replace(previousCount ? previous : anchor, replacement);
    }

    const indexPath = path.join(root, 'index.html');
    const html = fs.readFileSync(indexPath, 'utf8');
    const script = `src="./${entry.file}"`;
    if (html.split(script).length !== 2) {
        throw new Error('table-column-align: 找不到與 manifest 一致的唯一 HTML 入口');
    }

    const previousAsset = entry.file;
    const params = new URLSearchParams(query);
    params.set('table-column-align', '10');
    entry.file = `${asset}?${params.toString()}`;

    if (code !== original) fs.writeFileSync(filePath, code, 'utf8');
    if (entry.file !== previousAsset) {
        fs.writeFileSync(indexPath, html.replace(script, `src="./${entry.file}"`), 'utf8');
        fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + '\n', 'utf8');
    }
};

if (require.main === module) module.exports();
