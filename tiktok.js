function get_tiktok_profile_picture(url) {
  get_tiktok_username(url)
      .then(get_tiktok_profile_picture_url)
      .then(open_tiktok_full_hd_photo)
      .catch(err => console.error(err));
}

function get_tiktok_username(link) {
  const regex = /(?<=tiktok.com\/)@[a-zA-Z0-9_.]+/;
  const match = link.match(regex);
  if (match) {
      return Promise.resolve(match[0]);
  }
  return Promise.reject(new Error("Invalid TikTok URL."));
}

function get_tiktok_profile_picture_url(username) {
  const url = `https://www.tiktok.com/${username}`;
  return fetch(url)
      .then(response => response.text())
      .then(html => {
          const regex = /(?<=avatarLarger":").+?(?=","avatarMedium)/;
          const match = html.match(regex);
          if (match) {
              return JSON.parse(`"${match[0]}"`);
          }
          throw new Error("Could not extract TikTok Profile Picture URL.");
      });
}

function open_tiktok_full_hd_photo(url) {
  chrome.tabs.create({ url });
}
