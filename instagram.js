function get_instagram_profile_picture(url) {
  get_instagram_username(url)
      .then(get_instagram_user_id)
      .then(open_instagram_full_hd_photo)
      .catch(err => console.error(err));
}

function get_instagram_username(link) {
  const regex = /(?<=instagram.com\/)[A-Za-z0-9_.]+/;
  const match = link.match(regex);
  if (match) {
      return Promise.resolve(match[0]);
  }
  return Promise.reject(new Error("Invalid Instagram URL."));
}

function get_instagram_user_id(username) {
  const url = `https://i.instagram.com/api/v1/users/web_profile_info/?username=${username}`;
  return fetch(url, {
      headers: {
          "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 12_3_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Instagram 105.0.0.11.118 (iPhone11,8; iOS 12_3_1; en_US; en-US; scale=2.00; 828x1792; 165586599)"
      }
  })
      .then(res => res.json())
      .then(data => data.data.user.profile_pic_url_hd);
}

function open_instagram_full_hd_photo(picUrl) {
  chrome.tabs.create({ url: picUrl });
}
