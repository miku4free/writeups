# Brick Workshop

| 📁 Category | 👨‍💻 Creator | 📝 Writeup By |
| ----------- | ------------- | ------------- |
 Binary Exploitation      |  \_omp and Swillion      | darius-it

**Description:**
> You are helping run the Brick Workshop, where every batch is tested for clutch power before shipping. The diagnostics station claims to require a two-step calibration, but something feels off about how it remembers old mold IDs and pigment codes. Can you use the workshop menu to force a perfect test result and unlock Master Builder status?

<br>

The challenge involves a simple CLI program where you can select various options from a text-based menu:
<img width="1038" height="252" alt="grafik" src="https://github.com/user-attachments/assets/cdf08069-f3ae-439b-9e36-b73498eb8c66" />

At first, I was expecting some kind of overflow or issue regarding `scanf` usage, but the challenge is just based on some simple math.  It relies on **uninitialized variables** and the way the **CPU stack** behaves during a function loop.

## Solution

The core issue lies in the `workshop_turn()` function, which is called repeatedly inside a `while(1)` loop in `main()`.

```c
static void workshop_turn(void) {
    int choice;
    unsigned int mold_id;      // Uninitialized
    unsigned int pigment_code; // Uninitialized
    
    // ... menu logic ...
}
```

In C, local variables are stored on the stack. When a function is called, it carves out a "stack frame." When it returns, that memory isn't wiped; it’s simply marked as available. Because `main()` calls `workshop_turn()` over and over, the function uses the **exact same memory addresses** for its variables every single time.

1. On the first run, we want to enter some values into the variables to initialize them. You select option 3. The program sees `service_initialized` is 0, so it prompts you for `mold_id` and `pigment_code` using `scanf`. This writes your input directly onto the stack.
    
2. On the second run, you select option 3 again. Now `service_initialized` is 1. The program skips the `scanf` prompts but still tries to use `mold_id` and `pigment_code`. Since they aren't redefined, they "inherit" the values you typed in during the first run because they are sitting at the same stack offsets.

### Cracking the flag formula

To get the flag, the function `clutch_score()` must return exactly `0x23ccdu` (146637).

The scoring formula is:

```text
(((mold_id >> 2) & 0x43u) | pigment_code) + (pigment_code << 1)
```

While the bitwise operators look intimidating, we can simplify the equation by choosing a `mold_id` that clears the first half of the expression. If we set `mold_id = 0`:

1. `(0 >> 2)` is `0`.
    
2. `(0 & 0x43u)` is `0`.
    
3. `(0 | pigment_code)` simplifies to just `pigment_code`.
    

The remaining equation is:

```text
pigment_code + (pigment_code << 1)
```

Since a bitwise left shift by 1 `(<< 1)` is the same as multiplying by 2, the formula becomes:

```text
pigment_code + (pigment_code * 2) = 3 * pigment_code
```

To find the required `pigment_code`, we just divide our target by 3:

```text
146637 / 3 = 48879
```

### Getting the flag
Putting all of it together,  the steps for this exploit are fairly simple:

1. On the first run, we initialize the variables on the stack. We select option `3` to run into the intial calibration process. When prompted for calibration, enter `0` for the mold ID and `48879` for the pigment code. This "seeds" the stack memory.
    
2. On the second run, we choose option **3** again. The program skips the input prompt, reuses the `0` and `48879` left on the stack, passes the math check, and grants the flag!
