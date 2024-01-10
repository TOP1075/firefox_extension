browser.menus.create({
    id:"bookmarker",
    title: "Bookmark this tab",
    contexts: ["bookmark"]
});

// implement either onClicked listener - e.g. below - or use default action
// onClicked listener preferred as no default action

function bookmarker(tabs, info) {
    let tab = tabs[0]
    console.log(`Tab is: ${tab.title}`)

    // determine parentId - will need to use "type" to work out whether to use id or parentId as id.
    browser.bookmarks.get(info.bookmarkId).then(origin => {
        let type = origin[0].type
        console.log(`Origin is ${origin[0].title} and type is ${type}`)

        let parent  
        if (type === "folder") { // if folder, we can use bookmarkId directly
           parent = info.bookmarkId
           console.log(`Type = folder, so we can use standard id, which here is ${parent} taken from ${info.bookmarkId}`)
        } else {
            parent = getParentId(info.bookmarkId)
        }
    })

    // create bookmark details object, then create book mark [bookmark details are: parentId, title, url]
    let details = {title: tab.title, url: tab.url, parentId: parent}

    browser.bookmarks.create(details).then(bookmark => {
        console.log(`Bookmark created ${bookmark}\n with details ${details}`)
    })
}



// get parent id needs to use the id of a bookmark find it's parent folder
// to do this, recursively search through the tree
// if an entity has children, for each child call this function, then check if the childId matches our target
// if it matches, return the current node.id

function getParentId(childId) {
    browser.bookmarks.getTree().then(tree => { // NB getTree returns the ROOT NODE (i.e. the origin BookmarkTreeNode) - not the whole tree
       return findChild(childId, tree)
    })
}

function findChild(target, node) {
    if (node.children) {
        for (const child of node.children) {
            findChild(target, node)
            if (child.id == target) {
                return node.id
            }
        }
        
    }
}

browser.menus.onClicked.addListener((bookmarkInfo) => {
    let info = bookmarkInfo
    console.log(info.bookmarkId)
    let queryObj = {currentWindow: true, active: true}
    browser.tabs.query(queryObj)
        .then(tabs => bookmarker(tabs, info))
        .catch(error => console.error(error))
});
