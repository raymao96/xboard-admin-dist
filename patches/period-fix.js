const fs = require('fs');
const path = require('path');

module.exports = function() {
    const indexPath = path.join(__dirname, '..', 'index.html');
    let indexHtml = fs.readFileSync(indexPath, 'utf8');

    const apiPatchScript = `
<script>
(function() {
    const periodMapping = {
        'month_price': 'monthly',
        'quarter_price': 'quarterly',
        'half_year_price': 'half_yearly',
        'year_price': 'yearly',
        'two_year_price': 'two_yearly',
        'three_year_price': 'three_yearly',
        'onetime_price': 'onetime',
        'reset_price': 'reset_traffic'
    };

    const originalSend = XMLHttpRequest.prototype.send;
    XMLHttpRequest.prototype.send = function(body) {
        let modifiedBody = body;
        if (body && typeof body === 'string') {
            try {
                let data = JSON.parse(body);
                if (data.filter && Array.isArray(data.filter)) {
                    data.filter.forEach(f => {
                        if (f.id === 'period' && Array.isArray(f.value)) {
                            f.value = f.value.map(v => periodMapping[v] || v);
                        }
                    });
                    modifiedBody = JSON.stringify(data);
                }
            } catch (e) {}
        }
        return originalSend.call(this, modifiedBody);
    };
})();
</script>`;

    if (indexHtml.includes('const periodMapping')) {
        console.log('[略過] period-fix: 已經注入過');
        return;
    }

    indexHtml = indexHtml.replace('</head>', apiPatchScript + '\n</head>');
    fs.writeFileSync(indexPath, indexHtml, 'utf8');
    console.log('[成功] 已注入 API 傳輸層攔截器 (period-fix)');
};
