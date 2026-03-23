const fs = require('fs');
const path = require('path');

const rootDir = '/Users/koseikarita/Documents/Fighters-diet';

const filesToUpdate = [
    { file: 'index.html', active: 'Home', level: 0 },
    { file: 'faq/index.html', active: 'FAQ', level: 1 },
    { file: 'tools/index.html', active: '計算ツール', level: 1 },
    { file: 'blog/index.html', active: 'ブログ', level: 1 }
];

const blogDir = path.join(rootDir, 'blog');
if(fs.existsSync(blogDir)) {
    const blogFiles = fs.readdirSync(blogDir).filter(f => f.startsWith('post-') && f.endsWith('.html'));
    blogFiles.forEach(f => {
        filesToUpdate.push({ file: `blog/${f}`, active: 'ブログ', level: 1 });
    });
}

filesToUpdate.forEach(({ file, active, level }) => {
    const filePath = path.join(rootDir, file);
    if (!fs.existsSync(filePath)) return;

    const homeLink = level === 0 ? './index.html' : '../index.html';
    const boxerLink = file === 'boxer/index.html' ? 'index.html' : (level === 0 ? './boxer/index.html' : '../boxer/index.html');
    const faqLink = file === 'faq/index.html' ? 'index.html' : (level === 0 ? './faq/index.html' : '../faq/index.html');
    const toolsLink = file === 'tools/index.html' ? 'index.html' : (level === 0 ? './tools/index.html' : '../tools/index.html');
    const blogLink = file.startsWith('blog/') ? 'index.html' : (level === 0 ? './blog/index.html' : '../blog/index.html');

    const newNav = `<nav>
            <ul class="global-nav">
                <li><a href="${homeLink}"${active === 'Home' ? ' class="active"' : ''}>Home</a></li>
                <li><a href="${boxerLink}"${active === 'ボクサーとは？' ? ' class="active"' : ''}>ボクサーとは？</a></li>
                <li><a href="${faqLink}"${active === 'FAQ' ? ' class="active"' : ''}>FAQ</a></li>
                <li><a href="${toolsLink}"${active === '計算ツール' ? ' class="active"' : ''}>計算ツール</a></li>
                <li><a href="${blogLink}"${active === 'ブログ' ? ' class="active"' : ''}>ブログ</a></li>
            </ul>
        </nav>`;

    let content = fs.readFileSync(filePath, 'utf8');
    content = content.replace(/<nav>\s*<ul class="global-nav">[\s\S]*?<\/ul>\s*<\/nav>/, newNav);
    fs.writeFileSync(filePath, content);
});
console.log('Nav updated successfully!');
