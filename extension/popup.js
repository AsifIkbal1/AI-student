document.addEventListener('DOMContentLoaded', async () => {
  const pageTitle = document.getElementById('pageTitle');
  const pageUrl = document.getElementById('pageUrl');
  const clipBtn = document.getElementById('clipBtn');
  const status = document.getElementById('status');
  const uidInput = document.getElementById('uidInput');

  // Load saved UID
  chrome.storage.local.get(['userUid'], (result) => {
    if (result.userUid) {
      uidInput.value = result.userUid;
    }
  });

  // Get current tab info
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  pageTitle.textContent = tab.title;
  pageUrl.textContent = tab.url;

  clipBtn.addEventListener('click', async () => {
    const uid = uidInput.value.trim();
    if (!uid) {
      status.textContent = "Please enter your User UID from the dashboard.";
      return;
    }

    // Save UID for next time
    chrome.storage.local.set({ userUid: uid });

    status.textContent = "Clipping content...";
    clipBtn.disabled = true;

    try {
      // Inject script to get page content
      const [{ result: content }] = await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: () => {
          // Try to get main article text or selection
          const selection = window.getSelection().toString();
          if (selection) return selection;
          
          // Fallback to main content area
          const main = document.querySelector('main') || document.querySelector('article') || document.body;
          return main.innerText.slice(0, 5000); // Limit to 5000 chars
        }
      });

      const response = await fetch('http://localhost:5000/api/extension/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          uid: uid,
          title: tab.title,
          url: tab.url,
          content: content,
          type: tab.url.includes('youtube.com') ? 'video_summary' : 'article'
        })
      });

      const data = await response.json();
      if (data.success) {
        status.textContent = "✅ Saved to Dashboard!";
      } else {
        status.textContent = "❌ Error: " + (data.error || "Failed to save");
      }
    } catch (err) {
      status.textContent = "❌ Connection failed. Is server running?";
      console.error(err);
    } finally {
      clipBtn.disabled = false;
    }
  });
});
