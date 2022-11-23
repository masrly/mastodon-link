const mastodonRegex = new RegExp(`@[a-zA-Z]{1,30}@[a-zA-Z0-9\\-ßàÁâãóôþüúðæåïçèõöÿýòäœêëìíøùîûñé]{1,63}\\.[a-zA-Z]{2,63}`);

const mutationCallback = (mutationList, observer) => {
    console.log(mutationList);
    walk(document.body);
};
//
const observer = new MutationObserver(mutationCallback);
const observerConfig = {attributes: false, childList: true, subtree: true};


walk(document.body);

function walk(node)
{
    // I stole this function from here:
    // https://github.com/panicsteve/cloud-to-butt/blob/master/Source/content_script.js

    var child, next;

    var tagName = node.tagName ? node.tagName.toLowerCase() : "";
    if (tagName == 'input' || tagName == 'textarea') {
        return;
    }
    if (node.classList && node.classList.contains('masrly_linker')) {
        return;
    }

    switch ( node.nodeType )
    {
        case 1:  // Element
        case 9:  // Document
        case 11: // Document fragment
            child = node.firstChild;
            while ( child )
            {
                next = child.nextSibling;
                walk(child);
                child = next;
            }
            break;

        case 3: // Text node
            handleText(node);
            break;
    }
}

function handleText(textNode)
{
    if(textNode.nodeValue.match(mastodonRegex)) {
        textNode.parentNode.classList.add("masrly_linker");
        textNode.parentNode.innerHTML = textNode.parentNode.innerHTML.replace(mastodonRegex, (match) => `<a href="https://tny.social/${match}">${match}</a>`);
    }
}

observer.observe(document.body, observerConfig);