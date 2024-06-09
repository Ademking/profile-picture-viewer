async function get_instagram_profile_picture(url) {
  const username = get_instagram_username(url)
  const user_id = await get_instagram_user_id(username)
  await open_instagram_full_hd_photo(user_id)
}

function get_instagram_username(link) {
  let regex = /(?<=instagram.com\/)[A-Za-z0-9_.]+/
  let username = link.match(regex)[0]
  return username
}

async function get_instagram_user_id(username) {
  //let url = `https://www.instagram.com/${username}/?__a=1`;
  let url = `https://i.instagram.com/api/v1/users/web_profile_info/?username=${username}`
  modifiy_headers('Mozilla/5.0 (iPhone; CPU iPhone OS 12_3_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Instagram 105.0.0.11.118 (iPhone11,8; iOS 12_3_1; en_US; en-US; scale=2.00; 828x1792; 165586599)')

  const res = await fetch(url)
  const out = await res.json()
  return out.data.user.id
}

function modifiy_headers(headerStr) {
  chrome.webRequest.onBeforeSendHeaders.addListener(
    function (details) {
      for (var header of details.requestHeaders) {
        if (header.name.toLowerCase() === 'user-agent') {
          header.value = headerStr
        }
      }
      return { requestHeaders: details.requestHeaders }
    },
    { urls: ['https://i.instagram.com/api/v1/users/*'] },
    ['blocking', 'requestHeaders']
  )
}

async function open_instagram_full_hd_photo(instagram_user_id) {
  modifiy_headers('Mozilla/5.0 (Linux; Android 9; GM1903 Build/PKQ1.190110.001; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/75.0.3770.143 Mobile Safari/537.36 Instagram 103.1.0.15.119 Android (28/9; 420dpi; 1080x2260; OnePlus; GM1903; OnePlus7; qcom; sv_SE; 164094539)') // modify header
  let url = `https://i.instagram.com/api/v1/users/${instagram_user_id}/info/`

  const res = await fetch(url)
  const out = await res.json()
  console.log(out)
  let profile_puc_url = out.user.hd_profile_pic_url_info.url
  chrome.tabs.create({ profile_puc_url })
  return profile_puc_url
}
