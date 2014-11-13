chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
  tab = tabs[0]
	chrome.runtime.sendMessage({url: tab.url}, function(response) {
	  $("#oldness").text(response.oldness)
    $("#waybackLink").attr("href", response.waybackURL)
	});
})
