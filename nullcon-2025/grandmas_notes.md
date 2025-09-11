# Grandma's notes

| 📁 Category   | 👨‍💻 Creator  | 📝 Writeup By |
|---------------|-------------|------------|
 Web           | gehaxelt    | darius-it

**Description:**
> My grandma is into vibe coding and has developed this web application to help her remember all the important information. It would work be great, if she wouldn't keep forgetting her password, but she's found a solution for that, too.
> 
> http://52.59.124.14:5015

**Attachment:** [🔗 source.zip](https://ctf.nullcon.net/files/2d3520ddfbc64dd9bca05c735242501e/source.zip?token=eyJ1c2VyX2lkIjozODIwLCJ0ZWFtX2lkIjoxNjc2LCJmaWxlX2lkIjo4Mn0.aMMFJg.uQ4_utjJCeerKziu0idwMPxbceA)

## Solution
For this web challenge, we are faced with a simple login and registration page.

Interestingly, we can enter a username and some password, and it will tell us how many characters of the password are correct. This is done by hashing each character of the password separately and comparing it to the stored hash.

Because the password is 16 characters long, we can simply brute-force each character of the password one by one. This can be easily automated with a [simple script](assets/grandmas_notes_solver.js). Run this script in your browser console, and you will get the full password.

After that, we can simply log in as with the user admin and the found password, and get the flag from the dashboard page.

That's it, we got the flag! 🎉