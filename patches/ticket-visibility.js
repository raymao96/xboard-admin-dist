const fs = require('fs');
const path = require('path');

function replaceOnce(code, from, to, label) {
    if (code.split(from).length !== 2) throw new Error(`ticket-visibility: 找不到唯一錨點: ${label}`);
    return code.replace(from, to);
}

module.exports = function () {
    const root = path.join(__dirname, '..');
    const bundle = fs.readdirSync(path.join(root, 'assets')).find(f => /^index-.*\.js$/.test(f));
    if (!bundle) throw new Error('ticket-visibility: 找不到 bundle');
    const file = path.join(root, 'assets', bundle);
    let code = fs.readFileSync(file, 'utf8');
    if (!code.includes('function TicketVisibilityControl(')) {
        const control = function TicketVisibilityControl({ticket: ticket}) {
            const {t: t} = jy(['ticket', 'common']);
            const cache = lC();
            const [busy, setBusy] = H.useState(false);
            const hidden = Boolean(ticket.is_hidden);
            const action = hidden ? 'restore' : 'hide';
            return Q.jsxs('div', {style: {display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 6, maxWidth: '100%'}, children: [
                hidden ? Q.jsx('span', {className: 'text-xs text-muted-foreground', children: t('visibility.hidden_badge')}) : null,
                Q.jsx(hQt, {
                    title: t('visibility.' + action + '_title'),
                    description: t('visibility.' + action + '_description'),
                    confirmText: t('visibility.' + action + '_confirm'),
                    cancelText: t('common:cancel'),
                    variant: hidden ? 'default' : 'destructive',
                    onConfirm: async () => {
                        if (busy) return;
                        setBusy(true);
                        try {
                            const result = await RL(vT + '/ticket/visibility', {user_id: ticket.user.id, hidden: !hidden});
                            if (result?.status === 'fail' || result?.data === false) throw new Error('visibility failed');
                            gE.success(t('visibility.' + action + '_success'));
                            await cache.invalidateQueries();
                        } catch (error) {
                            gE.error(t('visibility.' + action + '_error'));
                        } finally { setBusy(false); }
                    },
                    children: Q.jsx(xtt, {variant: 'outline', size: 'sm', disabled: busy,
                        style: {maxWidth: '100%', whiteSpace: 'normal', height: 'auto', minHeight: 32},
                        children: t('visibility.' + action + '_action')})
                })
            ]});
        }.toString();
        code = replaceOnce(code, 'function ZUT(', control + 'function ZUT(', '控制元件');
        code = replaceOnce(code,
            'function b9t({ticketId:e,dialogTrigger:t,statusFilter:n=aqt.OPENING,open:i,onOpenChange:r,sidebarEmail:xe}){',
            'function b9t({ticketId:e,dialogTrigger:t,statusFilter:n=aqt.OPENING,open:i,onOpenChange:r,sidebarEmail:xe,ticketVisibility:hv="normal"}){', '詳情參數');
        code = replaceOnce(code,
            'queryKey:["ticketSidebarList",k,n,xe],queryFn:()=>k?(xe?bT({email:xe,pageSize:100,current:1,filter:[],sort:[]}):bT({filter:[{id:"status",value:[n]}]})):Promise.resolve(null),enabled:k',
            'queryKey:["ticketSidebarList",k,n,xe,hv],queryFn:()=>k?(xe?bT({visibility:"all",email:xe,pageSize:100,current:1,filter:[],sort:[]}):bT({visibility:hv,filter:[{id:"status",value:[n]}]})):Promise.resolve(null),enabled:k', '詳情側欄分流');
        code = replaceOnce(code,
            'queryFn:()=>i?bT({email:e,pageSize:100,current:1,filter:[],sort:[]}):null',
            'queryFn:()=>i?bT({visibility:"all",email:e,pageSize:100,current:1,filter:[],sort:[]}):null', 'TA 的全部工單');
        code = replaceOnce(code,
            'title:s("detail.user_tickets"),children:Q.jsx(t9t,{className:"h-4 w-4"})})})',
            'title:s("detail.user_tickets"),children:Q.jsx(t9t,{className:"h-4 w-4"})})}),Q.jsx(TicketVisibilityControl,{ticket:O})', '詳情操作按鈕');
        // Keep room for the desktop X; cap the desktop action group so long labels wrap.
        code = replaceOnce(code,
            'className:"flex flex-wrap items-center gap-1.5 md:justify-end pr-10",children:',
            'className:"flex flex-wrap items-center gap-1.5 md:justify-end pr-10",style:{maxWidth:"100%",flexShrink:0},children:', '按鈕空間');
        // Ticket title and actions occupy separate rows; X has its own reserved right gutter.
        code = replaceOnce(code,
            'className:"flex flex-col gap-3 md:flex-row md:items-start md:justify-between md:gap-4",children:',
            'className:"flex flex-col gap-3",children:', '詳情換行');
        code = replaceOnce(code,
            'function y9t(){const{t:e}=jy(["ticket","common"]),t=lC(),',
            'function y9t(){const{t:e}=jy(["ticket","common"]),t=lC(),[hv,setHv]=H.useState("normal"),', '分區狀態');
        code = replaceOnce(code,
            'queryKey:["ticketList",d,o,l],queryFn:()=>bT({pageSize:d.pageSize,current:d.pageIndex+1,filter:o,sort:l})',
            'queryKey:["ticketList",d,o,l,hv],queryFn:()=>bT({visibility:hv,pageSize:d.pageSize,current:d.pageIndex+1,filter:o,sort:l})', '列表分流');
        const tabs = `Q.jsxs("div",{style:{display:"flex",flexWrap:"wrap",gap:8},children:["normal","hidden"].map(mode=>Q.jsx(xtt,{variant:hv===mode?"default":"outline",size:"sm","aria-pressed":hv===mode,onClick:()=>{setHv(mode);u(current=>({...current,pageIndex:0}));i({})},children:e("visibility."+mode+"_tab")},mode))}),Q.jsx("p",{className:"text-sm text-muted-foreground",children:e(hv==="hidden"?"visibility.description":"visibility.normal_description")}),hv==="hidden"&&!y&&b?.total===0?Q.jsx("p",{className:"text-sm text-muted-foreground",children:e("visibility.empty")}):null,`;
        code = replaceOnce(code,
            'className:"space-y-4",children:[Q.jsx(Q8t,{table:w,refetch:v})',
            'className:"space-y-4",children:[' + tabs + 'Q.jsx(Q8t,{table:w,refetch:v})', '分區入口');
        code = replaceOnce(code,
            'Q.jsx(b9t,{ticketId:h,statusFilter:p,open:f,onOpenChange:_,dialogTrigger:null})',
            'Q.jsx(b9t,{ticketId:h,statusFilter:p,open:f,onOpenChange:_,dialogTrigger:null,ticketVisibility:hv})', '傳入分區');
        // BGt already renders right-pinned actions. The extra slot duplicates close/reopen on mobile.
        const start = code.indexOf(',mobileActionSlot:n=>{const i=n.original;');
        const end = code.indexOf('}}),null!=h?Q.jsx(b9t,', start);
        if (start < 0 || end < start || code.indexOf(',mobileActionSlot:n=>{const i=n.original;', start + 1) >= 0)
            throw new Error('ticket-visibility: 找不到唯一手機操作錨點');
        code = code.slice(0, start) + code.slice(end + 1);
        // Validate syntax before writing the bundle.
        const check = require('child_process').spawnSync(process.execPath, ['--check', '--input-type=module'], {input: code, encoding: 'utf8'});
        if (check.status !== 0) throw new Error(check.stderr || 'ticket-visibility: bundle 語法錯誤');
        fs.writeFileSync(file, code);
        console.log('[成功] ticket-visibility: 分流與手機重複操作已注入');
    } else {
        console.log('[略過] ticket-visibility: bundle 已注入');
    }

    const oldDescription = 'hv===\"hidden\"?Q.jsx(\"p\",{className:\"text-sm text-muted-foreground\",children:e(\"visibility.description\")}):null,';
    if (code.includes(oldDescription)) {
        code = replaceOnce(code, oldDescription,
            'Q.jsx("p",{className:"text-sm text-muted-foreground",children:e(hv==="hidden"?"visibility.description":"visibility.normal_description")}),', '普通區說明');
        fs.writeFileSync(file, code);
    }

    const labels = {
        normal_tab: '普通工单', hidden_tab: '隐藏工单',
        normal_description: '未隐藏用户的工单在此显示，未关闭的工单计入总览待处理工单，Telegram 工单提醒按原有设置发送。',
        description: '被隐藏用户的全部工单均在此显示，不计入总览待处理工单，也不发送 Telegram 工单提醒。',
        hidden_badge: '工单已隐藏', hide_action: '隐藏该用户工单',
        hide_title: '隐藏该用户的全部工单？',
        hide_description: '该用户现有及后续工单将仅在「隐藏工单」中显示，不计入总览待处理工单，也不再发送 Telegram 工单提醒。用户端的工单功能与状态保持不变，您仍可正常回复、关闭或重新开启工单。',
        hide_confirm: '确认隐藏', hide_success: '该用户的全部工单已隐藏', hide_error: '隐藏失败，请重试',
        restore_action: '恢复该用户工单', restore_title: '恢复该用户的全部工单？',
        restore_description: '该用户的全部工单将恢复至「普通工单」，未关闭的工单重新计入总览待处理工单。后续新工单及用户回复将按原有设置发送 Telegram 工单提醒，隐藏期间的提醒不会补发。',
        restore_confirm: '确认恢复', restore_success: '该用户的全部工单已恢复', restore_error: '恢复失败，请重试',
        empty: '暂无隐藏工单'
    };
    const translations = {
        'zh-CN': labels,
        'en-US': {
            normal_tab: 'Regular Tickets', hidden_tab: 'Hidden Tickets',
            normal_description: 'Tickets from users who are not hidden appear here. Open tickets count toward the dashboard pending total. Telegram ticket notifications follow the existing settings.',
            description: 'All tickets from hidden users appear here. They do not count toward the dashboard pending total or send Telegram ticket notifications.',
            hidden_badge: 'User tickets hidden', hide_action: "Hide this user's tickets",
            hide_title: 'Hide all tickets from this user?',
            hide_description: 'All existing and future tickets from this user will appear only in Hidden Tickets, be excluded from the dashboard pending total, and stop sending Telegram ticket notifications. Customer ticket functionality and statuses remain unchanged. You can still reply, close, or reopen tickets.',
            hide_confirm: 'Confirm Hide', hide_success: 'All tickets from this user are now hidden', hide_error: 'Failed to hide tickets. Please try again.',
            restore_action: "Restore this user's tickets", restore_title: 'Restore all tickets from this user?',
            restore_description: 'All tickets from this user will return to Regular Tickets. Open tickets will count toward the dashboard pending total again. Future new tickets and customer replies will send Telegram ticket notifications according to the existing settings. Notifications from the hidden period will not be replayed.',
            restore_confirm: 'Confirm Restore', restore_success: 'All tickets from this user have been restored', restore_error: 'Failed to restore tickets. Please try again.',
            empty: 'No hidden tickets'
        },
        'ru-RU': {
            normal_tab: 'Обычные тикеты', hidden_tab: 'Скрытые тикеты',
            normal_description: 'Здесь отображаются тикеты нескрытых пользователей. Открытые тикеты учитываются в счётчике на панели. Уведомления Telegram отправляются согласно текущим настройкам.',
            description: 'Здесь отображаются все тикеты скрытых пользователей. Они не учитываются в счётчике на панели и не вызывают уведомлений Telegram.',
            hidden_badge: 'Тикеты пользователя скрыты', hide_action: 'Скрыть тикеты пользователя',
            hide_title: 'Скрыть все тикеты пользователя?',
            hide_description: 'Все существующие и будущие тикеты пользователя будут отображаться только в скрытом разделе, не будут учитываться в счётчике на панели и не вызовут уведомлений Telegram. Функции и статусы тикетов для клиента не изменятся. Вы сможете отвечать, закрывать и повторно открывать тикеты.',
            hide_confirm: 'Подтвердить скрытие', hide_success: 'Все тикеты пользователя скрыты', hide_error: 'Не удалось скрыть тикеты. Повторите попытку.',
            restore_action: 'Восстановить тикеты пользователя', restore_title: 'Восстановить все тикеты пользователя?',
            restore_description: 'Все тикеты пользователя вернутся в обычный раздел. Открытые тикеты снова будут учитываться в счётчике на панели. Новые тикеты и ответы клиента будут вызывать уведомления Telegram согласно текущим настройкам. Уведомления за период скрытия повторно отправлены не будут.',
            restore_confirm: 'Подтвердить восстановление', restore_success: 'Все тикеты пользователя восстановлены', restore_error: 'Не удалось восстановить тикеты. Повторите попытку.',
            empty: 'Нет скрытых тикетов'
        }
    };
    for (const [language, values] of Object.entries(translations)) {
        const localeFile = path.join(root, 'locales', language + '.js');
        let locale = fs.readFileSync(localeFile, 'utf8');
        const namespace = JSON.stringify(values, null, 2).replace(/\n/g, '\n    ');
        if (!locale.includes('"hidden_tab":')) {
            const anchor = '  "ticket": {';
            locale = replaceOnce(locale, anchor, anchor + '\n    "visibility": ' + namespace + ',', language + ' 文案');
        } else {
            const re = /    "visibility": \{[\s\S]*?\n    \},/;
            const match = locale.match(re);
            if (!match) throw new Error('ticket-visibility: 找不到文案區塊');
            locale = replaceOnce(locale, match[0], '    "visibility": ' + namespace + ',', '更新 ' + language + ' 文案');
        }
        fs.writeFileSync(localeFile, locale);
    }
    require('./ticket-zz-confirm-layout')();
};

if (require.main === module) module.exports();
