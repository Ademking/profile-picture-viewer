function get_tiktok_profile_picture(url) {
  get_tiktok_username(url).then(get_tiktok_profile_picture_url).then(open_tiktok_full_hd_photo)
}

function get_tiktok_username(link) {
  return new Promise((resolve, reject) => {
    let regex = /(?<=tiktok.com\/)@[a-zA-z0-9.]*/
    let username = link.match(regex)[0]
    console.log('TikTok Username: ' + username)
    resolve(username)
  })
}

function get_tiktok_profile_picture_url(username) {
  return new Promise((resolve, reject) => {
    let url = `https://www.tiktok.com/${username}`
    fetch(url)
      .then(response => {
        return response.text()
      })
      .then(html => {
        let regex = /(?<=avatarLarger":").+?(?=","avatarMedium)/
        let profile_picture_encoded = html.match(regex)[0]
        let profile_picture_url = decodeURIComponent(JSON.parse(`"${profile_picture_encoded}"`))
        console.log(profile_picture_url)
        resolve(profile_picture_url)
      })
      .catch(err => {
        console.log(err)
        reject(err)
      })
  })
}

function open_tiktok_full_hd_photo(url) {
  return new Promise((resolve, reject) => {
    chrome.tabs.create({ url })
    resolve(url)
  })
}
