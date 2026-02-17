const fs = require('fs');
const data = fs.readFileSync('src/app/admin/page.tsx', 'utf8');
const lines = data.split('\n');
lines.forEach((l, i) => {
  if (l.includes('lucide-react') && i < 30) console.log(`${i+1}: ${l.trim().substring(0, 200)}`);
});
