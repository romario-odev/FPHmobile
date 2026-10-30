module.exports = class Page {
    async waitAndClick(element) {
        await element.waitForDisplayed();
        await element.click();
    }
};
