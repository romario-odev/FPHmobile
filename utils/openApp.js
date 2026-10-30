async function openApp() {
    console.log('Opening App...');
    await driver.launchApp();
    await driver.pause(3000);
}

module.exports = { openApp };
