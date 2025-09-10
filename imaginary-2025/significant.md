# Wave

| 📁 Category   | 👨‍💻 Creator  | 📝 Writeup By |
|---------------|-------------|------------|
 Misc           | puzzler7    | darius-it

**Description:**
> The signpost knows where it is at all times. It knows this because it knows where it isn't, by subtracting where it is, from where it isn't, or where it isn't, from where it is, whichever is greater. Consequently, the position where it is, is now the position that it wasn't, and it follows that the position where it was, is now the position that it isn't.

> Please find the coordinates (lat, long) of this signpost to the nearest 3 decimals, separated by a comma with no space. Ensure that you are rounding and not truncating before you make a ticket. Example flag: ictf{-12.345,6.789}

**Attachment:** [🔗 significant.jpg](https://2025.imaginaryctf.org/files/significant/significant.jpg)


## Solution
For this challenge, we are given an image of a signpost with some text on it. We are supposed to find the coordinates (latitude and longitude) of the signpost to the nearest 3 decimals.

![Challenge Image](assets/significant.jpg)

The easiest solution is to reverse image search the image on Google. Doing so, we quickly find an image with the caption "San Francisco's Sister Cities Signpost".

We can now enter this into Google Maps and find the coordinates of the signpost. The coordinates can be found in the URL of the Google Maps page.

The coordinates are: `37.785,-122.408`. We can now put this into the flag format:
`ictf{37.785,-122.408}`

And that is the solution to the challenge!
