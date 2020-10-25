/**
 * Facebook Profile Picture Viewer v1.0.1
 * -------------------
 * See Facebook user's profile picture in full size
 * -------------------
 * Created By: Adem Kouki
 * Facebook: https://www.facebook.com/AdemKouki.Officiel/
 * Github: https://github.com/Ademking/fb-profile-picture-viewer
 */


/**
 * Returns Current Tab URL
 */
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
 * Get User Access Token
 */
function get_fb_access_token() {
    return new Promise((resolve, reject) => {
        fetch("https://m.facebook.com/composer/ocelot/async_loader/?publisher=feed")
            .then(response => {
                return response.text();
            })
            .then(code => {
                const regex = /accessToken\\":\\"(.*?)\\"/;
                var regex_res = code.match(regex);
                if (regex_res) {
                    resolve(regex_res[1])
                } else {
                    alert("Could not get your facebook access token. Please check if you're logged in")
                    reject(new Error(`Could not get your facebook access token. Please check if you're logged in`));
                }
            })
            .catch(err => {
                alert("Could not get your facebook access token. Please check if you're logged in")
                reject(new Error(`Could not get your facebook access token. Please check if you're logged in`));
            });
    })
}



/**
 * Opens Full Size Profile Picture using fb access token
 * @param id FB Profile ID
 */
function open_full_hd_photo(id) {

    get_fb_access_token() // Get user access token
    .then(access_token => {
        window.open(`https://graph.facebook.com/${id}/picture?width=5000&access_token=${access_token}`);
    })

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
    title: 'Unlock full size profile picture',
    contexts: ['all'],
    onclick: start,
    documentUrlPatterns: ["*://*.facebook.com/*"]
});