const fs = require('fs');

const files = [
  'src/app/register/page.tsx',
  'src/app/track/page.tsx',
  'src/app/contact/page.tsx'
];

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  
  // Replace large header sizes
  content = content.replace(/fontSize:\s*'2\.5rem'/g, "fontSize: '2rem'");
  content = content.replace(/fontSize:\s*'3rem'/g, "fontSize: '2rem'");
  
  fs.writeFileSync(file, content);
});
console.log('Resized headers successfully.');
