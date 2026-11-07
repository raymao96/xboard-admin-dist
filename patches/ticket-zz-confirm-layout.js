const fs = require('fs');
const path = require('path');

module.exports = function () {
    const assets = path.join(__dirname, '..', 'assets');
    const bundle = fs.readdirSync(assets).find(name => /^index-.*\.js$/.test(name));
    if (!bundle) throw new Error('ticket-confirm-layout: 找不到 bundle');
    const file = path.join(assets, bundle);
    let code = fs.readFileSync(file, 'utf8');
    let changed = false;
    {
        const component = function TicketConfirmDialog(props) {
            const mobile = p8e();
            if (!mobile) return Q.jsx(hQt, props);
            const {onConfirm, children, title = '确认操作', description = '确定要执行此操作吗？',
                cancelText = '取消', confirmText = '确认', variant = 'default', className} = props;
            return Q.jsxs(iQt, {children: [
                Q.jsx(rQt, {asChild: true, children: H.cloneElement(children, {onClick: event => {
                    event.stopPropagation();
                    children.props.onClick?.(event);
                }})}),
                Q.jsxs(sQt, {className: Im('sm:max-w-[425px]', className), children: [
                    Q.jsxs(oQt, {children: [Q.jsx(lQt, {children: title}), Q.jsx(cQt, {children: description})]}),
                    Q.jsxs(aQt, {onClick: event => event.stopPropagation(), children: [
                        Q.jsx(itt, {asChild: true, children: Q.jsx(Lf, {variant: 'outline', className: 'w-full', children: cancelText})}),
                        Q.jsx(itt, {asChild: true, children: Q.jsx(Lf, {variant, className: 'w-full', onClick: onConfirm, children: confirmText})})
                    ]})
                ]})
            ]});
        }.toString();
        const anchor = 'function hQt(';
        if (code.split(anchor).length !== 2) throw new Error('ticket-confirm-layout: 找不到唯一確認元件錨點');
        const start = code.indexOf('function TicketConfirmDialog(');
        if (start < 0) {
            code = code.replace(anchor, component + anchor);
            changed = true;
        } else {
            const end = code.indexOf(anchor, start);
            if (end < start) throw new Error('ticket-confirm-layout: 找不到原始確認元件');
            if (code.slice(start, end) !== component) {
                code = code.slice(0, start) + component + code.slice(end);
                changed = true;
            }
        }
    }
    // Scope the fix to ticket row actions, ticket details, and hide/restore controls.
    for (const anchor of ['i9t=(e,t,n,i)=>', 'function b9t(', 'function TicketVisibilityControl(']) {
        const start = code.indexOf(anchor);
        if (start < 0) {
            if (anchor.includes('TicketVisibilityControl')) continue;
            throw new Error('ticket-confirm-layout: 找不到工單錨點 ' + anchor);
        }
        const end = code.indexOf('function ', start + anchor.length);
        if (end < 0) throw new Error('ticket-confirm-layout: 找不到工單區塊結尾');
        const original = code.slice(start, end);
        const updated = original.replaceAll('Q.jsx(hQt,', 'Q.jsx(TicketConfirmDialog,');
        if (updated !== original) {
            code = code.slice(0, start) + updated + code.slice(end);
            changed = true;
        }
    }
    if (changed) {
        const check = require('child_process').spawnSync(process.execPath, ['--check', '--input-type=module'], {input: code, encoding: 'utf8'});
        if (check.status !== 0) throw new Error(check.stderr || 'ticket-confirm-layout: bundle 語法錯誤');
        fs.writeFileSync(file, code);
        console.log('[成功] ticket-confirm-layout: 工單手機確認視窗改為單層按鈕');
    } else {
        console.log('[略過] ticket-confirm-layout: 已注入');
    }
};

if (require.main === module) module.exports();
