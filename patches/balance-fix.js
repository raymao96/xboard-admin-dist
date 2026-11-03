const fs = require('fs');
const path = require('path');

module.exports = function() {
    const assetsDir = path.join(__dirname, '..', 'assets');
    const jsFile = fs.readdirSync(assetsDir).find(f => f.startsWith('index-') && f.endsWith('.js'));
    const filePath = path.join(assetsDir, jsFile);
    let code = fs.readFileSync(filePath, 'utf8');

    // 冪等性檢查
    if (code.includes('value:"balance"')) {
        console.log('[略過] balance-fix: 已經注入過');
        return;
    }

    const PLAN_ID = '{label:i("filter.fields.plan_id"),value:"plan_id",type:"select",operators:[{label:i("filter.operators.eq"),value:"eq"}],useOptions:!0}';
    const TRANSFER_ENABLE = '{label:i("filter.fields.transfer_enable"),value:"transfer_enable",type:"number",unit:"GB",operators:[{label:i("filter.operators.gt"),value:"gt"},{label:i("filter.operators.lt"),value:"lt"},{label:i("filter.operators.eq"),value:"eq"}]}';
    const TOTAL_USED = '{label:i("filter.fields.total_used"),value:"total_used",type:"number",unit:"GB",operators:[{label:i("filter.operators.gt"),value:"gt"},{label:i("filter.operators.lt"),value:"lt"},{label:i("filter.operators.eq"),value:"eq"}]}';
    const ONLINE_COUNT = '{label:i("filter.fields.online_count"),value:"online_count",type:"number",operators:[{label:i("filter.operators.eq"),value:"eq"},{label:i("filter.operators.gt"),value:"gt"},{label:i("filter.operators.lt"),value:"lt"}]}';
    const EXPIRED_AT = '{label:i("filter.fields.expired_at"),value:"expired_at",type:"date",operators:[{label:i("filter.operators.lt"),value:"lt"},{label:i("filter.operators.gt"),value:"gt"},{label:i("filter.operators.eq"),value:"eq"}]}';
    const UUID_FIELD = '{label:i("filter.fields.uuid"),value:"uuid",type:"text",operators:[{label:i("filter.operators.eq"),value:"eq"}]}';
    const TOKEN_FIELD = '{label:i("filter.fields.token"),value:"token",type:"text",operators:[{label:i("filter.operators.eq"),value:"eq"}]}';
    const BANNED = '{label:i("filter.fields.banned"),value:"banned",type:"select",operators:[{label:i("filter.operators.eq"),value:"eq"}],options:[{label:i("filter.status.normal"),value:"0"},{label:i("filter.status.banned"),value:"1"}]}';
    const REMARKS = '{label:i("filter.fields.remark"),value:"remarks",type:"text",operators:[{label:i("filter.operators.contains"),value:"contains"},{label:i("filter.operators.eq"),value:"eq"}]}';
    const BALANCE = '{label:i("filter.fields.balance"),value:"balance",type:"number",operators:[{label:i("filter.operators.eq"),value:"eq"},{label:i("filter.operators.gt"),value:"gt"},{label:i("filter.operators.lt"),value:"lt"}]}';

    const originalSpan = [PLAN_ID, TRANSFER_ENABLE, TOTAL_USED, ONLINE_COUNT, EXPIRED_AT, UUID_FIELD, TOKEN_FIELD, BANNED, REMARKS].join(',') + ',';
    const newSpan = [PLAN_ID, REMARKS, BALANCE, TRANSFER_ENABLE, TOTAL_USED, ONLINE_COUNT, EXPIRED_AT, UUID_FIELD, TOKEN_FIELD, BANNED].join(',') + ',';

    if (!code.includes(originalSpan)) {
        throw new Error('找不到餘額欄位原始錨點，可能原作者更新了欄位結構');
    }

    code = code.replace(originalSpan, newSpan);
    fs.writeFileSync(filePath, code, 'utf8');
    console.log('[成功] balance-fix: 已注入');
};
