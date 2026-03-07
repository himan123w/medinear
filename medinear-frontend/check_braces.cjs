const fs = require('fs');
const content = fs.readFileSync('/Users/rajpoothimanshusingh369/Desktop/medinear/medinear-frontend/src/pages/Home.jsx', 'utf8');
const lines = content.split('\n');
let braces = 0;
let lastOpen = [];

for(let i=0; i<565; i++) {
  for(let charIdx=0; charIdx<lines[i].length; charIdx++) {
    const char = lines[i][charIdx];
    if(char==='{') { 
      braces++; 
      if(i >= 545) {
        lastOpen.push({line: i+1, text: lines[i].trim().substring(0,70)});
      }
    }
    if(char==='}') { 
      braces--; 
      if(i >= 545 && lastOpen.length > 0) {
        lastOpen.pop();
      }
    }
  }
}

console.log('\nUnclosed braces as of line 565:');
lastOpen.forEach(item => {
  console.log(`  Line ${item.line}: ${item.text}`);
});
console.log(`\nTotal unclosed braces: ${braces}`);
