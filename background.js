var selectedId = -1;

function refreshBadge() {
  chrome.tabs.get(selectedId, function (tab){
    $.ajax({
      url: "http://archive.org/wayback/available?timestamp=19010101&url=" + tab.url,
      dataType: 'json',
      timeout: 300,
      success: function(data){
        if (!data.archived_snapshots ||
          !data.archived_snapshots.closest) {
          return
        }
        meta = data.archived_snapshots.closest
        //console.log(meta)
        if (meta.available) {
          badgeText = moment(meta.timestamp, "YYYYMMDDhhmmss").fromNow()
          chrome.browserAction.setBadgeText({
            text: badgeText,
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
