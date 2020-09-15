/**
 * Facebook Profile Picture Viewer V 1.0.0
 * -------------------
 * See Facebook user's profile picture in full size
 * -------------------
 * Created By: Adem Kouki
 * Facebook: https://www.facebook.com/AdemKouki.Officiel/
 * Github: https://github.com/Ademking
 */


// Returns Current Tab URL
function get_current_tab_url() {
    return new Promise((resolve, reject) => {
        chrome.tabs.query({
            active: true,
            lastFocusedWindow: true
        }, tabs => {
            var tab = tabs[0];
            var tab_url = tab.url;
            resolve(tab_url);
        });
    });
}

/**
 * Returns Current User Profile username from URL
 * @param link Facebook Profile URL
 */
function get_current_username(link) {
    return new Promise((resolve, reject) => {
        const test = new URL(link);
        if (test.pathname === "/profile.php") {
            resolve(test.searchParams.get("id"));
        } else {
            resolve(test.pathname);
        }
    })
}

/**
 * Returns Profile ID
 * @param username Username
 */
function get_username_id(username) {
    return new Promise((resolve, reject) => {
        fetch('https://mbasic.facebook.com/' + username).then(response => {
            return response.text();
        }).then(html => {
            const regex = /\?owner_id=([a-z0-9\-]+)\&?/i;
            var regex_res = html.match(regex);
            if (regex_res) {
                resolve(regex_res[1])
            } else {
                alert("Could not extract Facebook Profile Picture")
                reject(new Error(`Could not extract Facebook Profile Picture`));
            }
        }).catch(err => {
            alert("Could not extract Facebook Profile Picture")
            reject(new Error(`Could not extract Facebook Profile Picture`));
        });
    })
}

/**
 * Opens Full Size Profile Picture
 * @param id FB Profile ID
 */
function open_full_hd_photo(id) {
    window.open(`https://graph.facebook.com/${id}/picture?width=1000`)
}

/**
 * Start Function
 */
function start() {
    get_current_tab_url().then(get_current_username).then(get_username_id).then(open_full_hd_photo);
}

/**
 * Creates Context Menu
 */
chrome.contextMenus.create({
    title: 'Unlock full size profile picture',
    contexts: ['all'],
    onclick: start,
    documentUrlPatterns: ["*://*.facebook.com/*"]
});
