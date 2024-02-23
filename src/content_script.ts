let instanceUrl = "";

const mastodonRegex = new RegExp(`@[a-zA\-_]{1,30}@([a-zA-Z0-9\\-ßàÁâãóôþüúðæåïçèõöÿýòäœêëìíøùîûñé]{1,63}\\.){1,127}[a-zA-Z]{2,63}`, `gm`);
const looseMastodonRegex = new RegExp(`[a-zA-Z\-_]{1,30}@([a-zA-Z0-9\\-ßàÁâãóôþüúðæåïçèõöÿýòäœêëìíøùîûñé]{1,63}\\.){1,127}[a-zA-Z]{2,63}`, `gm`);
//
const observer = new MutationObserver((mutationList, observer) => {
    for (let mutation of mutationList) {
        if (mutation.target.parentElement !== null) {
            walk(mutation.target.parentElement);
        }
    }
});
const observerConfig = {attributes: false, childList: true, subtree: true};

function walk(node: Node) {
    // I stole this function from here:
    // https://github.com/panicsteve/cloud-to-butt/blob/master/Source/content_script.js

    var child, next;
    if (node instanceof HTMLElement) {
        var tagName = node.tagName ? node.tagName.toLowerCase() : "";
        if (tagName == 'input' || tagName == 'textarea') {
            return;
        }
        if (node.classList && node.classList.contains('masrly_linker')) {
            return;
        }
    }
    switch (node.nodeType) {
        case Node.ELEMENT_NODE:  // Element
        case Node.DOCUMENT_NODE:  // Document
        case Node.DOCUMENT_FRAGMENT_NODE: // Document fragment
            child = node.firstChild;
            while (child) {
                next = child.nextSibling;
                walk(child);
                child = next;
            }
            break;

        case Node.TEXT_NODE: // Text node
            handleText(node);
            break;
    }
}

function handleText(textNode: Node) {
    // Check for text node containing a username with an @ OR a text node contining a username without an @ but where the parent nodes text does (This covers instances where there is multiple text nodes for a single string
    if (textNode.nodeValue?.match(mastodonRegex) || (textNode.nodeValue?.match(looseMastodonRegex) && textNode.parentElement?.innerText.match(mastodonRegex))) {
        textNode.parentElement?.classList.add("masrly_linker");
        const matches = textNode.parentElement?.innerHTML.match(mastodonRegex) ?? [];
        if (textNode.parentElement) {
            for (let match of matches) {
                textNode.parentElement.innerHTML = textNode.parentElement?.innerHTML.replace(mastodonRegex, (match) => `<a href="https://${instanceUrl}/${match.includes(instanceUrl) ? match.replace("@" + instanceUrl, "") : match}"><img style="height: 0.9em;" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAABmJLR0QA/wD/AP+gvaeTAAADJUlEQVRIiaWWT2hcVRTGf9+d6SSpSQptBamKIhYm86YmtLWI2FFEhNZuDVQpBUEXLhRKY4Kr2UmbafcqiCBFTJdiF/4ngmgpVTMzicESTLVSFFsbrZOOvntc5M2bN9OkPMy3uvec737fOffed3miG2Vz+cHq3oxR8qYRiXsxtgEbgcGItQRcB7ss6UfMvpVpuna9OE1ZPimn5KQ4WX3Mi7eBe24yTgNx0XkO18Z2fH6TQTBZf9zkPwB6/5d4G8sy91R9LPg0NthVPrex0Z/7AbRtneJEopeuuT+3/3zk4YYDaAzkDnWLm/gQ70tybovHdgvei3PYu8jtlHNb8L4k+KhjLdy5yfcfAsgCmOlAx2HA9Nzdc/sZHQ2j+RXMDhZO1B3A3NEdzyS4XzA1tS9YHPrExKNtEx0A3shGLQ13tCiVGR0NMVPhZO1ZefXVT59+yzLFl33TiampTLBYeM6cNWaPFE8hhZqslg0+S8iMxB0Itloi0/hn+TxAUKkeNOkdkxEs5jfXxwrHAIYqtVdMdgyDwomqzcKp5Z7e87nmstG+OLcDuGjPehL6zYWJ3deiVva0z0RPtMYOi8fIPQRw4aXtS8CNOAwbYgNBsoF47LFsIjyQ4PS3w0lOB5rJDsJEwlalp0CyUINGbLAe0VvgCkSHjAhbFlrTTMWgUj0XVZNfjWEQv0OC39oGxhIrjxmmNbu5zWBX2vINFpIGVxF3RONsUJl5AcCjIIVWocW3lh4grNY2EJeAoSiXM/T6SjgVSoZKXbGfwuaGN6F1yGI2nVYq1PSve+T7V4d+jw2EfbMaU53X91YwoGbo+b6BGzvrE8HFViILkPF2JpRCg0xylTeedhlXtTAMkO4HNgvLInKG/sBz1TkWnPdnZ8aGf12jyBUUKrUzYPs6k3a8fvSB8ZRdrIrWh4Z3frx7Swy9WDj+3d71GHRclKAyM2HotS6OB85K9hWeyx5556zXzN0H/sEwzD05P57/JZXBikntsGEVYGuaCsPQ5+fHh+dTGwDcdfLLvk02uB/ze7w0IrMiqA/Rg/EXsIj0tQvt/drfxY+7f1WS+A8OnS5q4RlzlAAAAABJRU5ErkJggg==" alt="${match}"></a>&nbsp;${match}`);
            }
        }
    }
}

// @ts-ignore
function restore_options(): void {
    chrome.storage.sync.get({
        instance: 'tny.social'
    }, function (items) {
        instanceUrl = items.instance;
        // Don't run on own server
        if (!location.href.startsWith(`${location.protocol}//${instanceUrl}`)) {
            walk(document.body);
            observer.observe(document.body, observerConfig);
        }
    });
}

restore_options();
