var tabOldnessMap = {} // { integer tabId -> string oldness}

function refreshBadge(tabId) {
  chrome.tabs.get(tabId, function (tab){
    waybackAPIRequestURL = "http://archive.org/wayback/available?timestamp=19010101&url=" + tab.url
    timeout = 1000 // milliseconds
    $.ajax({
      url: waybackAPIRequestURL,
      dataType: 'json',
      timeout: timeout,
      success: function(data){
        if (!data.archived_snapshots ||
          !data.archived_snapshots.closest) {
          return
        }
        meta = data.archived_snapshots.closest
        if (meta.available) {
          oldness = moment(meta.timestamp, "YYYYMMDDhhmmss").fromNow()
          tabOldnessMap[tab.id] = oldness
          chrome.browserAction.setBadgeText({
            text: oldness,
            tabId: tabId})
        }
      }
    })
  })
}

// event listeners

chrome.tabs.onRemoved.addListener(function(tabId, props) {
  delete tabOldnessMap[tabId]
})

chrome.tabs.onSelectionChanged.addListener(function(tabId, props) {
  refreshBadge(tabId)
})

chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    if (!sender.tab && tabOldnessMap[request.tabId]) {
      oldness = tabOldnessMap[request.tabId]
      sendResponse({
        oldness: oldness
      })
    }
  }
)

// setup

chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
  refreshBadge(tabs[0].id)
})
