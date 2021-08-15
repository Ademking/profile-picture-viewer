/**
 * Profile Picture Viewer
 * See FB / Instagram user's profile picture in full size
 * -------------------
 * Created By: Adem Kouki
 * FB: https://www.facebook.com/AdemKouki.Officiel/
 * Github: https://github.com/Ademking/fb-profile-picture-viewer
 */

// Create context menu
chrome.contextMenus.create({
  title: "Open Full-Size Profile Picture",
  contexts: ["all"],
  onclick: () => {
    get_current_tab_url().then((url) => {
      // facebook
      if (url.includes("facebook.com")) {
        get_facebook_profile_picture(url);
      }
      // Instagram
      else if (url.includes("instagram.com")) {
        get_instagram_profile_picture(url);
      }
      else {
        alert("Could not extract Profile Picture");
      }
    })
  },
  documentUrlPatterns: ["*://*.facebook.com/*", "*://*.instagram.com/*"],
});
