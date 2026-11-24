const fs = require('fs');
const path = require('path');

module.exports = function() {
    const localesDir = path.join(__dirname, '..', 'locales');
    if (!fs.existsSync(localesDir)) return;

    const files = fs.readdirSync(localesDir).filter(f => f.endsWith('.js'));

    const mappings = {
        'zh-CN': { "monthly": "月付", "quarterly": "季付", "half_yearly": "半年付", "yearly": "年付", "two_yearly": "两年付", "three_yearly": "三年付", "onetime": "一次性", "reset_traffic": "重置" },
        'en-US': { "monthly": "Monthly", "quarterly": "Quarterly", "half_yearly": "Semi-annually", "yearly": "Annually", "two_yearly": "Biennially", "three_yearly": "Triennially", "onetime": "One-time", "reset_traffic": "Reset Package" },
        'ru-RU': { "monthly": "Ежемесячно", "quarterly": "Ежеквартально", "half_yearly": "Раз в полгода", "yearly": "Ежегодно", "two_yearly": "Раз в 2 года", "three_yearly": "Раз в 3 года", "onetime": "Единоразово", "reset_traffic": "Пакет сброса" }
    };

    const orderOverrides = {
        'zh-CN': {
            'RESET_FLOW': '重置',
            'reset_traffic': '重置',
            'reset_price': '重置'
        }
    };

    files.forEach(file => {
        const localeCode = file.replace('.js', '');
        if (!mappings[localeCode]) return;

        const localePath = path.join(__dirname, '..', 'locales', file);
        let content = fs.readFileSync(localePath, 'utf8');
        let changed = false;

        // 錨點：鎖定訂單用的 month_price
        const anchor = '"month_price":';
        const anchorIdx = content.indexOf(anchor);
        
        if (anchorIdx === -1) {
            console.log(`[失敗] ${file} 找不到 month_price 錨點`);
            return;
        }

        // 構建插入內容
        const trans = mappings[localeCode];
        let insertion = "";
        for (const [key, val] of Object.entries(trans)) {
            insertion += `      "${key}": "${val}",\n`;
        }

        const orderIdx = content.indexOf('"order": {');
        const periodBlockStart = orderIdx !== -1 ? orderIdx : Math.max(0, anchorIdx - 600);
        const alreadyInjected = content.slice(periodBlockStart, anchorIdx).includes('"monthly":');

        if (!alreadyInjected) {
            const lineStartIdx = content.lastIndexOf('\n', anchorIdx) + 1;
            content = content.substring(0, lineStartIdx) + insertion + content.substring(lineStartIdx);
            changed = true;
        }

        const overrides = orderOverrides[localeCode];
        if (overrides && orderIdx !== -1) {
            const head = content.slice(0, orderIdx);
            let orderSection = content.slice(orderIdx);
            for (const [key, val] of Object.entries(overrides)) {
                const re = new RegExp(`("${key}":\\s*)"[^"]*"`);
                const replaced = orderSection.replace(re, `$1"${val}"`);
                if (replaced !== orderSection) {
                    orderSection = replaced;
                    changed = true;
                }
            }
            content = head + orderSection;
        }

        if (!changed) {
            console.log(`[略過] ${file} 的訂單翻譯已經是最新狀態`);
            return;
        }

        fs.writeFileSync(localePath, content, 'utf8');
        console.log(`[成功] 已將修正後翻譯注入至 ${file}`);
    });
};
