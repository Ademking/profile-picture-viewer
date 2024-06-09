/**
 * get facebook profile picture from url
 * @param url
 */
export async function get_facebook_profile_picture(url) {
  const current_username = get_current_username(url)
  const username_id = await get_username_id(current_username)
  open_full_hd_photo(username_id)
}

/**
 * Returns Current User Profile username from URL
 * @param link FB Profile URL
 */
function get_current_username(link) {
  const test = new URL(link)
  // If url looks like this:
  // https://facebook.com/friends/suggestions/?profile_id=xxxxxxxxxxxxxxx
  if (test.pathname.includes('/friends/')) {
    return test.searchParams.get('profile_id')
  }
  // If url looks like this:
  // https://www.facebook.com/groups/xxxxxxxxxxxxxxxx/user/xxxxxxxxxxxxxxx/
  else if (test.pathname.includes('/groups/')) {
    return test.pathname.split('/').filter(str => str != '')[3]
    // If url looks like this:
    // https://www.messenger.com/t/xxxxxxxxxxxxxxxx
  } else if (test.pathname.includes('/t/')) {
    return test.pathname.split('/').filter(str => str != '')[1]
  } else if (test.pathname === '/profile.php') {
    return test.searchParams.get('id')
  } else {
    return test.pathname
  }
}

/**
 * Returns Profile ID
 * @param username Username
 */
async function get_username_id(username) {
  try {
    const response = await fetch('https://mbasic.facebook.com/' + username)
    const html = await response.text()
    const regex = /owner_id=([a-z0-9\-]+)\&?/i
    var regex_res = html.match(regex)
    if (regex_res) {
      return regex_res[1]
    } else {
      alert('Could not extract FB Profile Picture')
      throw new Error(`Could not extract FB Profile Picture`)
    }
  } catch (error) {
    alert('Could not extract FB Profile Picture')
    throw new Error(`Could not extract FB Profile Picture`)
  }
}

/**
 * Opens Full Size Profile Picture using fb access token
 * @param id FB Profile ID
 */
function open_full_hd_photo(id) {
  chrome.tabs.create({url: `https://graph.facebook.com/${id}/picture?width=5000&access_token=${fb_access_token}`})
}

/**
 * Get User Access Token
 */
const fb_access_token =
  // Using fb android client token
  '6628568379%7Cc1e620fa708a1d5696fb991c1bde5662'
