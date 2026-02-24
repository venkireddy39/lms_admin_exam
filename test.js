const http = require('http');

http.get('http://192.168.1.63:5151/api/courses', (res) => {
    let chunks = [];
    res.on('data', (c) => chunks.push(c));
    res.on('end', () => console.log('COURSES:', Buffer.concat(chunks).toString().substring(0, 500)));
}).on('error', console.error);

http.get('http://192.168.1.63:5151/api/batches/course/2', (res) => {
    let chunks = [];
    res.on('data', (c) => chunks.push(c));
    res.on('end', () => console.log('BATCHES:', Buffer.concat(chunks).toString().substring(0, 500)));
}).on('error', console.error);
