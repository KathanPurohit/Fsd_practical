const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const port = 3000;


app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));


app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.post('/calculate', (req, res) => {
    const { num1, num2, operation } = req.body;
    

    if (isNaN(num1) || isNaN(num2)) {
        return res.status(400).json({ error: 'Please enter valid numbers!' });
    }

    const n1 = parseFloat(num1);
    const n2 = parseFloat(num2);
    let result;

    switch (operation) {
        case 'add':
            result = n1 + n2;
            break;
        case 'subtract':
            result = n1 - n2;
            break;
        case 'multiply':
            result = n1 * n2;
            break;
        case 'divide':
            if (n2 === 0) {
                return res.status(400).json({ error: 'Cannot divide by zero!' });
            }
            result = n1 / n2;
            break;
        default:
            return res.status(400).json({ error: 'Invalid operation!' });
    }

    res.json({ result: result });
});

app.listen(port, () => {
    console.log(`Calculator app running at http://localhost:${port}`);
});


