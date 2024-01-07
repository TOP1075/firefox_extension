browser.menus.create({
    id:"bookmarker",
    title: "Bookmark this tab",
    contexts: ["bookmark"]
});

// implement either onClicked listener - e.g. below - or use default action
// onClicked listener preferred as no default action

function bookmarker(tabs, pId) {
    let tab = tabs[0]
    console.log(`Tab is: ${tab}`)
    
    // determine parentId - will need to use "type" to work out whether to use id or parentId as id.
    // create bookmark details object, then create book mark [bookmark details are: parentId, title, url]
    let details = {title: tab.title, url: tab.url, parentId: pId}   

    let bookmark = browser.bookmarks.create(details)
    console.log(`Bookmark created ${bookmark}\n with details ${details}`)
}

function location(info) {

    let origin = browser.bookmarks.get(info.bookmarkId)
    let type = origin.BookmarkTreeNodeType
    console.log(`Origin is ${origin} and type is ${type}`)
    let pId
    
    if (type === "folder") { // if folder, we can use bookmarkId directly
       pId = info.bookmarkId
    } else { // otherwise call parentId
        pId = getParentId(info.bookmarkId)
    }

    return pId
}

function getParentId(childId) {

    function findParentId(tree) {
        for (node in tree) {
            console.log(`Current node is ${node}`)
            if (node.id == childId) {
                return node.parentId 
            }
        }
        return console.error
    }
    return browser.bookmarks.getTree().then(findParentId, console.error)
}

browser.menus.onClicked.addListener((info) => {
    console.log(info.bookmarkId)
    let parentId = location(info)
    let queryObj = {currentWindow: true, active: true}
    tabs = browser.tabs.query(queryObj).then(function(value) {
        bookmarker(value, parentId)
    })
});

// going to need to use bookmarkId to locate where to place new bookmark:
// (1) if id is for folder, place in folderxc
// (2) if id is for bookmark, get parent folder and place there
// (3) if "toolbar__" place on toolbar