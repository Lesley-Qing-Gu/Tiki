# Local archive editor

GitHub Pages serves the public website only. This editor requires Node.js and runs on your computer.

Continue using the existing `Diaspora-Local-Admin` tool to retain its configured password, authorization and drafts. The files here are a source copy of the updated editor; private data is excluded.

For a new installation, run `npm run build` from the repository root, copy `dist/` into `local-admin/site/`, then run `node local-admin/server.mjs`. Open `http://127.0.0.1:5180/#admin`. A new installation requires password setup and GitHub authorization. Do not share or commit `.private/`.
