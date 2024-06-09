/**
 * Profile Picture Viewer
 * See FB / Instagram / TikTok user's profile picture in full size
 * -------------------
 * Created By: Adem Kouki
 * FB: https://www.facebook.com/AdemKouki.Officiel/
 */

import { get_facebook_profile_picture } from './facebook.js'
import { get_instagram_profile_picture } from './instagram.js'
import { get_tiktok_profile_picture } from './tiktok.js'

async function get_profile_picture(url) {
  // facebook
  if (url.includes('facebook.com') || url.includes('messenger.com')) {
    await get_facebook_profile_picture(url)
  }
  // Instagram
  else if (url.includes('instagram.com')) {
    await get_instagram_profile_picture(url)
  }
  // Tiktok
  else if (url.includes('tiktok.com')) {
    await get_tiktok_profile_picture(url)
  } else {
    alert('Could not extract Profile Picture')
  }
}

const open_full_size_profile_picture_id = 'open_full_size_profile_picture'

chrome.runtime.onInstalled.addListener(_ => {
  // Create context menu
  chrome.contextMenus.create({
    title: 'Open Full-Size Profile Picture',
    contexts: ['all'],
    id: open_full_size_profile_picture_id,
    documentUrlPatterns: ['*://*.facebook.com/*', '*://*.messenger.com/*', '*://*.instagram.com/*', '*://*.tiktok.com/*']
  })
})

chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (info.menuItemId === open_full_size_profile_picture_id) {
    await get_profile_picture(tab.url)
  }
})
