# Piecryption

| 📁 Category     | 👨‍💻 Creator | 📝 Writeup By                           |
| --------------- | ---------- | --------------------------------------- |
| Crypto (Medium) | mannug     | [Vexcited](https://github.com/Vexcited) |

> pie p piee p pieee pieeeeeee pi pieeee pieee pie pieee

## `challenge.py`

```python
import random
from secret import FLAG

N = 10**8
assert len(FLAG) == 38
digits = open('pi-100m.txt').read().strip()[2:]
offset= random.randint(0,N)
encoded = str(int.from_bytes(FLAG))
ciphertext = []
for e in encoded:
  for i in range(offset,N):
    if digits[i] == str(e):
      ciphertext.append(i-offset)
      offset = i
      break
  else:
    raise Exception("UnSufficient Digits!")

print("ciphertext = ", ciphertext)
```

## `out.txt`

```
ciphertext = [22, 11, 4, 22, 4, 1, 29, 4, 9, 63, 4, 11, 13, 18, 5, 4, 0, 4, 4, 12, 18, 13, 8, 16, 19, 4, 5, 11, 1, 0, 0, 8, 5, 3, 11, 2, 7, 3, 10, 13, 7, 16, 6, 12, 6, 5, 0, 5, 11, 8, 4, 9, 1, 3, 8, 18, 7, 3, 1, 15, 23, 24, 7, 30, 3, 21, 2, 19, 5, 8, 4, 0, 2, 1, 6, 36, 1, 5, 0, 1, 5, 11, 17, 0, 8, 5, 21, 5, 17, 3, 11]
```

## Solution

I found a `pi-100m.txt` containing 100M decimals of Pi on [this sketchy website](https://calculat.io/en/number/download-pi-digits-files-txt-zip). You should edit the file to have `3.` at the beginning.

```python
from bisect import bisect_left
import array
from pathlib import Path

import sys
raw = Path('pi-100m.txt').read_text()

if not raw.startswith('3.'):
    print('pi file format unexpected', file=sys.stderr)
    sys.exit(1)

digits = raw.strip()
pi = digits[2:]  # fractional digits only (should be 100,000,001 digits)

cipher = [22, 11, 4, 22, 4, 1, 29, 4, 9, 63, 4, 11, 13, 18, 5, 4, 0, 4, 4, 12, 18, 13, 8, 16, 19, 4, 5, 11, 1, 0, 0, 8, 5, 3, 11, 2, 7, 3, 10, 13, 7, 16, 6,
          12, 6, 5, 0, 5, 11, 8, 4, 9, 1, 3, 8, 18, 7, 3, 1, 15, 23, 24, 7, 30, 3, 21, 2, 19, 5, 8, 4, 0, 2, 1, 6, 36, 1, 5, 0, 1, 5, 11, 17, 0, 8, 5, 21, 5, 17, 3, 11]

L = len(cipher)

# Reconstruct possible decimal digit sequences. Without original absolute positions,
# there is ambiguity. However, we now DO have the original pi digits file, so we can
# attempt to locate an offset such that walking gaps reproduces a consistent sequence.

first_gap = cipher[0]

# For any candidate offset O, the first matched digit occurs at position I1 = O + first_gap.
# Let d1 = pi[I1]. We know d1 does not appear in pi[O:I1]. That means pi[O:I1].find(d1) == -1.
# Rearranged: O is strictly greater than the last previous occurrence of d1 before I1.
# So if we enumerate I1 over all indices and set O = I1 - first_gap, we can test validity quickly.

matches = []
first_gap_range_start = first_gap  # minimal I1
first_gap_range_end = len(pi)  # search whole provided range (still ~1.25M)


pos_lists = {str(d): array.array('I') for d in range(10)}
for idx, ch in enumerate(pi):
    pos_lists[ch].append(idx)

# We will search for the starting offset O by considering each possible first matched position i1 of any digit d.
# Constraint: gap0 = i1 - O  => O = i1 - gap0 >= 0.
# Also, d must not occur in interval [O, i1) (otherwise first occurrence earlier).

def is_first_occurrence(digit: str, O: int, i1: int) -> bool:
    # Check if digit appears in [O, i1)
    arr = pos_lists[digit]
    k = bisect_left(arr, O)
    if k < len(arr) and arr[k] < i1:
        return False
    return True


def next_occurrence_after(digit: str, start_pos: int) -> int:
    arr = pos_lists[digit]
    k = bisect_left(arr, start_pos)
    if k >= len(arr):
        return -1
    return arr[k]


first_gap = cipher[0]
matches = []

total_len = len(pi)

# iterate over each digit's position list; treat each position as candidate i1, derive O.
for digit, arr in pos_lists.items():
    for pos in arr:
        O = pos - first_gap
        if O < 0:
            continue
        # Quick discard: ensure digit not in [O, pos)
        if not is_first_occurrence(digit, O, pos):
            continue
        # Walk gaps.
        offset = pos
        seq_digits = [digit]
        ok = True
        for gap in cipher[1:]:
            if gap == 0:
                seq_digits.append(seq_digits[-1])
                continue
            target_index = offset + gap
            if target_index >= total_len:
                ok = False
                break
            target_digit = pi[target_index]
            # Verify no earlier occurrence of target_digit between offset+1 and target_index.
            # We need first occurrence after offset.
            nxt = next_occurrence_after(target_digit, offset+1)
            if nxt != target_index:
                ok = False
                break
            seq_digits.append(target_digit)
            offset = target_index
        if ok:
            print('found matching offset:', O)
            matches.append((O, ''.join(seq_digits)))
            break
    if matches:
        break

if not matches:
    sys.exit(0)

O, seq = matches[0]

num = int(seq)
min_len = (num.bit_length() + 7) // 8

tested = False
for blen in range(min_len, min_len + 50):  # explore a window
    try:
        b = num.to_bytes(blen, 'big')
    except OverflowError:
        continue
    tested = True
    if b.startswith(b'07CTF{') and b.endswith(b'}') and len(b) == 38:
        try:
            print('flag:', b.decode())
        except Exception:
            pass
        break

if not matches:
    print("no candidate")
else:
    O, seq = matches[0]
    # Now attempt to treat this as big integer and convert back to bytes.
    # We do not know the exact byte length (assert says 38 chars ASCII). We'll brute force decode lengths.
    import math
    num = int(seq)

    for blen in range(10, 80):
        b = num.to_bytes(blen, 'big')
        if b.startswith(b'07CTF{') and b.endswith(b'}') and len(b) == 38:
            try:
                print("flag:", b.decode())
            except Exception:
                pass
            break
```

```sh
$ python solve.py
flag: 07CTF{p1e_1s_aNsw3r_t0_ev3ryThy1ngggg}
```

Solved!
