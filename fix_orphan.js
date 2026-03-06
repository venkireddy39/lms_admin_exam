const fs = require('fs');
const file = 'src/pages/Batches/BatchBuilder.jsx';
// Read the file and split by lines handling both \r\n and \n
const lines = fs.readFileSync(file, 'utf8').split(/\r?\n/);
// Log the lines we are about to remove for safety
console.log('Removing lines 850 to 883:');
console.log(lines[849]);
console.log(lines[882]);

// Remove 34 lines starting at index 849 (which is line 850)
lines.splice(849, 34);

fs.writeFileSync(file, lines.join('\n'), 'utf8');
console.log('Successfully removed the orphan block!');

