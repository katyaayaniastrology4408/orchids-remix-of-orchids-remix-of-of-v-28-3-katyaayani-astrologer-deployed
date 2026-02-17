const c = require('fs').readFileSync('src/app/booking/page.tsx','utf8');
const lines = c.split('\n');
lines.forEach((l,i) => {
  if(l.includes('handleRetryPayment') && l.includes('const')) console.log((i+1) + ': ' + l.trim());
});
console.log('Total lines:', lines.length);
