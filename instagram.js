function get_instagram_profile_picture(url) {

    get_instagram_username(url)
        .then(get_instagram_user_id)
        .then(open_instagram_full_hd_photo)
}


function get_instagram_username(link) {
    return new Promise((resolve, reject) => {
        let regex = /(?<=instagram.com\/)[A-Za-z0-9_.]+/;
        let username = link.match(regex)[0];
        resolve(username);
    });
}

function get_instagram_user_id(username) {
    return new Promise((resolve, reject) => {
        let url = `https://www.instagram.com/${username}/?__a=1`;
        fetch(url)
            .then(res => res.json())
            .then(out => resolve(out.graphql.user.id));
    });
}



function run_header_modification() {

    chrome.webRequest.onBeforeSendHeaders.addListener(
        function (details) {
            for (var header of details.requestHeaders) {
                if (header.name.toLowerCase() === "user-agent") {
                    header.value = "Mozilla/5.0 (Linux; Android 9; GM1903 Build/PKQ1.190110.001; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/75.0.3770.143 Mobile Safari/537.36 Instagram 103.1.0.15.119 Android (28/9; 420dpi; 1080x2260; OnePlus; GM1903; OnePlus7; qcom; sv_SE; 164094539)";
                }
            }
            return { requestHeaders: details.requestHeaders };
        },
        { urls: ["https://i.instagram.com/api/v1/users/*"] },
        ["blocking", "requestHeaders"]
    );
}



function open_instagram_full_hd_photo(instagram_user_id) {

    return new Promise((resolve, reject) => {
        run_header_modification(); // modify header
        let url = `https://i.instagram.com/api/v1/users/${instagram_user_id}/info/`;

        fetch(url).then(res => res.json()).then(out => {
            let url = out.user.hd_profile_pic_url_info.url;
            chrome.tabs.create({ url });
            resolve(url);
        });


    });


}