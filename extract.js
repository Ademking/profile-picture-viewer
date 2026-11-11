// Injected into the open tab with chrome.scripting.executeScript, so it must be
// self-contained: no references to anything outside this function.
// Returns { url } on success or { error } on failure (and shows a short toast in the page).
async function extractProfilePicture() {
  const IG_APP_ID = "936619743392459"; // Instagram's public web app id, sent by instagram.com itself
  const FB_TOKEN = "6628568379%7Cc1e620fa708a1d5696fb991c1bde5662"; // from the original extension

  const toast = message => {
    const el = document.createElement("div");
    el.textContent = "Profile Picture Viewer: " + message;
    el.style.cssText =
      "position:fixed;z-index:2147483647;left:50%;bottom:24px;transform:translateX(-50%);" +
      "max-width:90vw;padding:10px 16px;border-radius:8px;background:#222;color:#fff;" +
      "font:14px/1.4 system-ui,sans-serif;box-shadow:0 4px 16px rgba(0,0,0,.35)";
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 5000);
  };
  const fail = message => {
    toast(message);
    return { error: message };
  };
  const segments = () => location.pathname.split("/").filter(Boolean);
  const unescapeJson = s => JSON.parse('"' + s + '"');
  const getText = async (url, init) => {
    const res = await fetch(url, { credentials: "include", ...init });
    return { status: res.status, text: await res.text() };
  };

  // ---------------- Instagram ----------------
  async function instagram() {
    const reserved = ["p", "reel", "reels", "explore", "direct", "accounts", "tv", "about", "legal"];
    let parts = segments();
    if (parts[0] === "stories") parts = parts.slice(1);
    const username = parts[0];
    if (!username || reserved.includes(username)) {
      return fail("open the person's Instagram profile first.");
    }

    const page = await getText(`/${username}/`);
    const html = page.text;
    const id = (html.match(/"profile_id":"(\d+)"/) || html.match(/"profilePage_(\d+)"/) || [])[1];
    // NOTE: the page's "profile_pic_url_hd" is the *logged-in viewer's* picture, not this
    // profile's, so it must not be used. og:image is this profile's picture (150px).
    const ogRaw = (html.match(/<meta property="og:image" content="([^"]+)"/) || [])[1];
    const small = ogRaw ? ogRaw.replace(/&amp;/g, "&") : null;
    const bestOf = user => {
      if (!user || (user.username && user.username.toLowerCase() !== username.toLowerCase())) return null;
      return (user.hd_profile_pic_url_info && user.hd_profile_pic_url_info.url) ||
        (user.hd_profile_pic_versions || []).slice().sort((a, b) => b.width - a.width).map(v => v.url)[0] ||
        null;
    };

    if (id) {
      // 1) The GraphQL query instagram.com runs when it opens a profile (PolarisProfilePageContentQuery).
      //    It needs the page's fb_dtsg + lsd tokens and its full variable set. If Instagram changes
      //    the doc_id or the relay flags, update them from the page's own /api/graphql request.
      const dtsg = (html.match(/"DTSGInitialData",\[\],\{"token":"([^"]+)"/) || [])[1];
      const lsd = (html.match(/"LSD",\[\],\{"token":"([^"]+)"/) || [])[1];
      if (dtsg && lsd) {
        try {
          const variables = {
            enable_integrity_filters: true,
            id,
            __relay_internal__pv__PolarisCannesGuardianExperienceEnabledrelayprovider: true,
            __relay_internal__pv__PolarisCASB976ProfileEnabledrelayprovider: false,
            __relay_internal__pv__PolarisProfileInformTreatmentBannerEnabledrelayprovider: false,
            __relay_internal__pv__PolarisWebSchoolsEnabledrelayprovider: false,
            __relay_internal__pv__PolarisProfileRingsGradientEnabledrelayprovider: true,
            __relay_internal__pv__PolarisRepostsConsumptionEnabledrelayprovider: true,
            __relay_internal__pv__PolarisShortDramaEnabledrelayprovider: true
          };
          const body = new URLSearchParams({
            doc_id: "40158838120366999",
            fb_api_req_friendly_name: "PolarisProfilePageContentQuery",
            variables: JSON.stringify(variables),
            fb_dtsg: dtsg,
            lsd
          });
          const gql = await getText("/api/graphql", {
            method: "POST",
            headers: {
              "Content-Type": "application/x-www-form-urlencoded",
              "X-IG-App-ID": IG_APP_ID,
              "X-FB-LSD": lsd
            },
            body
          });
          const best = bestOf((JSON.parse(gql.text).data || {}).user);
          if (best) return { url: best };
        } catch (e) {
          // try the next method
        }
      }

      // 2) The older REST endpoint (currently answers 429 to web requests, kept in case it returns).
      try {
        const info = await getText(`/api/v1/users/${id}/info/`, { headers: { "X-IG-App-ID": IG_APP_ID } });
        if (info.status === 200) {
          const best = bestOf(JSON.parse(info.text).user);
          if (best) return { url: best };
        }
      } catch (e) {
        // fall through
      }
    }

    // 3) This profile's own small picture.
    if (small) {
      toast("couldn't get the full-size picture; opening the small one.");
      return { url: small };
    }
    return fail("couldn't find this Instagram profile's picture.");
  }

  // ---------------- TikTok ----------------
  async function tiktok() {
    const handle = segments().find(s => s.startsWith("@"));
    if (!handle) return fail("open the person's TikTok profile first.");

    const pick = user => user && (user.avatarLarger || user.avatarMedium || user.avatarThumb);
    const fromHtml = html => {
      const tag = html.match(/<script[^>]+id="__UNIVERSAL_DATA_FOR_REHYDRATION__"[^>]*>([\s\S]*?)<\/script>/);
      if (tag) {
        try {
          const data = JSON.parse(tag[1]).__DEFAULT_SCOPE__["webapp.user-detail"];
          const url = pick(data && data.userInfo && data.userInfo.user);
          if (url) return url;
        } catch (e) {}
      }
      const raw = (html.match(/"avatarLarger":"([^"]+)"/) || [])[1];
      return raw ? unescapeJson(raw) : null;
    };

    const page = await getText(`/${handle}`, { headers: { Accept: "text/html" } });
    const url = fromHtml(page.text);
    if (url) return { url };
    return fail("TikTok didn't return the profile data; reload the page and try again.");
  }

  // ---------------- Facebook / Messenger ----------------
  async function facebook() {
    const url = new URL(location.href);
    const parts = segments();
    const numeric = s => (s && /^\d+$/.test(s) ? s : null);
    let id = null;
    let username = null;

    if (url.pathname === "/profile.php") id = numeric(url.searchParams.get("id"));
    else if (parts[0] === "people") id = numeric(parts[2]);
    else if (parts.includes("friends")) id = numeric(url.searchParams.get("profile_id"));
    else if (parts[0] === "groups" && parts[2] === "user") id = numeric(parts[3]);
    else if (parts.includes("t")) id = numeric(parts[parts.indexOf("t") + 1]);
    else {
      const reserved = ["", "home.php", "photo", "photo.php", "photos", "watch", "reel", "reels", "stories",
        "marketplace", "groups", "events", "pages", "gaming", "notifications", "messages", "search",
        "bookmarks", "saved", "settings", "story.php", "permalink.php", "share"];
      if (parts[0] && !reserved.includes(parts[0])) username = parts[0];
    }

    if (!id && username) {
      if (numeric(username)) id = username;
      else if (location.hostname.endsWith("facebook.com")) {
        const page = await getText(`/${username}`);
        id = (page.text.match(/"userID":"(\d+)"/) || [])[1] || null;
      }
    }
    if (!id) return fail("open the person's Facebook profile (or a chat with them) first.");
    return { url: `https://graph.facebook.com/${id}/picture?width=5000&access_token=${FB_TOKEN}` };
  }

  try {
    const host = location.hostname;
    if (host.endsWith("instagram.com")) return await instagram();
    if (host.endsWith("tiktok.com")) return await tiktok();
    if (host.endsWith("facebook.com") || host.endsWith("messenger.com")) return await facebook();
    return fail("this site isn't supported.");
  } catch (e) {
    return fail("something went wrong (" + e.message + ").");
  }
}
