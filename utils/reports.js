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

    // Armazenar resultado em arquivo compartilhado
    const resultsFile = `${resultsDir}/test-results-temp.json`;
    let testResults = [];
    if (fs.existsSync(resultsFile)) {
        try {
            testResults = JSON.parse(fs.readFileSync(resultsFile, 'utf8'));
        } catch (e) {
            testResults = [];
        }
    }
    
    testResults.push({
        title: test.title,
        status: status,
        timestamp: timestamp,
        error: context.error ? context.error.message : null,
        duration: test.duration,
        suite: test.parent || 'Default Suite'
    });
    
    fs.writeFileSync(resultsFile, JSON.stringify(testResults, null, 2));
}

function generateDashboard() {
    const resultsDir = './results';
    const resultsFile = `${resultsDir}/test-results-temp.json`;

    let testResults = [];
    if (fs.existsSync(resultsFile)) {
        try {
            testResults = JSON.parse(fs.readFileSync(resultsFile, 'utf8'));
        } catch (e) {
            testResults = [];
        }
    }

    // Gerar JSON para uso local
    const jsonResults = {
        summary: {
            total: testResults.length,
            passed: testResults.filter(r => r.status === 'passed').length,
            failed: testResults.filter(r => r.status === 'failed').length
        },
        tests: testResults
    };
    fs.writeFileSync(`${resultsDir}/test-results.json`, JSON.stringify(jsonResults, null, 2));

    // Gerar JUnit XML para Azure DevOps (compatível com PublishTestResults)
    const xmlHeader = '<?xml version="1.0" encoding="UTF-8"?>';
    const totalTests = testResults.length;
    const failures = testResults.filter(r => r.status === 'failed').length;
    const errors = 0;
    const skipped = 0;
    const totalDuration = testResults.reduce((sum, t) => sum + (t.duration || 0), 0);

    // Agrupar por suite
    const suites = {};
    testResults.forEach(test => {
        const suiteName = test.suite || 'Default Suite';
        if (!suites[suiteName]) {
            suites[suiteName] = [];
        }
        suites[suiteName].push(test);
    });

    let junitXml = `${xmlHeader}\n<testsuites name="FPH Mobile E2E Tests" tests="${totalTests}" failures="${failures}" errors="${errors}" skipped="${skipped}" time="${totalDuration / 1000}">\n`;

    Object.keys(suites).forEach(suiteName => {
        const suiteTests = suites[suiteName];
        const suiteFailures = suiteTests.filter(t => t.status === 'failed').length;
        const suiteDuration = suiteTests.reduce((sum, t) => sum + (t.duration || 0), 0);

        junitXml += `  <testsuite name="${suiteName}" tests="${suiteTests.length}" failures="${suiteFailures}" errors="0" skipped="0" time="${suiteDuration / 1000}">\n`;

        suiteTests.forEach(test => {
            const testDuration = (test.duration || 0) / 1000;
            const testName = test.title.replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
            const error = test.error ? test.error.replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;') : '';

            if (test.status === 'failed') {
                junitXml += `    <testcase name="${testName}" time="${testDuration}">\n`;
                junitXml += `      <failure message="${error}"><![CDATA[${error}]]></failure>\n`;
                junitXml += `    </testcase>\n`;
            } else {
                junitXml += `    <testcase name="${testName}" time="${testDuration}"/>\n`;
            }
        });

        junitXml += `  </testsuite>\n`;
    });

    junitXml += '</testsuites>';
    fs.writeFileSync(`${resultsDir}/junit.xml`, junitXml);

    // Gerar HTML Dashboard
    const passedCount = testResults.filter(r => r.status === 'passed').length;
    const failedCount = testResults.filter(r => r.status === 'failed').length;
    const totalCount = testResults.length;
    const passRate = totalCount > 0 ? ((passedCount / totalCount) * 100).toFixed(1) : 0;

    const html = `
<!DOCTYPE html>
<html>
<head>
    <title>Test Results Dashboard</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; background: #f5f5f5; }
        .header { background: #0078d4; color: white; padding: 20px; border-radius: 8px; margin-bottom: 20px; }
        .summary { display: grid; grid-template-columns: repeat(4, 1fr); gap: 15px; margin-bottom: 20px; }
        .card { background: white; padding: 20px; border-radius: 8px; text-align: center; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        .card h2 { margin: 0; font-size: 2em; }
        .card p { margin: 5px 0 0; color: #666; }
        .passed { color: #107c10; }
        .failed { color: #d13438; }
        .test-list { background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        .test-item { padding: 15px; border-bottom: 1px solid #eee; display: flex; align-items: center; }
        .test-item:last-child { border-bottom: none; }
        .status { padding: 5px 15px; border-radius: 4px; font-weight: bold; margin-right: 15px; }
        .status.passed { background: #dff6dd; color: #107c10; }
        .status.failed { background: #fde7e9; color: #d13438; }
        .test-name { flex: 1; }
        .error { color: #d13438; font-size: 0.9em; margin-top: 5px; }
    </style>
</head>
<body>
    <div class="header">
        <h1>📊 Test Results Dashboard</h1>
        <p>Automated E2E Tests - FPH Mobile</p>
    </div>

    <div class="summary">
        <div class="card">
            <h2>${totalCount}</h2>
            <p>Total Tests</p>
        </div>
        <div class="card">
            <h2 class="passed">${passedCount}</h2>
            <p>Passed</p>
        </div>
        <div class="card">
            <h2 class="failed">${failedCount}</h2>
            <p>Failed</p>
        </div>
        <div class="card">
            <h2>${passRate}%</h2>
            <p>Pass Rate</p>
        </div>
    </div>

    <div class="test-list">
        <h2>Test Results</h2>
        ${testResults.map(test => `
            <div class="test-item">
                <span class="status ${test.status}">${test.status.toUpperCase()}</span>
                <div class="test-name">
                    <strong>${test.title}</strong>
                    ${test.error ? `<div class="error">Error: ${test.error}</div>` : ''}
                </div>
            </div>
        `).join('')}
    </div>
</body>
</html>`;

    fs.writeFileSync(`${resultsDir}/index.html`, html);

    // Limpar arquivo temporário
    if (fs.existsSync(resultsFile)) {
        fs.unlinkSync(resultsFile);
    }

    console.log('Dashboard generated at results/index.html');
    console.log('JSON results generated at results/test-results.json');
    console.log('JUnit XML generated at results/junit.xml (for Azure DevOps)');
}

module.exports = { generateTestReport, generateDashboard };
