/**
 * get twitter profile picture from url
 * @param url
 */
function get_twitter_profile_image(url) {
    get_twitter_username(url).then(get_twitter_profile_image_url).then(get_original_image_url).then(open_original_image)
}


function get_twitter_username(url) {
  return new Promise((resolve, reject) => {
    let regex = /(?<=twitter.com\/)[A-Za-z0-9_.]{4,15}/;
    let username = url.match(regex)[0];
    if (username) {
        resolve(username)
    } else {
        alert('Could not extract Twitter Profile Picture')
        reject(new Error("Could not extract Twitter Profile Picture"))
    }
    resolve(username);
  });
}

/**
 * Return
 * @param username
 */
function get_twitter_profile_image_url(username) {
  return new Promise((resolve, reject) => {
    let twitter_api =
      "https://twitterprofilepictureapi-2n62xopsxa-as.a.run.app/";
    fetch(twitter_api + username)
      .then((response) => {
        return response.text();
      })
      .then((html) => {
        let account_object = JSON.parse(html);
        let profile_image_url = account_object["profile_image_url"];
        resolve(profile_image_url)
      }).catch(_ => {
        alert('Could not extract Twitter Profile Picture')
        reject(new Error("Could not extract Twitter Profile Picture"))
      });
  });
}

/**
 * remove _normal to get original size of profile image
 * @param url
*/
function get_original_image_url(url) {
    const regex = /_normal/;
    let original_profile_image_url = url.replace(regex, "");
    return original_profile_image_url
}


function open_original_image(url) {
    window.open(url)
}