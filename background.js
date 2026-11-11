// Profile Picture Viewer (fixed)
//
// The original extension fetched profile data from the background service worker.
// That broke because:
//   - Instagram retired /api/v1/users/web_profile_info/ (it now returns an HTML 404 page),
//   - TikTok serves a bot-check stub to requests without the tab's cookies,
//   - the Facebook URL parser only understood a few URL shapes.
// This version runs the lookup inside the open tab (same origin, same cookies as the page),
// so the sites answer the way they answer the page itself.

importScripts("extract.js");

const MENU_ID = "openFullSizeProfilePicture";
const SITES = [
  "*://*.facebook.com/*",
  "*://*.messenger.com/*",
  "*://*.instagram.com/*",
  "*://*.tiktok.com/*"
];

chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.removeAll(() => {
    chrome.contextMenus.create({
      id: MENU_ID,
      title: "Open Full-Size Profile Picture",
      contexts: ["all"],
      documentUrlPatterns: SITES
    });
  });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === MENU_ID && tab) openProfilePicture(tab);
});

chrome.action.onClicked.addListener(tab => openProfilePicture(tab));

async function openProfilePicture(tab) {
  if (!tab || !tab.id) return;
  let result;
  try {
    const [injection] = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: extractProfilePicture
    });
    result = injection && injection.result;
  } catch (err) {
    // Not one of the supported sites, or the page can't be scripted.
    console.error("Profile Picture Viewer:", err);
    return;
  }

  if (result && result.url) {
    chrome.tabs.create({ url: result.url, index: tab.index + 1, openerTabId: tab.id });
  } else {
    console.error("Profile Picture Viewer:", result && result.error);
  }
}
