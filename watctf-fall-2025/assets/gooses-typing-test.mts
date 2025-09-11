const init = (await fetch("http://challs.watctf.org:3050/randomPayload").then(
  (res) => res.json()
)) as {
  payload: string;
  seed: string;
};

const startPoint = Date.now();
const typed = init.payload.split("").map((chr, index) => ({
  key: chr,
  time: startPoint + index * 10,
}));

const reply = await fetch("http://challs.watctf.org:3050/doneTest", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    seed: init.seed,
    typed,
    startPoint,
  }),
}).then((res) => res.json());

console.log(reply);
