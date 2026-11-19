# Employee celebrations: private runtime calendar

The Field Notes celebrations cards and their detail pages load at runtime. The
server endpoint verifies the Netlify Identity token with the production service,
then requires the exact **celebrations-staff** role in administrator-managed
Identity `app_metadata.roles`. A signed-in user, a company email address, a
browser-side role, or any role in `user_metadata` is not sufficient.
The endpoint is restricted to the production Identity origin. Local tests use
synthetic fixtures and never call Identity or BambooHR.

## Owner setup

1. Have the BambooHR owner revoke the old publicly committed feed URLs. Use new
   birthday and work-anniversary iCalendar feed URLs limited to those event types.
   Removing old literals did not revoke them or remove them from Git history.
2. Store only those two replacement URLs as Netlify secrets named
   `BAMBOOHR_BIRTHDAYS_FEED_URL` and `BAMBOOHR_ANNIVERSARIES_FEED_URL`, scoped to
   **Functions**, **Production** for the private portal's backend. Do not put
   them in repository files, frontend variables, builds, or messages. The endpoint
   accepts only HTTPS on the exact company BambooHR host and fixed feed path,
   and follows no redirects.
3. From the Identity admin dashboard, assign `celebrations-staff` to each staff
   account authorized by the company and remove it on offboarding. Don't open
   signup or broaden other site access. No existing trusted staff-wide role is
   assumed; administrators need the same explicit role for this feature.
4. Rebuild/deploy as required by Netlify, then verify an approved staff account
   sees its calendar and an ordinary signed-in account without the role does not.

Only names and month/day plus derived work-anniversary start year are returned;
no birth year, employee IDs, contact information, event descriptions, raw
calendar text or URLs. Browser state is transient, API fetches are no-store, all
server responses are marked private/no-store for browser and CDNs, and the
service worker excludes API requests. Missing secrets or upstream errors give
the existing cards a temporary-unavailability state; no real events are included
in static builds and there is no public GitHub Pages workflow.

Prior published artifacts and old Git history are separate from this change and
should be reviewed by the site owner.
