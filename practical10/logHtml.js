export function getLogHtml(logFile, logData) {
    return `
        <!DOCTYPE html>
        <html>
        <head>
            <title>Log Viewer</title>
            <style>
                body { font-family: Arial, sans-serif; margin: 20px; }
                pre { 
                    background: #f5f5f5; 
                    padding: 15px; 
                    border: 1px solid #ddd;
                    border-radius: 4px;
                    max-width: 100%;
                    overflow-x: auto;
                }
            </style>
        </head>
        <body>
            <h1>Log File: ${logFile}</h1>
            <pre>${logData.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</pre>
                </body>
                </html>
            `;
        }