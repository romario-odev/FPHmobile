const fs = require('fs');
require('dotenv').config();
const { generateTestReport, generateDashboard } = require('./utils/reports');

// Ensure JAVA_HOME is set for Appium
if (!process.env.JAVA_HOME) {
    // Try multiple common Java paths for Azure DevOps Windows agents
    const possibleJavaPaths = [
        'C:\\Program Files\\Eclipse Adoptium\\jdk-17.0.8.101-hotspot',
        'C:\\Program Files\\Amazon Corretto\\jdk17.0.21_0',
        'C:\\Program Files\\Java\\jdk-17'
    ];

    for (const javaPath of possibleJavaPaths) {
        if (fs.existsSync(javaPath)) {
            process.env.JAVA_HOME = javaPath;
            console.log(`JAVA_HOME set to: ${javaPath}`);
            break;
        }
    }
}

// Detect if running in Azure DevOps CI
const isCI = process.env.TF_BUILD === 'true';

exports.config = {
    runner: 'local',
    specs: ['./test/specs/**/*.js'],
    exclude: [],
    maxInstances: 1,

    // Appium service configuration
    services: isCI ? [] : [['appium', { command: 'appium', args: { allowCors: true } }]],

    capabilities: [{
        'platformName': 'Android',
        'appium:deviceName': isCI ? 'emulator-5554' : 'emulator-5554',
        'appium:automationName': 'UiAutomator2',
        'appium:app': './app/app-release.apk',
        'appium:appWaitActivity': '*',
        'appium:chromedriverAutodownload': true,
        'appium:noReset': false,
        'appium:autoGrantPermissions': true,
        'appium:udid': '', // Will be auto-detected
        'appium:appPackage': '', // Optional: specify if known
        'appium:appActivity': '', // Optional: specify if known
    }],

    logLevel: isCI ? 'info' : 'info',
    bail: 0,
    waitforTimeout: 10000,
    connectionRetryTimeout: 120000,
    connectionRetryCount: 3,

    framework: 'mocha',
    mochaOpts: {
        ui: 'bdd',
        timeout: 60000
    },

    // Before/After hooks
    onPrepare: function (config, capabilities) {
        console.log('Running in CI:', isCI);
        console.log('JAVA_HOME:', process.env.JAVA_HOME);

        const resultsDir = './results';
        if (!fs.existsSync(resultsDir)) {
            fs.mkdirSync(resultsDir, { recursive: true });
        }

        const dirs = ['screenshots', 'videos', 'reports'];
        dirs.forEach(dir => {
            const path = `${resultsDir}/${dir}`;
            if (!fs.existsSync(path)) {
                fs.mkdirSync(path, { recursive: true });
            } else {
                // Clean old files
                fs.readdirSync(path).forEach(f => {
                    const filePath = `${path}/${f}`;
                    try {
                        fs.unlinkSync(filePath);
                    } catch (e) {
                        // Ignore errors (directory, etc.)
                    }
                });
            }
        });
    },

    beforeSession: function (config, capabilities) {
        console.log('Starting session with capabilities:', JSON.stringify(capabilities, null, 2));
    },

    afterTest: async function(test, context, { error, result, duration, passed, retries }) {
        const timestamp = new Date().getTime();
        const status = passed ? 'passed' : 'failed';
        let screenshotBuffer = null;

        try {
            screenshotBuffer = await driver.takeScreenshot();
        } catch (e) {
            console.error('Failed to take screenshot:', e);
        }

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
        console.log('Test execution completed. Generating dashboard...');
        generateDashboard();
    },

    before: function () {
        global.testLogs = [];
    },

    onFailure: function(failure) {
        console.error('Test suite failed:', failure);
    }
}
