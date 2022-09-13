const VIDEO_CONTAINER = "div#owner.item.style-scope.ytd-watch-metadata"
const VIDEO_METADATA = "YTD-WATCH-FLEXY"
const VIDEO_ID_ATTR = "video-id"
const WAIT_DELAY = 1000
const WAIT_MAX_ATTEMPTS = 30

// Change href to have '/videos' concatenated at end
const updateHref = (node) => {
    const href = node.getAttribute("href")
    if (href != null && !href.includes("videos")) {
        node.setAttribute("href", `${href}/videos`);
    }
}

// Stop any SPA event handlers and go to intended page
const overrideOnClick = (node) => {
    node.addEventListener("click", e => {
        if (e.ctrlKey || e.metaKey) return;
        e.cancelBubble = true;
        e.preventDefault();
        e.stopPropagation();
        browser.runtime.sendMessage({
            url: "https://www.youtube.com" + node.getAttribute("href")
        });
    }, true);
}

// Change all links related to the content owner
const updateVideoOwnerDetails = (node) => {
    node.querySelectorAll("a[href]").forEach((a) => {
        updateHref(a);
        overrideOnClick(a);
    })
}

// Change details and then observe changes
const observePageChanges = (node) => {
    updateVideoOwnerDetails(node)

    const observer = new MutationObserver((mutations) => {
        for (var mutation of mutations) {
            if (mutation.attributeName === VIDEO_ID_ATTR) {
                updateVideoOwnerDetails(node)
            }
        }
    });

    observer.observe(
        document.querySelector(VIDEO_METADATA),
        { attributeFilter: [VIDEO_ID_ATTR] }
    );
}

// Wait until the element exists and resolve
const waitForElement = (selector) => {
    var attempt = 0
    return new Promise((resolve, reject) => {
        const intervalId = setInterval(() => {
            var el = document.querySelector(selector)
            if (el) { clearInterval(intervalId); resolve(el); }
            else if (attempt >= WAIT_MAX_ATTEMPTS) { reject() }
            else { attempt++ }
        }, WAIT_DELAY);
    });
}

// Main
waitForElement(VIDEO_CONTAINER).then(observePageChanges)