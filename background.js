var selectedId = -1
var tabOldnessMap = {}

function refreshBadge() {
  chrome.tabs.get(selectedId, function (tab){
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
          tabOldnessMap[tab.url] = oldness
          chrome.browserAction.setBadgeText({
            text: oldness,
            tabId: selectedId})
        }
      }
    })
  })
}

chrome.tabs.onUpdated.addListener(function(tabId, props) {
  if (props.status == "complete" && tabId == selectedId)
    refreshBadge()
})

chrome.tabs.onSelectionChanged.addListener(function(tabId, props) {
  selectedId = tabId
  refreshBadge()
})

chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
  selectedId = tabs[0].id
  refreshBadge()
})

chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    if (!sender.tab && tabOldnessMap[request.url]) {
      waybackURL = "http://wayback.archive.org/web/*/" + request.url
      oldness = tabOldnessMap[request.url]
      sendResponse({
        waybackURL: waybackURL,
        oldness: oldness
      })
    }
  }
)
