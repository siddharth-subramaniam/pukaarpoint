const fs = require('fs');

const pages = [
  'src/app/page.tsx',
  'src/app/register/page.tsx',
  'src/app/track/page.tsx',
  'src/app/contact/page.tsx',
  'src/app/login/page.tsx'
];

pages.forEach(page => {
  if (fs.existsSync(page)) {
    let content = fs.readFileSync(page, 'utf8');
    const regex = /<header className="navbar">[\s\S]*?<\/header>/;
    content = content.replace(regex, '');
    fs.writeFileSync(page, content);
  }
});

console.log("Navbars removed from pages");
