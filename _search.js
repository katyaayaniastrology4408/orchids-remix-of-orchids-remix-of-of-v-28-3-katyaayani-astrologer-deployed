const fs = require('fs');
const c = fs.readFileSync('src/app/booking/page.tsx', 'utf8');
const lines = c.split('\n');
lines.forEach((l, i) => {
  if (l.includes('setInvoiceNumber') || l.includes('invoiceNumber')) {
    console.log((i+1) + ': ' + l.trim());
  }
});
