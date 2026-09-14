RANDOM JIGSAW — READY TO HOST

What this version does:
- 500 pieces (10 x 50)
- Randomly chooses one of your 10 image URLs
- Avoids immediately repeating the previous image
- Blurred preview page: index.html
- No-preview page: no-preview.html
- Timer
- Shuffle + New puzzle
- MOBILE: press/hold and freely drag with your finger (Pointer Events)
- DESKTOP: normal mouse hold + drag

IMPORTANT:
Do not put private/NSFW source images into a public GitHub repository.
Instead, host the images somewhere appropriate for that content and put their
direct image URLs into puzzle.js.

EASIEST SETUP:
1. Create a GitHub repository.
2. Upload:
   index.html
   no-preview.html
   puzzle.js
   style.css
3. Open puzzle.js on GitHub and tap the pencil/edit button.
4. Replace:
   PASTE_IMAGE_URL_01_HERE
   ...
   PASTE_IMAGE_URL_10_HERE
   with your 10 direct image URLs.
5. Commit the change.
6. Enable GitHub Pages:
   Settings -> Pages -> Deploy from a branch -> main -> / (root) -> Save.
7. Your two permanent pages will be:
   https://YOURUSERNAME.github.io/YOURREPO/
   https://YOURUSERNAME.github.io/YOURREPO/no-preview.html

If your image host gives a page URL rather than an actual image URL, it may not
work as the background. The URL should normally end in .jpg, .jpeg, .png, .webp
or otherwise directly return the image.

To increase difficulty later:
- Change COLS and ROWS in puzzle.js.
- Example 12 x 6 = 72 pieces.
