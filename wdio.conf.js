const fs = require('fs');
const { generateTestReport, generateDashboard } = require('./utils/reports');

exports.config = {
    runner: 'local',
    specs: ['./test/specs/**/*.js'],
    exclude: [],
    maxInstances: 1,
    services: [['appium', { command: 'appium', args: { allowCors: true } }]],
    capabilities: [{
        'platformName': 'Android',
        'appium:deviceName': 'Pixel_7a',
        'appium:automationName': 'UiAutomator2',
        'appium:app': './app/seuapp.apk',
        'appium:appWaitActivity': '*',
        'appium:chromedriverAutodownload': true,
        'appium:noReset': false,
        'appium:autoGrantPermissions': true,
    }],
    logLevel: 'info',
    bail: 0,
    waitforTimeout: 10000,
    connectionRetryTimeout: 120000,
    connectionRetryCount: 3,
    framework: 'mocha',
    mochaOpts: {
        ui: 'bdd',
        timeout: 60000
    },
    onPrepare: function (config, capabilities) {
        const resultsDir = './results';
        if (fs.existsSync(resultsDir)) {
            const dirs = ['screenshots', 'videos', 'reports'];
            dirs.forEach(dir => {
                const path = `${resultsDir}/${dir}`;
                if (fs.existsSync(path)) {
                    fs.readdirSync(path).forEach(f => fs.unlinkSync(`${path}/${f}`));
                }
            });
        }
    },
    afterTest: async function(test, context, { error, result, duration, passed, retries }) {
        const timestamp = new Date().getTime();
        const status = passed ? 'passed' : 'failed';
        let screenshotBuffer = null;
        try {
            screenshotBuffer = await driver.takeScreenshot();
        } catch (e) {}
        
        generateTestReport({
            test,
            status,
            timestamp,
            screenshotBuffer: screenshotBuffer ? Buffer.from(screenshotBuffer, 'base64') : null,
            pageSource: await driver.getPageSource(),
            logs: global.testLogs || [],
            context: { error }
        });
    },
    onComplete: function() {
        generateDashboard();
    },
    before: function () {
        global.testLogs = [];
    }
}
