# gooses-typing-test

| 📁 Category | 👨‍💻 Creator                                | 📝 Writeup By                           |
| ----------- | ----------------------------------------- | --------------------------------------- |
| Misc        | [virchau13](https://github.com/virchau13) | [Vexcited](https://github.com/Vexcited) |

> This is how it must have felt in the Year of Our Ford. \
> `ssh hexed@challs.watctf.org -p 8022`

## `main.py`

```python
#!/usr/bin/env python3
import sys
assert sys.stdout.isatty()
flag = open("/flag.txt").read().strip()
to_print = flag + '\r' + ('lmao no flag for you ' * 32)
print(to_print)
```

## `Dockerfile`

```dockerfile
FROM alpine:3.14
RUN apk add --update python3 openssh \
    && mkdir -p /build

WORKDIR /build
COPY main.py .

# give hexed empty password
RUN ssh-keygen -f /etc/ssh/ssh_host_ed25519_key -t ed25519 -N ""
RUN adduser -s /build/main.py -D hexed
RUN passwd -d hexed

COPY flag.txt /
CMD /usr/sbin/sshd -D -e -o PermitEmptyPasswords=yes -o PermitRootLogin=no \
        -o HostKey=/etc/ssh/ssh_host_ed25519_key -o PrintMotd=no -o PrintLastLog=no
```

## Solution

As we can see, the `hexed` user is accessible without any password, let's connect to the given SSH.

```terminal
$ ssh hexed@challs.watctf.org -p 8022
lmao no flag for you lmao no flag for you lmao no flag for you lmao no flag for you lmao no flag for you lmao no flag for you lmao no flag for you lmao no flag for you lmao no flag for you lmao no flag for you lmao no flag for you lmao no flag for you lmao no flag for you lmao no flag for you lmao no flag for you lmao no flag for you lmao no flag for you lmao no flag for you lmao no flag for you lmao no flag for you lmao no flag for you lmao no flag for you lmao no flag for you lmao no flag for you lmao no flag for you lmao no flag for you lmao no flag for you lmao no flag for you lmao no flag for you lmao no flag for you lmao no flag for you lmao no flag for you
```

As expected, it runs the `main.py` file and prints
the flag and hides it with `\r` character and prints `lmao no flag for you` 32 times.

We can easily get around this by showing all the characters, even the `\r` ones by not interpreting them. We can do so by using `cat -v` !

```terminal
$ ssh hexed@challs.watctf.org -p 8022 | cat -v
^[P$d7b22686f6f6b223a2022507265496e74657261637469766553534853657373696f6e222c202276616c7565223a207b7d7dM-^\watctf{im_more_of_a_tram_fan_personally}^Mlmao no flag for you lmao no flag for you lmao no flag for you lmao no flag for you lmao no flag for you lmao no flag for you lmao no flag for you lmao no flag for you lmao no flag for you lmao no flag for you lmao no flag for you lmao no flag for you lmao no flag for you lmao no flag for you lmao no flag for you lmao no flag for you lmao no flag for you lmao no flag for you lmao no flag for you lmao no flag for you lmao no flag for you lmao no flag for you lmao no flag for you lmao no flag for you lmao no flag for you lmao no flag for you lmao no flag for you lmao no flag for you lmao no flag for you lmao no flag for you lmao no flag for you lmao no flag for you ^M
```

After some garbage values, we can see our flag!

`watctf{im_more_of_a_tram_fan_personally}`
