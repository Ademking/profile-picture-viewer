async function get_tiktok_profile_picture(url) {
  const username = get_tiktok_username(url)
  const profile_picture_url = await get_tiktok_profile_picture_url(username)
  open_tiktok_full_hd_photo(profile_picture_url)
}

function get_tiktok_username(link) {
  let regex = /(?<=tiktok.com\/)@[a-zA-z0-9.]*/
  let username = link.match(regex)[0]
  console.log('TikTok Username: ' + username)
  return username
}

async function get_tiktok_profile_picture_url(username) {
  let url = `https://www.tiktok.com/${username}`
  const response = await fetch(url)
  const html = await response.text()
  let regex = /(?<=avatarLarger":").+?(?=","avatarMedium)/
  let profile_picture_encoded = html.match(regex)[0]
  let profile_picture_url = decodeURIComponent(JSON.parse(`"${profile_picture_encoded}"`))
  console.log(profile_picture_url)
  return profile_picture_url
}

function open_tiktok_full_hd_photo(url) {
  chrome.tabs.create({ url })
}
