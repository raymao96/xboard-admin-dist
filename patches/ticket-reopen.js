const fs = require('fs');
const path = require('path');

function replaceOnce(code, from, to, label) {
    if (code.split(from).length !== 2) {
        throw new Error(`ticket-reopen: 找不到唯一錨點: ${label}`);
    }
    return code.replace(from, to);
}

module.exports = function() {
    const assetsDir = path.join(__dirname, '..', 'assets');
    const jsFile = fs.readdirSync(assetsDir).find(file => /^index-.*\.js$/.test(file));
    if (!jsFile) throw new Error('ticket-reopen: 找不到 index bundle');

    const jsPath = path.join(assetsDir, jsFile);
    let code = fs.readFileSync(jsPath, 'utf8');

    if (code.includes('openAdminTicket=e=>RL(vT+"/ticket/open",{id:e})')) {
        console.log('[略過] ticket-reopen: bundle 已注入');
    } else {
        const rotateMatch = code.match(/([A-Za-z_$][\w$]*)=aat\("RotateCcw"/);
        if (!rotateMatch) throw new Error('ticket-reopen: 找不到 RotateCcw 圖示');
        const rotateIcon = rotateMatch[1];

        code = replaceOnce(
            code,
            'wT=e=>RL(vT+"/ticket/close",{id:e}),CT=',
            'wT=e=>RL(vT+"/ticket/close",{id:e}),openAdminTicket=e=>RL(vT+"/ticket/open",{id:e}),CT=',
            '重開 API'
        );

        const desktopOld = 's?Q.jsx(hQt,{title:t("actions.close_confirm_title"),description:t("actions.close_confirm_description"),confirmText:t("actions.close_confirm_button"),cancelText:t("common:cancel"),variant:"destructive",onConfirm:async()=>{await wT(r.original.id),gE.success(t("actions.close_success")),e(),await Promise.all([n.invalidateQueries({queryKey:["ticketSidebarList"]}),n.invalidateQueries({queryKey:["ticketDetail"]})])},children:Q.jsx(xtt,{variant:"ghost",size:"icon",className:"h-9 w-9",title:t("actions.close_ticket"),children:Q.jsx(e9t,{className:"h-4 w-4"})})}):null';
        const desktopNew = 'r.original.status===aqt.CLOSED?Q.jsx(hQt,{title:t("actions.reopen_confirm_title"),description:t("actions.reopen_confirm_description"),confirmText:t("actions.reopen_confirm_button"),cancelText:t("common:cancel"),onConfirm:async()=>{await openAdminTicket(r.original.id),gE.success(t("actions.reopen_success")),e(),await Promise.all([n.invalidateQueries({queryKey:["ticketSidebarList"]}),n.invalidateQueries({queryKey:["ticketDetail"]})])},children:Q.jsx(xtt,{variant:"ghost",size:"icon",className:"h-9 w-9",title:t("actions.reopen_ticket"),children:Q.jsx(' + rotateIcon + ',{className:"h-4 w-4"})})}):Q.jsx(hQt,{title:t("actions.close_confirm_title"),description:t("actions.close_confirm_description"),confirmText:t("actions.close_confirm_button"),cancelText:t("common:cancel"),variant:"destructive",onConfirm:async()=>{await wT(r.original.id),gE.success(t("actions.close_success")),e(),await Promise.all([n.invalidateQueries({queryKey:["ticketSidebarList"]}),n.invalidateQueries({queryKey:["ticketDetail"]})])},children:Q.jsx(xtt,{variant:"ghost",size:"icon",className:"h-9 w-9",title:t("actions.close_ticket"),children:Q.jsx(e9t,{className:"h-4 w-4"})})})';
        code = replaceOnce(code, desktopOld, desktopNew, '桌面列表操作');

        code = replaceOnce(
            code,
            'V?null:Q.jsx(hQt,{title:s("actions.close_confirm_title")',
            'V?Q.jsx(hQt,{title:s("actions.reopen_confirm_title"),description:s("actions.reopen_confirm_description"),confirmText:s("actions.reopen_confirm_button"),cancelText:s("common:cancel"),onConfirm:async()=>{await openAdminTicket(_),gE.success(s("actions.reopen_success")),await F()},children:Q.jsx(xtt,{variant:"ghost",size:"sm",className:"h-7 gap-1 px-2 text-xs text-muted-foreground",children:s("actions.reopen_ticket")})}):Q.jsx(hQt,{title:s("actions.close_confirm_title")',
            '詳情操作'
        );

        code = replaceOnce(
            code,
            'return i.status===aqt.CLOSED?null:Q.jsx(hQt,{title:e("actions.close_confirm_title")',
            'return i.status===aqt.CLOSED?Q.jsx(hQt,{title:e("actions.reopen_confirm_title"),description:e("actions.reopen_confirm_description"),confirmText:e("actions.reopen_confirm_button"),cancelText:e("common:cancel"),onConfirm:async()=>{await openAdminTicket(i.id),gE.success(e("actions.reopen_success")),await Promise.all([v(),t.invalidateQueries({queryKey:["ticketSidebarList"]}),t.invalidateQueries({queryKey:["ticketDetail"]})])},children:Q.jsx(xtt,{variant:"ghost",size:"icon",className:"h-8 w-8",title:e("actions.reopen_ticket"),onClick:e=>e.stopPropagation(),children:Q.jsx(' + rotateIcon + ',{className:"h-4 w-4 text-muted-foreground"})})}):Q.jsx(hQt,{title:e("actions.close_confirm_title")',
            '手機列表操作'
        );

        fs.writeFileSync(jsPath, code, 'utf8');
        console.log('[成功] ticket-reopen: 已注入 bundle');
    }

    const labels = {
        'zh-CN': ['重新开启', '确认重新开启工单', '确定要重新开启这个工单吗？', '确认重新开启', '工单已重新开启'],
        'en-US': ['Reopen', 'Confirm Reopen Ticket', 'Are you sure you want to reopen this ticket?', 'Confirm Reopen', 'Ticket reopened successfully'],
        'ru-RU': ['Открыть тикет повторно', 'Подтвердите повторное открытие тикета', 'Вы уверены, что хотите открыть этот тикет повторно?', 'Открыть повторно', 'Тикет успешно открыт повторно']
    };

    for (const [locale, [action, title, description, confirm, success]] of Object.entries(labels)) {
        const localePath = path.join(__dirname, '..', 'locales', `${locale}.js`);
        let content = fs.readFileSync(localePath, 'utf8');
        if (content.includes(`"reopen_ticket": "${action}"`)) {
            console.log(`[略過] ticket-reopen: ${locale} 翻譯已注入`);
            continue;
        }
        const anchor = /^([ \t]*)"close_success": "[^"]*",\n/gm;
        const matches = [...content.matchAll(anchor)];
        const match = matches[0];
        if (matches.length !== 1) {
            throw new Error(`ticket-reopen: ${locale} 找不到唯一 close_success 錨點`);
        }
        const insertion = `${match[0]}${match[1]}"reopen_ticket": "${action}",\n${match[1]}"reopen_confirm_title": "${title}",\n${match[1]}"reopen_confirm_description": "${description}",\n${match[1]}"reopen_confirm_button": "${confirm}",\n${match[1]}"reopen_success": "${success}",\n`;
        content = content.replace(anchor, insertion);
        fs.writeFileSync(localePath, content, 'utf8');
        console.log(`[成功] ticket-reopen: 已注入 ${locale} 翻譯`);
    }
};

if (require.main === module) module.exports();
