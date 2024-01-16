browser.menus.create({
    id:"bookmarker",
    title: "Bookmark this tab",
    contexts: ["bookmark"]
});

// implement either onClicked listener - e.g. below - or use default action
// onClicked listener preferred as no default action

async function bookmarker(tabs, info) {
    let tab = tabs[0]
    console.log(`Tab is: ${tab.title}`)

    // determine parentId - will need to use "type" to work out whether to use id or parentId as id.
    const origin = await browser.bookmarks.get(info.bookmarkId)
    const type = origin[0].type
    console.log(`Origin is ${origin[0].title} and type is ${type}`)

    let parent  
    if (type === "folder") { // if folder, we can use bookmarkId directly
        parent = info.bookmarkId
        console.log(`Type = folder, so we can use standard id, which here is ${parent} taken from ${info.bookmarkId}`)
    } else {
        parent = await getParentId(info.bookmarkId)
        console.log(`Type is not folder, therefore retrieve parent, which is ${parent}`)
    }

    // create bookmark details object, then create book mark [bookmark details are: parentId, title, url]
    let details = {title: tab.title, url: tab.url, parentId: parent}

    browser.bookmarks.create(details).then(bookmark => {
        console.log(`Bookmark created ${bookmark}\n with details ${details}`)
    })
}

async function getParentId(childId) {
    console.log(`childId is ${childId}`)
    let node = await browser.bookmarks.get(childId)
    console.log(node)
    return node[0].parentId
}

browser.menus.onClicked.addListener((bookmarkInfo) => {
    let info = bookmarkInfo
    console.log(info.bookmarkId)
    let queryObj = {currentWindow: true, active: true}
    browser.tabs.query(queryObj)
        .then(tabs => bookmarker(tabs, info))
        .catch(error => console.error(error))
});
