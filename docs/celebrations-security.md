# Employee celebrations: containment and restoration

The browser receives no staff celebration data. The static build and local
development don't retrieve upstream calendars. Automatic GitHub Pages publishing
is removed. Do not restore a calendar importer as a build hook or publish a
generated staff data module.

**Before restoring:** Have the BambooHR owner revoke the exposed feed URLs and
issue new ones if needed. Removing the old literals from current source does not
revoke them or remove them from Git history. Independently review any previously
published Pages artifacts; this repository change does not unpublish them.

**Secure design:** Store rotated URLs as server-only runtime secrets in the
intended private app environment, never in frontend variables or build settings.
Fetch them only inside an authenticated server endpoint. Verify signed-in
staff membership server-side before any upstream lookup or response. Return
only the minimum fields needed, avoid logging upstream URLs or staff records,
and prevent browser/CDN sharing with a private no-store response. Render the
authenticated result at runtime; keep the frontend seed empty and do not fall
back to embedding data. Add tests with synthetic records for unauthenticated
requests, permitted staff, caching, and the static artifact, then review those
tests and private hosting controls before enabling it.
