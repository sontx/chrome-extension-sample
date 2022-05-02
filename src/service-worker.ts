(async function () {
  const tabs = await chrome.tabs.query({});
  const matchedTab = tabs.find((tab) => tab.url.includes("facebook.com"));
  if (matchedTab) {
    const target = { tabId: matchedTab.id };
    try {
      await chrome.debugger.attach(target, "1.2");
      const result = await chrome.debugger.sendCommand(target, "Runtime.evaluate", {
        expression: `
        Array.from(document.querySelectorAll('img')).map(img => img.src).filter(Boolean)
        `,
        returnByValue: true
      }) as {exceptionDetails: any, result: {value: any}};
      if ('exceptionDetails' in result) {
        console.log("Error: ", result.exceptionDetails)
      } else {
        const images = result.result.value as string[];
        images.forEach(async (imageUrl, index) => {
          await chrome.downloads.download({url: imageUrl, filename: `facebook-mages/${index}.jpg`})
        })
      }
    } finally {
      await chrome.debugger.detach(target);
    }
  }
})();
