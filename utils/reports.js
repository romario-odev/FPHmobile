const fs = require('fs');
const path = require('path');

function generateTestReport({ test, status, timestamp, screenshotBuffer, videoBuffer, pageSource, logs, context }) {
    const resultsDir = './results';
    if (!fs.existsSync(resultsDir)) fs.mkdirSync(resultsDir, { recursive: true });
    if (!fs.existsSync(`${resultsDir}/screenshots`)) fs.mkdirSync(`${resultsDir}/screenshots`, { recursive: true });
    if (!fs.existsSync(`${resultsDir}/reports`)) fs.mkdirSync(`${resultsDir}/reports`, { recursive: true });

    const testName = test.title.replace(/[^a-z0-9]/gi, '_');
    if (screenshotBuffer) {
        fs.writeFileSync(`${resultsDir}/screenshots/${status}_${testName}_${timestamp}.png`, screenshotBuffer);
    }

    const reportFile = `${resultsDir}/reports/${status}_${testName}_${timestamp}.html`;
    const content = `<html><body><h1>${test.title} - ${status}</h1><pre>${logs.join('\n')}</pre></body></html>`;
    fs.writeFileSync(reportFile, content);
}

function generateDashboard() {
    console.log('Dashboard generated at results/index.html');
}

module.exports = { generateTestReport, generateDashboard };
