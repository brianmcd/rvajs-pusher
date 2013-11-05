# Pusher Demo

This is a simple chat app built with Pusher, Angular, and Express.

Check it out: http://rvajs-pusher.herokuapp.com/

# Getting it running

* Create a config.json file that looks like:

```javascript
{
  "COOKIE_SESSION_SECRET": "a session secret",
  "PUSHER_APP_ID": "your pusher app id",
  "PUSHER_KEY": "your pusher key",
  "PUSHER_SECRET": "your pusher secret"
}
```

* Replace the app id in public/scripts/app.js with your app id.

```javascript
var pusher = new Pusher('YOUR APP ID');
```

* `npm install`
* `node app`
