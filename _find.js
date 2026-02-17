const fs = require('fs');
const dir = 'src/components/admin';
const files = fs.readdirSync(dir);
files.forEach(f => {
  const content = fs.readFileSync(dir + '/' + f, 'utf8');
  const lines = content.split('\n');
  lines.forEach((l, i) => {
    if (l.includes('.json()') && !l.includes('safeJson') && !l.trim().startsWith('//')) {
      console.log(f + ':' + (i+1) + ': ' + l.trim());
    }
  });
});

// Also check components that load on admin
['src/components/UserAlertsPopup.tsx', 'src/components/WebmasterPingPanel.tsx'].forEach(fp => {
  if (fs.existsSync(fp)) {
    const content = fs.readFileSync(fp, 'utf8');
    const lines = content.split('\n');
    lines.forEach((l, i) => {
      if (l.includes('.json()') && !l.trim().startsWith('//')) {
        console.log(fp + ':' + (i+1) + ': ' + l.trim());
      }
    });
  }
});
