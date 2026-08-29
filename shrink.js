const fs = require('fs');


const files = [
  'src/app/register/page.tsx',
  'src/app/track/page.tsx',
  'src/app/contact/page.tsx',
  'src/app/globals.css'
];

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  
  // Replace inline styles in TSX
  content = content.replace(/padding:\s*'(14|16)px 32px'/g, "padding: '10px 20px'");
  content = content.replace(/padding:\s*'14px 16px'/g, "padding: '10px 12px'");
  content = content.replace(/fontSize:\s*'1\.5rem'/g, "fontSize: '1.25rem'");
  content = content.replace(/fontSize:\s*'1\.25rem'/g, "fontSize: '1.125rem'");
  content = content.replace(/fontSize:\s*'1\.125rem'/g, "fontSize: '0.95rem'");
  content = content.replace(/fontSize:\s*'1\.1rem'/g, "fontSize: '0.95rem'");
  
  // Replace globals.css if needed
  if (file.endsWith('.css')) {
    content = content.replace(/padding:\s*12px 24px/g, "padding: 8px 16px");
    content = content.replace(/padding:\s*14px 32px/g, "padding: 10px 20px");
    content = content.replace(/font-size:\s*1\.125rem/g, "font-size: 0.95rem");
    content = content.replace(/font-size:\s*1rem/g, "font-size: 0.875rem");
    content = content.replace(/height:\s*80px/g, "height: 60px"); // Navbar
    content = content.replace(/padding:\s*80px/g, "padding: 40px"); // Containers
  }

  // Also add global input styles to globals.css
  if (file.endsWith('.css') && !content.includes('select, input, textarea')) {
    content += `\n
select, input, textarea {
  font-size: 0.95rem !important;
  padding: 8px 12px !important;
  border-radius: 6px !important;
}
.btn-primary, .btn-outline, .btn-danger {
  padding: 8px 16px !important;
  font-size: 0.95rem !important;
}
    `;
  }

  fs.writeFileSync(file, content);
});
console.log('Resized elements successfully.');
