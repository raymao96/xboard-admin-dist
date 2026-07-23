const fs = require('fs');
const path = require('path');

const assetsDir = path.join(__dirname, 'assets');
if (!fs.existsSync(assetsDir)) {
    console.error('[錯誤] 找不到 assets 資料夾');
    process.exit(1);
}

const jsFile = fs.readdirSync(assetsDir).find(f => f.startsWith('index-') && f.endsWith('.js'));
if (!jsFile) {
    console.error('[錯誤] 找不到對應的 index-*.js 檔');
    process.exit(1);
}

const filePath = path.join(assetsDir, jsFile);
let code = fs.readFileSync(filePath, 'utf8');

// 冪等性檢查：已經注入過 balance 欄位就跳過，避免重複執行造成欄位重複
if (code.includes('value:"balance"')) {
    console.log('[略過] 已經包含 balance 欄位，無需重複注入:', jsFile);
    process.exit(0);
}

// --- 定義使用者列表 filter 欄位陣列中，plan_id 到 remarks 之間「原本完整且連續」的欄位物件 ---
// 這一整段從 plan_id 一路到 remarks 是連續且獨一無二的序列，
// 用整段當錨點來做替換，不用擔心別的表格（訂單、工單…）裡同樣有「備註」欄位而誤傷。

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

// 原始順序：plan_id -> transfer_enable -> total_used -> online_count -> expired_at -> uuid -> token -> banned -> remarks
const originalSpan = [PLAN_ID, TRANSFER_ENABLE, TOTAL_USED, ONLINE_COUNT, EXPIRED_AT, UUID_FIELD, TOKEN_FIELD, BANNED, REMARKS].join(',') + ',';

// 目標順序：plan_id -> remarks -> balance -> transfer_enable -> total_used -> online_count -> expired_at -> uuid -> token -> banned
const newSpan = [PLAN_ID, REMARKS, BALANCE, TRANSFER_ENABLE, TOTAL_USED, ONLINE_COUNT, EXPIRED_AT, UUID_FIELD, TOKEN_FIELD, BANNED].join(',') + ',';

if (!code.includes(originalSpan)) {
    console.error('[錯誤] 找不到從 plan_id 到 remarks 的完整原始欄位序列，可能原作者更新後調整了欄位定義或順序，請人工比對後更新此腳本的錨點字串');
    process.exit(1);
}

// 用一次性的整段替換完成「搬移 remarks + 插入 balance」，
// 因為是整段已知完整物件的重組，逗號與大括號都在字串常數裡配對好，不會產生語法錯誤。
code = code.replace(originalSpan, newSpan);

fs.writeFileSync(filePath, code, 'utf8');
console.log('[成功] 已將 remarks 移到 plan_id 之後，並新增 balance 欄位到:', jsFile);
