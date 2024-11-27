function get_facebook_profile_picture(url) {
  get_current_username(url)
      .then(get_username_id)
      .then(open_full_hd_photo)
      .catch(err => console.error(err));
}

function get_current_username(link) {
  return new Promise((resolve, reject) => {
      const test = new URL(link);
      if (test.pathname.includes("/friends/")) {
          resolve(test.searchParams.get("profile_id"));
      } else if (test.pathname.includes("/groups/")) {
          resolve(test.pathname.split("/").filter(str => str !== "")[3]);
      } else if (test.pathname.includes("/t/") && !test.pathname.includes("/e2ee/")) {
          resolve(test.pathname.split("/").filter(str => str !== "")[1]);
      } else if (test.pathname === "/profile.php") {
          resolve(test.searchParams.get("id"));
      } else {
          resolve(test.pathname.replace("/", ""));
      }
  });
}

function get_username_id(username) {
  return fetch(`https://m.facebook.com/${username}`)
      .then(response => response.text())
      .then(html => {
          const regex = /"userID":"(\d+)"/;
          const match = html.match(regex);
          if (match) {
              return match[1];
          }
          throw new Error("Could not extract Facebook Profile ID.");
      });
}

function open_full_hd_photo(id) {
  const accessToken = "6628568379%7Cc1e620fa708a1d5696fb991c1bde5662";
  const url = `https://graph.facebook.com/${id}/picture?width=5000&access_token=${accessToken}`;
  chrome.tabs.create({ url });
}
