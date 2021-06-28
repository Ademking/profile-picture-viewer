/**
 * FB Profile Picture Viewer
 * -------------------
 * See FB user's profile picture in full size
 * -------------------
 * Created By: Adem Kouki
 * FB: https://www.facebook.com/AdemKouki.Officiel/
 * Github: https://github.com/Ademking/fb-profile-picture-viewer
 */

/**
 * Returns Current Tab URL
 */
function get_current_tab_url() {
  return new Promise((resolve, reject) => {
    chrome.tabs.query(
      {
        active: true,
        lastFocusedWindow: true,
      },
      (tabs) => {
        var tab = tabs[0];
        var tab_url = tab.url;
        resolve(tab_url);
      }
    );
  });
}

/**
 * Returns Current User Profile username from URL
 * @param link FB Profile URL
 */
function get_current_username(link) {
  console.log('from extension', link)
  return new Promise((resolve, reject) => {
    const test = new URL(link);
    // If url looks like this:
    // https://facebook.com/friends/suggestions/?profile_id=xxxxxxxxxxxxxxx
    if (test.pathname.includes('/friends/')) {
      resolve(test.searchParams.get("profile_id"));
    } 
    // If url looks like this:
    // https://www.facebook.com/groups/xxxxxxxxxxxxxxxx/user/xxxxxxxxxxxxxxx/
    else if (test.pathname.includes('/groups/') ) {
        resolve(test.pathname.split('/').filter(str => str != "")[3]) 
    }
    else if (test.pathname === "/profile.php") {
      resolve(test.searchParams.get("id"));
    } 
    else {
      resolve(test.pathname);
    }
  });
}

/**
 * Returns Profile ID
 * @param username Username
 */
function get_username_id(username) {
  return new Promise((resolve, reject) => {
    fetch("https://mbasic.facebook.com/" + username)
      .then((response) => {
        return response.text();
      })
      .then((html) => {
        const regex = /owner_id=([a-z0-9\-]+)\&?/i;
        var regex_res = html.match(regex);
        if (regex_res) {
          resolve(regex_res[1]);
        } else {
          alert("Could not extract FB Profile Picture");
          reject(new Error(`Could not extract FB Profile Picture`));
        }
      })
      .catch((err) => {
        alert("Could not extract FB Profile Picture");
        reject(new Error(`Could not extract FB Profile Picture`));
      });
  });
}

/**
 * Get User Access Token
 */
function get_fb_access_token() {
  // Using fb android client token
  return new Promise((resolve, reject) => {
    resolve("6628568379%7Cc1e620fa708a1d5696fb991c1bde5662");
  });
}

/**
 * Opens Full Size Profile Picture using fb access token
 * @param id FB Profile ID
 */
function open_full_hd_photo(id) {
  get_fb_access_token() // Get user access token
    .then((access_token) => {
      window.open(
        `https://graph.facebook.com/${id}/picture?width=5000&access_token=${access_token}`
      );
    });
}

/**
 * When extension started from Context menu
 */
function start() {
  get_current_tab_url()
    .then(get_current_username)
    .then(get_username_id)
    .then(open_full_hd_photo);
}

/**
 * Creates Context Menu
 */
chrome.contextMenus.create({
  title: "Unlock full size profile picture",
  contexts: ["all"],
  onclick: start,
  documentUrlPatterns: ["*://*.facebook.com/*"],
});
