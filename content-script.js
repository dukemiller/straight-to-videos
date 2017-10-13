// Change the href of a node to have '/videos' concatenated on it
addToHref = (node) => {
    const href = node.getAttribute("href");
    if (href.indexOf("videos") === -1)
        node.setAttribute("href", href + "/videos");
}

// Stop any SPA event handlers and instead, go to the intended page
changeOnClick = (node) => {
    node.addEventListener("click", e => {
        e.cancelBubble = true;
        e.preventDefault();
        e.stopPropagation();

        browser.runtime.sendMessage({
            url: "https://www.youtube.com" + node.getAttribute("href")
        });

    }, true);
}

// Constantly observe the video url node for changes, update when needed
observeVideoNode = (node) => {
    addToHref(node);
    changeOnClick(node);

    const observer = new MutationObserver(function (mutations) {
        mutations.forEach(function (mutation) {
            addToHref(node);
            changeOnClick(node);
        });
    });

    observer.observe(node, {
        attributes: true
    });
}

// Determine if the node is the correct node we need
isCorrectNode = (node) => {
    return node.nodeName === "A" &&
        node.getAttribute("href") != null &&
        node.getAttribute("href").indexOf("channel/") == 1;
}

// Check for any changes in DOM tree until the one we want exists
observeUntilVideoNodeExists = () => {
    const observer = new MutationObserver(function (mutations) {
        mutations.forEach(function (mutation) {
            if (location.href.indexOf("watch?") === -1 || !mutation.addedNodes)
                return;

            for (var i = 0; i < mutation.addedNodes.length; i++) {
                var node = mutation.addedNodes[i]
                if (isCorrectNode(node)) {
                    observeVideoNode(node);
                    observer.disconnect();
                }
            }
        })
    });

    observer.observe(document.body, {
        childList: true,
        subtree: true,
        attributes: false,
        characterData: false
    })
}

// Main
(function(){
    const node = document.querySelector("#owner-name > a:nth-child(1)");

    // Loaded a page that isn't a video
    if (node == null)
        observeUntilVideoNodeExists();
    else
        observeVideoNode(node);
})()
