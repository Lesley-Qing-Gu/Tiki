# Diaspora East Cinema

Diaspora East Cinema is a cinema archive featuring news, screenings and past events.

Explore films and gatherings through event details, images and stories from the archive.

[Visit Diaspora East Cinema](https://lesley-qing-gu.github.io/Tiki/)

## Local preview

```sh
npm run dev
```

Open the `/Tiki/` URL printed by Vite. `npm run check` checks TypeScript and `npm run build` generates the GitHub Pages files in `dist/`.

The home page uses a browser-compatible copy of `video.mov`, with the bird logo animating automatically once. The video and About image move at different speeds while scrolling. About us is the second section; News, Past events and Contact follow. The colored logo and fixed navigation appear after scrolling into About us.

The contact form opens an email enquiry addressed to `Info@decinema.nl`. The visitor sends it from their email app. Instagram links to `https://www.instagram.com/diaspora_east_cinema/`.

Clicking the opening video or scrolling the mouse wheel downward scrolls to About us over 1.8 seconds. Text types in as it enters the viewport, with full text shown immediately for reduced-motion preferences. Desktop section titles/body/notes use 36/20/12px; mobile uses 28/16/12px. Navigation and event titles use the body text size. Archive cards have a complete frame around their image and title. Navigation starts with About us and turns pink on hover. Back links use the same pink hover and underline.

## Local administration

The local website’s `#admin` route opens the existing management tool at `http://127.0.0.1:5180/#admin`. Start it by double-clicking `Diaspora-Local-Admin/启动后台.command` and leave its window open. The management tool keeps its existing password and drafts.

On GitHub Pages, `#admin` displays a link to the local editor. Updated editor source is kept in `local-admin/`; its private state and authorization are excluded from Git.
