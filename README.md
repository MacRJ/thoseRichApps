# thoseRichApps

Source for [thoserichapps.com](https://thoserichapps.com).

## Branches

| Branch | What it holds | Deploys? |
| --- | --- | --- |
| `main` | What's live on thoserichapps.com (currently the under-construction page) | Yes, every push |
| `dev` | The homepage in progress | No |

To ship the work on `dev`, merge it into `main` (a pull request works) and the site deploys on its own.

## Local development

```sh
npm install
npm run dev      # local preview with hot reload
npm run build    # production build into dist/
```

## How deploys work

`.github/workflows/deploy.yml` runs on every push to `main`:

1. `npm ci` and `npm run build`
2. Signs in to AWS through GitHub's OIDC (no keys stored in the repo) as the
   `thoserichapps-github-deploy` role, which only trusts this repo's `main` branch
3. Syncs `dist/` to the `thoserichapps.com` S3 bucket (files under `_archive/` are never touched)
4. Clears the CloudFront cache so the change is live right away

You can also re-run a deploy from the Actions tab with **Run workflow**.
