const fs = require('fs');
const filePath = 'E:/LMS-Project-Demo ajay/LMS-Project-Demo/src/pages/Batches/BatchBuilder.jsx';
const content = fs.readFileSync(filePath, 'utf8');
const lines = content.split('\n');
console.log('Total lines before:', lines.length);
// Remove orphan duplicate lines 850-883 (0-indexed: 849 to 882)
const cleaned = [...lines.slice(0, 849), ...lines.slice(883)];
console.log('Total lines after:', cleaned.length);
fs.writeFileSync(filePath, cleaned.join('\n'), 'utf8');
console.log('Done!');
