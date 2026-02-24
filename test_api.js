const http = require('http');
const fs = require('fs');

http.get('http://192.168.1.63:5151/api/courses', (res) => {
    let data = '';
    res.on('data', c => data += c);
    res.on('end', () => {
        fs.writeFileSync('api_courses.json', data);
        console.log('Courses saved');
    });
}).on('error', e => console.error('Course err:', e));

http.get('http://192.168.1.63:5151/api/batches/course/2', (res) => {
    let data = '';
    res.on('data', c => data += c);
    res.on('end', () => {
        fs.writeFileSync('api_batches_2.json', data);
        console.log('Batches saved');
    });
}).on('error', e => console.error('Batch err:', e));
