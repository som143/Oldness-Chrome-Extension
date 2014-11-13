chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
  tab = tabs[0]
	chrome.runtime.sendMessage({tabId: tab.id}, function(response) {
	  $("#oldness").text(response.oldness)
    $("#waybackLink").attr("href", "http://wayback.archive.org/web/*/" + tab.url)
	})
})
