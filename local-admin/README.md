# Local archive editor

Run `npm run dev` from the repository root and open the local website with `#admin`. The editor UI is served by Vite, with API requests proxied to the local CMS on port 5180.

Alternatively, run `npm run admin` to build the website and launch the standalone editor at `http://127.0.0.1:5180/#admin`.

Existing credentials and drafts in the sibling `Diaspora-Local-Admin/.private/` directory are reused automatically when available. A new installation stores state in `local-admin/.private/` and requires password setup and GitHub authorization.

The editor UI is included in the GitHub Pages build. GitHub Pages does not execute its backend; the hosted editor directs you to localhost for saving and publishing. Never share or commit `.private/`.
