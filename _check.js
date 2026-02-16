const c = require('fs').readFileSync('src/app/booking/page.tsx', 'utf8');
const lines = c.split('\n');
lines.forEach((l, i) => {
  if (l.includes('Loader2') || l.includes('AlertCircle')) {
    console.log((i + 1) + ': ' + l.trim());
  }
});
