const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    if (isDirectory) {
      walkDir(dirPath, callback);
    } else {
      if (dirPath.endsWith('.ts') || dirPath.endsWith('.tsx')) {
        callback(dirPath);
      }
    }
  });
}

let modifiedCount = 0;

walkDir(path.join(__dirname, 'src'), (filePath) => {
  let content = fs.readFileSync(filePath, 'utf8');
  let newContent = content
    .replace(/\[EG태권도\] \{name\} 님이 \{time\}에 출근하였습니다\./g, '[EGDesk 플랫폼] {name} 회원이 {time}에 출근하였습니다.')
    .replace(/\[EG태권도\] \{name\} 님이 \{time\}에 퇴근하였습니다\./g, '[EGDesk 플랫폼] {name} 회원이 {time}에 퇴근하였습니다.');

  if (content !== newContent) {
    fs.writeFileSync(filePath, newContent, 'utf8');
    console.log(`Updated ${filePath}`);
    modifiedCount++;
  }
});

console.log(`Modified ${modifiedCount} files.`);
