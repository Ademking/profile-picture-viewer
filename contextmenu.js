/**
 * Profile Picture Viewer
 * See FB / Instagram / TikTok user's profile picture in full size
 * -------------------
 * Created By: Adem Kouki
 * FB: https://www.facebook.com/AdemKouki.Officiel/
 */

// Create context menu
chrome.contextMenus.create({
  title: 'Open Full-Size Profile Picture',
  contexts: ['all'],
  onclick: () => {
    get_current_tab_url().then(url => {
      // facebook
      if (url.includes('facebook.com') || url.includes('messenger.com')) {
        get_facebook_profile_picture(url)
      }
      // Instagram
      else if (url.includes('instagram.com')) {
        get_instagram_profile_picture(url)
      }
      // Tiktok
      else if (url.includes('tiktok.com')) {
        get_tiktok_profile_picture(url)
      } else {
        alert('Could not extract Profile Picture')
      }
    })
  },
  documentUrlPatterns: ['*://*.facebook.com/*', '*://*.messenger.com/*', '*://*.instagram.com/*', '*://*.tiktok.com/*']
})
