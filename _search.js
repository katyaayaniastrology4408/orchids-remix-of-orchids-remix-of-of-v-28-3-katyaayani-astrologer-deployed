const c = require('fs').readFileSync('src/app/admin/page.tsx','utf8');
const lines = c.split('\n');
let count = 0;
lines.forEach((l,i)=>{
  if(l.includes('SEO Monitor') && l.includes('NavItem')) {
    count++;
    console.log((i+1)+': '+l.trim().substring(0,150));
  }
});
console.log('Count:', count);
