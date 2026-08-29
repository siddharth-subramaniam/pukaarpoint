const fs = require('fs');

const pages = [
  'src/app/page.tsx',
  'src/app/register/page.tsx',
  'src/app/track/page.tsx',
  'src/app/contact/page.tsx',
  'src/app/login/page.tsx'
];

const getNavLinks = (activePath) => `
          <div className="nav-links">
            <Link href="/register" style={{ textDecoration: 'none', color: '${activePath === '/register' ? 'var(--accent-primary)' : 'var(--text-secondary)'}', fontWeight: ${activePath === '/register' ? '700' : '600'} }}>Register a Complaint</Link>
            <Link href="/track" style={{ textDecoration: 'none', color: '${activePath === '/track' ? 'var(--accent-primary)' : 'var(--text-secondary)'}', fontWeight: ${activePath === '/track' ? '700' : '600'} }}>Track your Complaint</Link>
            <Link href="/contact" style={{ textDecoration: 'none', color: '${activePath === '/contact' ? 'var(--accent-primary)' : 'var(--text-secondary)'}', fontWeight: ${activePath === '/contact' ? '700' : '600'} }}>Contact Us</Link>
          </div>
`;

pages.forEach(page => {
  if (!fs.existsSync(page)) return;
  let content = fs.readFileSync(page, 'utf8');
  
  let path = '/' + page.split('/')[2];
  if (path === '/page.tsx') path = '/';
  
  const regex = /<header className="navbar">[\s\S]*?<\/header>/g;
  const newHeader = `<header className="navbar">
        <div className="nav-container">
          <Link href="/" className="brand" style={{ textDecoration: 'none' }}>
            <div style={{ background: 'var(--accent-primary)', width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
              </svg>
            </div>
            <div className="brand-text" style={{ whiteSpace: 'nowrap', fontSize: '1.15rem', color: 'var(--accent-primary)', fontWeight: 700 }}>
              National Cyber Crime Reporting Portal
            </div>
          </Link>
${getNavLinks(path)}
        </div>
      </header>`;
      
  content = content.replace(regex, newHeader);
  fs.writeFileSync(page, content);
});

// Reduce headings in register and track
if (fs.existsSync('src/app/register/page.tsx')) {
  let regContent = fs.readFileSync('src/app/register/page.tsx', 'utf8');
  regContent = regContent.replace(/<h1[^>]*>Register a Complaint<\/h1>/, '<h1 className="heading-serif" style={{ fontSize: \'1.5rem\', marginBottom: \'16px\' }}>Register a Complaint</h1>');
  fs.writeFileSync('src/app/register/page.tsx', regContent);
}

if (fs.existsSync('src/app/track/page.tsx')) {
  let trackContent = fs.readFileSync('src/app/track/page.tsx', 'utf8');
  trackContent = trackContent.replace(/<h1[^>]*>Track your Complaint<\/h1>/, '<h1 className="heading-serif" style={{ fontSize: \'1.5rem\', marginBottom: \'16px\' }}>Track your Complaint</h1>');
  fs.writeFileSync('src/app/track/page.tsx', trackContent);
}

// Fake address in Contact
if (fs.existsSync('src/app/contact/page.tsx')) {
  let contactContent = fs.readFileSync('src/app/contact/page.tsx', 'utf8');
  contactContent = contactContent.replace(/National Cyber Crime Reporting Center<br \/>[\s\S]*?New Delhi - 110003/,
  'Cyber Security Headquarters<br />\\n              123 Digital Avenue, Tech Park<br />\\n              Silicon Valley, CA 94000');
  fs.writeFileSync('src/app/contact/page.tsx', contactContent);
}
console.log("UI unified");
