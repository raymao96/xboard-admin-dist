const fs = require('fs');
const path = require('path');

function replaceOnce(code, from, to, label) {
    if (code.split(from).length !== 2) {
        throw new Error(`ticket-user-dialog: 找不到唯一錨點: ${label}`);
    }
    return code.replace(from, to);
}

module.exports = function() {
    const assetsDir = path.join(__dirname, '..', 'assets');
    const jsFile = fs.readdirSync(assetsDir).find(f => f.startsWith('index-') && f.endsWith('.js'));
    const filePath = path.join(assetsDir, jsFile);
    let code = fs.readFileSync(filePath, 'utf8');
    let changed = false;

    const nestedOld = 'Q.jsx(b9t,{ticketId:z,open:null!==z,onOpenChange:v=>{v||Z(null)},dialogTrigger:Q.jsx("span",{})})';
    const nestedNew = 'null!==z&&Q.jsx(b9t,{ticketId:z,open:!0,onOpenChange:v=>{v||Z(null)},dialogTrigger:Q.jsx("span",{}),sidebarEmail:e})';

    if (!code.includes('sidebarEmail:xe')) {
        code = replaceOnce(code,
            'function b9t({ticketId:e,dialogTrigger:t,statusFilter:n=aqt.OPENING,open:i,onOpenChange:r}){',
            'function b9t({ticketId:e,dialogTrigger:t,statusFilter:n=aqt.OPENING,open:i,onOpenChange:r,sidebarEmail:xe}){',
            'b9t 參數');
        code = replaceOnce(code,
            'queryKey:["ticketSidebarList",k,n],queryFn:()=>k?bT({filter:[{id:"status",value:[n]}]}):Promise.resolve(null),enabled:k',
            'queryKey:["ticketSidebarList",k,n,xe],queryFn:()=>k?(xe?bT({email:xe,pageSize:100,current:1,filter:[],sort:[]}):bT({filter:[{id:"status",value:[n]}]})):Promise.resolve(null),enabled:k',
            'b9t 側欄查詢');
        changed = true;
    }

    const rowOld = 'className:"flex flex-wrap items-center gap-1.5 md:justify-end"';
    const rowNew = 'className:"flex flex-wrap items-center gap-1.5 md:justify-end pr-10"';
    if (code.includes(rowOld)) {
        code = replaceOnce(code, rowOld, rowNew, '詳情按鈕列');
        changed = true;
    }

    if (code.includes('function ZUT(')) {
        if (code.includes(nestedOld)) {
            code = replaceOnce(code, nestedOld, nestedNew, 'ZUT 巢狀詳情');
            changed = true;
        }
        if (changed) {
            console.log('[成功] ticket-user-dialog: 已更新詳情疊層與側欄資料來源');
        } else {
            console.log('[略過] ticket-user-dialog: 已經注入過');
        }
    } else {
        const fnAnchor = 'function E8t({user_id:e,dialogTrigger:t}){';
        const menuAnchor = 'r("columns.actions_menu.traffic_records")]})})}),';
        const detailAnchor = 'title:s("detail.order_records"),onClick:()=>{O?.user&&o("/finance/order?user_id="+O.user.id)},children:Q.jsx(p9t,{className:"h-4 w-4"})})';
        [fnAnchor, menuAnchor, detailAnchor].forEach(a => replaceOnce(code, a, a, a.slice(0, 40)));

        const dialog = 'function ZUT({email:e,dialogTrigger:t,currentId:u}){const{t:n}=jy(["ticket"]),[i,r]=H.useState(!1),[z,Z]=H.useState(null),{data:a,isLoading:l}=pC({queryKey:["userTickets",e,i],queryFn:()=>i?bT({email:e,pageSize:100,current:1,filter:[],sort:[]}):null}),c=a?.data??[];return Q.jsxs(htt,{open:i,onOpenChange:r,children:[Q.jsx(gtt,{asChild:!0,children:t}),Q.jsxs(ptt,{className:"sm:max-w-[700px]",children:[Q.jsx(mtt,{children:Q.jsx(_tt,{children:n("user:columns.actions_menu.tickets")})}),Q.jsx("div",{className:"rounded-md border"+(utt()?" overflow-y-auto max-h-[60vh]":""),children:Q.jsxs(EGt,{children:[Q.jsx(LGt,{children:Q.jsx(IGt,{children:["columns.id","columns.subject","columns.status","columns.updated_at"].map(k=>Q.jsx(RGt,{className:"h-10 px-2 text-xs",children:n(k)},k))})}),Q.jsx(DGt,{children:l?Q.jsx(IGt,{children:Q.jsx(OGt,{colSpan:4,className:"p-2 text-center text-muted-foreground",children:n("common:loading")})}):c.length?c.map(x=>Q.jsxs(IGt,{children:[Q.jsx(OGt,{className:"p-2",children:x.id}),Q.jsx(OGt,{className:"p-2",children:x.id===u?Q.jsxs("span",{className:"font-medium",children:[x.subject," ",Q.jsx("span",{className:"text-xs text-muted-foreground",children:n("detail.current_ticket")})]}):Q.jsx("button",{type:"button",className:"text-left font-medium hover:underline",onClick:()=>Z(x.id),children:x.subject})}),Q.jsx(OGt,{className:"p-2",children:n("status."+(1===x.status?"closed":1===x.reply_status?"replied":"pending"))}),Q.jsx(OGt,{className:"p-2",children:SS(x.updated_at)})]},x.id)):Q.jsx(IGt,{children:Q.jsx(OGt,{colSpan:4,className:"p-2 text-center text-muted-foreground",children:n("list.no_tickets")})})})]})})]}),' + nestedNew + ']})}';
        code = code.replace(fnAnchor, dialog + fnAnchor);

        const menuItem = 'Q.jsx($st,{onSelect:e=>e.preventDefault(),className:"p-0",children:Q.jsx(ZUT,{email:t.original?.email,dialogTrigger:Q.jsxs(xtt,{variant:"ghost",className:"w-full justify-start px-2 py-1.5",children:[Q.jsx(t9t,{className:"mr-2 h-4 w-4"}),r("columns.actions_menu.tickets")]})})}),';
        code = code.replace(menuAnchor, menuAnchor + menuItem);

        const detailItem = ',Q.jsx(ZUT,{email:O.user.email,currentId:O.id,dialogTrigger:Q.jsx(xtt,{variant:"ghost",size:"icon",className:"h-8 w-8",title:s("detail.user_tickets"),children:Q.jsx(t9t,{className:"h-4 w-4"})})})';
        code = code.replace(detailAnchor, detailAnchor + detailItem);

        console.log('[成功] ticket-user-dialog: 已注入 TA的工單 對話框、選單項目與詳情按鈕');
        changed = true;
    }

    if (changed) {
        fs.writeFileSync(filePath, code, 'utf8');
    }

    const localesDir = path.join(__dirname, '..', 'locales');
    const labels = {
        'zh-CN': { menu: 'TA的工单', detail: 'TA的工单', current: '当前工单' },
        'en-US': { menu: 'Tickets', detail: 'User Tickets', current: 'Current' },
        'ru-RU': { menu: 'Тикеты', detail: 'Тикеты пользователя', current: 'Текущий' }
    };
    Object.entries(labels).forEach(([locale, { menu, detail, current }]) => {
        const localePath = path.join(localesDir, `${locale}.js`);
        let content = fs.readFileSync(localePath, 'utf8');

        const userRe = /^([ \t]*)"traffic_records": "[^"]*",\n/m;
        const userMatch = content.match(userRe);
        if (!userMatch) {
            throw new Error(`ticket-user-dialog: ${locale} 找不到 user.actions_menu.traffic_records 錨點`);
        }
        if (!content.includes('"tickets": "' + menu + '"')) {
            content = content.replace(userRe, userMatch[0] + `${userMatch[1]}"tickets": "${menu}",\n`);
        }

        const detailRe = /^([ \t]*)"order_records": "[^"]*",\n/m;
        const detailMatch = content.match(detailRe);
        if (!detailMatch) {
            throw new Error(`ticket-user-dialog: ${locale} 找不到 ticket.detail.order_records 錨點`);
        }
        if (!content.includes('"user_tickets": "' + detail + '"')) {
            content = content.replace(detailRe, detailMatch[0] + `${detailMatch[1]}"user_tickets": "${detail}",\n`);
        }
        if (!content.includes('"current_ticket": "')) {
            const line = detailRe.exec(content);
            content = content.replace(line[0], line[0] + `${line[1]}"current_ticket": "${current}",\n`);
        }

        const before = fs.readFileSync(localePath, 'utf8');
        if (content === before) {
            console.log(`[略過] ticket-user-dialog: ${locale} 翻譯已存在`);
            return;
        }
        fs.writeFileSync(localePath, content, 'utf8');
        console.log(`[成功] ticket-user-dialog: ${locale} 翻譯已同步`);
    });
};
