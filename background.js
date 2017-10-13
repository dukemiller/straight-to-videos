browser.runtime.onMessage.addListener(message => {
    browser.tabs
        .query({active: true, currentWindow: true})
        .then((tabs) => {
            browser.tabs.update({
                url: message.url
            });
        });
});
