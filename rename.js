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
    .replace(/등원 알림/g, '출근알림')
    .replace(/하원 알림/g, '퇴근알림')
    .replace(/등원/g, '출근')
    .replace(/하원/g, '퇴근')
    .replace(/미등원/g, '미출근')
    .replace(/미하원/g, '미퇴근')
    .replace(/등하원/g, '출퇴근');

  // Adjust default templates since "학생이" with "출근" is weird.
  newContent = newContent.replace(/학생이 (\{time\}에 출근)/g, '님이 $1');
  newContent = newContent.replace(/학생이 (\{time\}에 퇴근)/g, '님이 $1');

  if (content !== newContent) {
    fs.writeFileSync(filePath, newContent, 'utf8');
    console.log(`Updated ${filePath}`);
    modifiedCount++;
  }
});

console.log(`Modified ${modifiedCount} files.`);
