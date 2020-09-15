# Facebook Profile Picture Viewer

<p align="center">
    <img src="https://i.imgur.com/B9rUuLJ.png">
</p>

Bypass the Facebook profile picture guard and see user's profile picture in __full size__ 📷

### How to Install:

0. Download this repository
1. Navigate to **chrome://extensions/** 
2. Ensure the checkbox labeled **Developer mode** is enabled. 
3. Click the button labeled **Load unpacked extension...**
4. Select the directory 

### How To Use

0. Open victim's profile
1. Right-Click and Select "Unlock full size profile picture"

### How does this extension works

The trick is simple : 

1. Get Facebook User ID
2. Fetch "mbasic.facebook.com/USERNAME" and search for Profile id
3. Replace "PROFILE_ID" in below URI : " http://graph.facebook.com/PROFILE_ID/picture?width=2000"

### Note

I highly recommend to not use these kinds of tricks to find and view private profile pictures, because all people like to maintain some privacy and they don't want others to disclose their privacy.
