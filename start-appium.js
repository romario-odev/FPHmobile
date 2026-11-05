const { spawn } = require('child_process');
const path = require('path');

console.log('Starting Appium server...');

const appium = spawn('npx', ['appium', '--allow-cors'], {
    stdio: 'inherit',
    shell: true
});

appium.on('error', (err) => {
    console.error('Failed to start Appium:', err);
    process.exit(1);
});

appium.on('exit', (code) => {
    console.log(`Appium exited with code ${code}`);
});

// Keep process alive
process.on('SIGINT', () => {
    console.log('Stopping Appium...');
    appium.kill();
    process.exit();
});

// Wait a bit to ensure Appium started
setTimeout(() => {
    console.log('Appium should be ready now. You can start your tests.');
}, 5000);
