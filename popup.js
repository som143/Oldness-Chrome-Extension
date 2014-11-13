var tab;

function refreshPoup() {
  $("#waybackLink").attr("href", "http://wayback.archive.org/web/*/" + tab.url)
  chrome.runtime.sendMessage({tabId: tab.id}, function(response) {
    if (response.isAvailable) {
      $("#oldness").text(response.oldness)
    } else {
      $("#oldness").text("Not Available")
    }
  })
}

// setup

chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    tab = tabs[0]
    refreshPoup()
})

chrome.tabs.onUpdated.addListener(function(tabId, props) {
  if (tabId == tab.id) {
    refreshPoup()
  }
})
