import express from 'express';
import fs from 'fs/promises';
import { getLogHtml } from './logHtml.js';

const app = express();
const PORT = 3000;
const LOG_FILE = 'error.log';

app.get('/', async (req, res) => {
    try {
        const data = await fs.readFile(LOG_FILE, 'utf8');
        res.send(getLogHtml(LOG_FILE, data));
    } catch (error) {
        if (error.code === 'ENOENT') {
            res.status(404).send(`<h1>Log file '${LOG_FILE}' not found.</h1>`);
        } else {
            res.status(500).send('<h1>Unable to read log file</h1>');
        }
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
    console.log(`Viewing log file: ${LOG_FILE}`);
});