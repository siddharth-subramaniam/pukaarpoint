const fs = require('fs');
const path = require('path');

const dir = 'src/app';

function getFiles(dir, files = []) {
  const fileList = fs.readdirSync(dir);
  for (const file of fileList) {
    const name = `${dir}/${file}`;
    if (fs.statSync(name).isDirectory()) {
      getFiles(name, files);
    } else if (name.endsWith('.tsx')) {
      files.push(name);
    }
  }
  return files;
}

const tsxFiles = getFiles(dir);

for (const file of tsxFiles) {
  let content = fs.readFileSync(file, 'utf8');
  
  const regex = /<div className="brand-text">[\s\S]*?National Cyber Crime <br \/>[\s\S]*?<span[^>]*>Reporting Portal<\/span>[\s\S]*?<\/div>/g;
  const replacement = '<div className="brand-text" style={{ whiteSpace: \'nowrap\' }}>National Cyber Crime Reporting Portal</div>';
  
  if (regex.test(content)) {
    content = content.replace(regex, replacement);
    fs.writeFileSync(file, content);
    console.log(`Updated nav in ${file}`);
  }
}
