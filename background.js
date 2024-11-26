importScripts("facebook.js", "instagram.js", "tiktok.js");

chrome.runtime.onInstalled.addListener(() => {
    // Create the context menu
    chrome.contextMenus.create({
        id: "openFullSizeProfilePicture",
        title: "Open Full-Size Profile Picture",
        contexts: ["all"],
        documentUrlPatterns: [
            "*://*.facebook.com/*",
            "*://*.messenger.com/*",
            "*://*.instagram.com/*",
            "*://*.tiktok.com/*"
        ]
    });
});

// Handle context menu click
chrome.contextMenus.onClicked.addListener((info, tab) => {
    if (info.menuItemId === "openFullSizeProfilePicture") {
        get_current_tab_url().then(url => {
            if (url.includes("facebook.com") || url.includes("messenger.com")) {
                get_facebook_profile_picture(url);
            } else if (url.includes("instagram.com")) {
                get_instagram_profile_picture(url);
            } else if (url.includes("tiktok.com")) {
                get_tiktok_profile_picture(url);
            } else {
                alert("Could not extract Profile Picture");
            }
        });
    }
});

// Helper function: Get the current tab's URL
function get_current_tab_url() {
    return new Promise((resolve, reject) => {
        chrome.tabs.query(
            {
                active: true,
                lastFocusedWindow: true
            },
            tabs => {
                const tab = tabs[0];
                if (tab && tab.url) {
                    resolve(tab.url);
                } else {
                    reject(new Error("No active tab found"));
                }
            }
        );
    });
}
