export async function get_instagram_profile_picture(url) {
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

  const out = await run_with_user_agent_change(async () => await (await fetch(url)).json())
  return out.data.user.id
}

const user_agent_ruleset_id = 'instagram-set-user-agent'

async function run_with_user_agent_change(f) {
  await chrome.declarativeNetRequest.updateEnabledRulesets({
    enableRulesetIds: [user_agent_ruleset_id]
  })
  try {
    return await f()
  } finally {
    await chrome.declarativeNetRequest.updateEnabledRulesets({
      disableRulesetIds: [user_agent_ruleset_id]
    })
  }
}


async function open_instagram_full_hd_photo(instagram_user_id) {
  let url = `https://i.instagram.com/api/v1/users/${instagram_user_id}/info/`

  const out = await run_with_user_agent_change(async () => await (await fetch(url)).json())
  console.log(out)
  let profile_puc_url = out.user.hd_profile_pic_url_info.url
  chrome.tabs.create({ profile_puc_url })
}
