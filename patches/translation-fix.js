const fs = require('fs');
const path = require('path');

module.exports = function() {
    const localesDir = path.join(__dirname, '..', 'locales');
    if (!fs.existsSync(localesDir)) return;

    const files = fs.readdirSync(localesDir).filter(f => f.endsWith('.js'));

    const mappings = {
        'zh-CN': { "monthly": "月付", "quarterly": "季付", "half_yearly": "半年付", "yearly": "年付", "two_yearly": "两年付", "three_yearly": "三年付", "onetime": "一次性", "reset_traffic": "流量重置包" },
        'en-US': { "monthly": "Monthly", "quarterly": "Quarterly", "half_yearly": "Semi-annually", "yearly": "Annually", "two_yearly": "Biennially", "three_yearly": "Triennially", "onetime": "One-time", "reset_traffic": "Reset Package" },
        'ru-RU': { "monthly": "Ежемесячно", "quarterly": "Ежеквартально", "half_yearly": "Раз в полгода", "yearly": "Ежегодно", "two_yearly": "Раз в 2 года", "three_yearly": "Раз в 3 года", "onetime": "Единоразово", "reset_traffic": "Пакет сброса" }
    };

    files.forEach(file => {
        const localeCode = file.replace('.js', '');
        if (!mappings[localeCode]) return;

        const localePath = path.join(__dirname, '..', 'locales', file);
        let content = fs.readFileSync(localePath, 'utf8');

        // 錨點：鎖定訂單用的 month_price
        const anchor = '"month_price":';
        const anchorIdx = content.indexOf(anchor);
        
        if (anchorIdx === -1) {
            console.log(`[失敗] ${file} 找不到 month_price 錨點`);
            return;
        }

        // 檢查該區塊上下文是否已經有 monthly (狀態檢查)
        const contextStart = Math.max(0, anchorIdx - 200);
        const contextCheck = content.substring(contextStart, anchorIdx);
        
        if (contextCheck.includes('"monthly":')) {
            console.log(`[略過] ${file} 的訂單週期區塊已經包含 monthly`);
            return;
        }

        // 構建插入內容
        const trans = mappings[localeCode];
        let insertion = "";
        for (const [key, val] of Object.entries(trans)) {
            insertion += `      "${key}": "${val}",\n`;
        }

        // 取得 anchor 所在行之前的內容
        const lineStartIdx = content.lastIndexOf('\n', anchorIdx) + 1;
        const newContent = content.substring(0, lineStartIdx) + insertion + content.substring(lineStartIdx);
        
        fs.writeFileSync(localePath, newContent, 'utf8');
        console.log(`[成功] 已將修正後翻譯注入至 ${file}`);
    });
};
