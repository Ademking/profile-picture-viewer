# Profile Picture Viewer (fixed)

A repaired fork of [Profile Picture Viewer](https://github.com/Ademking/profile-picture-viewer)
by Adem Kouki (MIT, see `LICENSE`). Right-click a Facebook, Instagram or TikTok profile, or click the
toolbar icon, to open the largest version of the profile picture in a new tab.

Version 2.3.0 builds on upstream 2.2.0. The Web Store still ships 2.0.0, and 2.2.0 still calls
`web_profile_info` (404) and `/users/<id>/info/` (429) for Instagram and fetches TikTok from the
background, so both remain broken there.

## Why the original stopped working (checked November 2026)

| Site | Original method | What happens now |
|---|---|---|
| Instagram | `i.instagram.com/api/v1/users/web_profile_info/` from the background | HTTP 404 HTML page, so `res.json()` throws and no tab opens |
| TikTok | Fetch the profile page from the background, regex `avatarLarger` | Gets a 1.5 KB bot-check stub without the data |
| Facebook | Parse the URL, fetch the page for `"userID"`, open the Graph picture URL | ID lookup still works; the parser broke on `/people/…`, `/photo/…` and similar URLs |

## What this version does

The lookup now runs **inside the open tab** (`chrome.scripting.executeScript`), so it uses the
page's own origin and cookies and the sites answer as they do for the page.

- **Instagram**: reads `profile_id` and the page's `fb_dtsg`/`lsd` tokens from the profile page, then
  runs the same GraphQL query instagram.com uses for a profile (`PolarisProfilePageContentQuery`,
  `doc_id 40158838120366999`) to get `hd_profile_pic_url_info` (1080×1080 in testing). Falls back to
  `/api/v1/users/<id>/info/` (currently 429), then to the profile's 150px `og:image`.
  Don't use the page's `profile_pic_url_hd`: it is the **logged-in viewer's** picture, not the profile's.
  If Instagram changes the query, copy the new `doc_id` and `__relay_internal__…` variables from the
  page's own `/api/graphql` request in DevTools.
- **TikTok**: reads `avatarLarger` from the page's `__UNIVERSAL_DATA_FOR_REHYDRATION__` data
  (1080×1080 in testing).
- **Facebook / Messenger**: understands `profile.php?id=`, `/people/<name>/<id>`, `/groups/…/user/<id>`,
  `/friends/…?profile_id=`, chats (`/t/<id>`) and vanity URLs, then opens the Graph picture URL.
- Failures show a short message at the bottom of the page instead of failing silently.
- The `declarativeNetRequest` user-agent rule and the `tabs` permission are no longer needed.

## Install

1. Open `chrome://extensions` and turn on **Developer mode**.
2. Turn off the Web Store "Profile Picture Viewer" so you don't get two menu items.
3. Click **Load unpacked** and pick this folder.
