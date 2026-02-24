const http = require('http');
const fs = require('fs');

http.get('http://192.168.1.63:5151/api/exams', (res) => {
    let data = '';
    res.on('data', c => data += c);
    res.on('end', () => {
        fs.writeFileSync('api_exams.json', data);
        console.log('Exams saved, status:', res.statusCode);
    });
}).on('error', e => console.error('Exams err:', e));

http.get('http://192.168.1.63:5151/api/exams/1', (res) => {
    let data = '';
    res.on('data', c => data += c);
    res.on('end', () => {
        fs.writeFileSync('api_exam_1.json', data);
        console.log('Exam 1 saved, status:', res.statusCode);
    });
}).on('error', e => console.error('Exam 1 err:', e));
