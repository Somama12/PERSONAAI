const fs = require('fs');
const PDFDocument = require('pdfkit');

const doc = new PDFDocument();
doc.pipe(fs.createWriteStream('test.pdf'));
doc.fontSize(25).text('This is a test document with some text. Here is another sentence about bananas and apples.', 100, 100);
doc.end();
