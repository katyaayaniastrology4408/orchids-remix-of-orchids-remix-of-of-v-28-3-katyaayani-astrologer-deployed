const fs = require('fs');
const lines = fs.readFileSync('src/app/admin/page.tsx','utf8').split('\n');
lines.forEach((l,i) => {
  if ((l.includes('users') || l.includes('client')) && l.includes('activeTab')) {
    console.log((i+1) + ': ' + l.trim());
  }
});
console.log('---');
// Find existing tab list
lines.forEach((l,i) => {
  if (l.includes('NavItem') && l.includes('label=')) {
    console.log((i+1) + ': ' + l.trim().substring(0, 120));
  }
});
