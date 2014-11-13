var tabOldnessMap = {} // { integer tabId -> string oldness}

function sendRequest(tabId) {
  chrome.tabs.get(tabId, function (tab){
    waybackAPIRequestURL = "http://archive.org/wayback/available?timestamp=19010101&url=" + tab.url
    timeout = 5000 // milliseconds
    $.ajax({
      url: waybackAPIRequestURL,
      dataType: 'json',
      timeout: timeout,
      success: function (ajaxResponse) {
        if (!ajaxResponse.archived_snapshots ||
        !ajaxResponse.archived_snapshots.closest) {
          delete tabOldnessMap[tab.id]
          return
        }
        meta = ajaxResponse.archived_snapshots.closest
        if (meta.available) {
          timestamp = moment(meta.timestamp, "YYYYMMDDhhmmss")
          oldness = timestamp.fromNow()
          tabOldnessMap[tab.id] = oldness
          bgColor = badgeBackgroundColor(timestamp)
          chrome.browserAction.setBadgeBackgroundColor({color: bgColor})
          chrome.browserAction.setBadgeText({
            text: oldness,
            tabId: tabId
          })
        }
      }
    })
  })
}

function badgeBackgroundColor(timestamp) { // CSS RGB color or null
  var now = moment()
  months = now.diff(timestamp, "months", true)
  if (months < 0.2) return [142,142,142,255]
  if (months < 1) return [154,205,231,255]
  if (months < 4) return [234,168,191,255]
  if (months < 12) return [255,238,85,255]
  return [218,80,25,255]
}

// event listeners

chrome.tabs.onUpdated.addListener(function(tabId, props) {
  sendRequest(tabId)
})

chrome.tabs.onRemoved.addListener(function(tabId, props) {
  delete tabOldnessMap[tabId]
})

chrome.tabs.onSelectionChanged.addListener(function(tabId, props) {
  sendRequest(tabId)
})

chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    if (!sender.tab) {
      oldness = tabOldnessMap[request.tabId]
      sendResponse({
        isAvailable: oldness ? true : false,
        oldness: oldness
      })
    }
  }
)

// setup

chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
  sendRequest(tabs[0].id)
})
