import test from "node:test";
import assert from "node:assert/strict";
import { authenticate } from "../netlify/lib/auth.mjs";
import { makeCelebrationsHandler } from "../netlify/functions/celebrations.mjs";

const staff = { id: "staff-test", app_metadata: { roles: ["celebrations-staff"] } };
const context = Object.freeze({
  BAMBOOHR_BIRTHDAYS_FEED_URL: "https://switch.bamboohr.com/feeds/feed.php?id=BirthdayFixture0001",
  BAMBOOHR_ANNIVERSARIES_FEED_URL: "https://switch.bamboohr.com/feeds/feed.php?id=AnniversaryFixture0001",
});
const request = () => new Request("https://switchcommerce.team/.netlify/functions/celebrations");
const failFetch = () => assert.fail("unexpected upstream fetch");
const calendar = (...events) => ["BEGIN:VCALENDAR", "VERSION:2.0", ...events.flat(), "END:VCALENDAR", ""].join("\r\n");
const event = (id, summary, date, status = "CONFIRMED") => [
  "BEGIN:VEVENT", "UID:" + id, date, "SUMMARY:" + summary, "STATUS:" + status,
  "DESCRIPTION:PRIVATE_SENTINEL", "LOCATION:PRIVATE_PLACE", "END:VEVENT",
];
function noStore(res) {
  assert.match(res.headers.get("Cache-Control"), /private, no-store/);
  assert.equal(res.headers.get("Netlify-CDN-Cache-Control"), "no-store");
  assert.equal(res.headers.get("CDN-Cache-Control"), "no-store");
  assert.equal(res.headers.get("Access-Control-Allow-Origin"), null);
}

test("missing Identity, unverified tokens and malformed cookies fail closed", async () => {
  const handler = makeCelebrationsHandler({env:context, fetchImpl:failFetch});
  const res = await handler(request());
  const malformedCookie = await handler(new Request(request().url, {headers: {Cookie:"nf_jwt=%invalid"}}));
  assert.equal(res.status, 401); assert.equal(malformedCookie.status, 401); noStore(res);
  const prior = process.env.URL;
  process.env.URL = "https://switchcommerce.team";
  try {
    let identityChecks = 0;
    const rejected = makeCelebrationsHandler({
      env:context,
      fetchImpl:failFetch,
      verifyIdentity: (req) => authenticate(req, {fetchImpl: (url, options) => {
        identityChecks++;
        assert.equal(url,"https://switchcommerce.team/.netlify/identity/user");
        assert.equal(options.headers.Authorization,"Bearer synthetic-invalid");
        return new Response(null,{status:401});
      }}),
    });
    assert.equal((await rejected(new Request(request().url,{headers:{Authorization:"Bearer synthetic-invalid"}}))).status,401);
    assert.equal(identityChecks,1);
  } finally {
    if (prior === undefined) delete process.env.URL; else process.env.URL = prior;
  }
});

test("valid signed-in nonstaff and user-editable roles are insufficient", async () => {
  const handler = makeCelebrationsHandler({
    env: context,
    verifyIdentity:async () => ({id:"nonstaff", email:"person@switchcommerce.com", app_metadata:{roles:["admin"]}, user_metadata:{roles:["celebrations-staff"]}}),
    fetchImpl:failFetch,
  });
  const res = await handler(request()); assert.equal(res.status,403); noStore(res);
});

test("server-managed staff receives only intended birthday and anniversary fields", async () => {
  const calls = [];
  const handler = makeCelebrationsHandler({
    env:context, verifyIdentity:async () => staff,
    fetchImpl:async (url,options) => {
      calls.push(url.hostname);
      assert.equal(options.redirect,"error"); assert.equal(options.cache,"no-store");
      assert.ok(options.signal instanceof AbortSignal); assert.equal(options.method,"GET");
      const birthday = url.searchParams.get("id").startsWith("Birthday");
      return new Response(birthday ? calendar(
        event("fixture-b", "Synthetic Test - Birthday", "DTSTART;VALUE=DATE:20260308"),
        event("fixture-time", "Synthetic Timed: Birthday", "DTSTART:20260701T020000Z"),
        event("fixture-c", "Cancelled Test - Birthday", "DTSTART;VALUE=DATE:20260309", "CANCELLED"),
        event("fixture-o", "Unrelated Meeting", "DTSTART;VALUE=DATE:20260310"),
      ) : calendar(
        event("fixture-a", "Synthetic Test’s 5 Year Anniversary", "DTSTART;VALUE=DATE:20261024"),
        event("fixture-m", "Missing Tenure - Work Anniversary", "DTSTART;VALUE=DATE:20261024"),
      ));
    },
  });
  const res = await handler(request());
  assert.equal(res.status,200); noStore(res);
  const raw = await res.text();
  assert.deepEqual(JSON.parse(raw), {
    birthdays:[{name:"Synthetic Test",date:"03-08"},{name:"Synthetic Timed",date:"06-30"}],
    anniversaries:[{name:"Synthetic Test",date:"10-24",startYear:2021}],
  });
  assert.doesNotMatch(raw,/PRIVATE_SENTINEL|PRIVATE_PLACE|20260308|fixture-|BirthdayFixture/);
  assert.deepEqual(calls,["switch.bamboohr.com","switch.bamboohr.com"]);
});

test("missing or invalid configuration never falls back or fetches", async () => {
  for (const env of [
    {},
    {...context,BAMBOOHR_BIRTHDAYS_FEED_URL:"https://switch.bamboohr.com.invalid/feeds/feed.php?id=SyntheticWrongHost1"},
    {...context,BAMBOOHR_BIRTHDAYS_FEED_URL:"https://switch.bamboohr.com/feeds/feed.php?id=SyntheticDuplicate1&id=SyntheticDuplicate2"},
  ]) {
    const handler = makeCelebrationsHandler({env,verifyIdentity:async()=>staff,fetchImpl:failFetch});
    const res=await handler(request()); assert.equal(res.status,503); noStore(res);
  }
});

test("upstream errors and oversized or non-calendar results do not expose source values", async () => {
  for (const fetchImpl of [
    async()=> {throw Error("PRIVATE_SOURCE_VALUE");},
    async()=>new Response("Not a calendar PRIVATE_SOURCE_VALUE"),
    async()=>new Response("x",{headers:{"Content-Length":"1048577"}}),
  ]) {
    const res=await makeCelebrationsHandler({env:context,verifyIdentity:async()=>staff,fetchImpl})(request());
    assert.equal(res.status,503); noStore(res);
    assert.deepEqual(await res.json(),{error:"celebrations_unavailable"});
  }
});

test("unauthorized method does not check Identity or fetch upstream", async () => {
  const res=await makeCelebrationsHandler({env:context,verifyIdentity:failFetch,fetchImpl:failFetch})(new Request(request().url,{method:"POST"}));
  assert.equal(res.status,405); assert.equal(res.headers.get("Allow"),"GET"); noStore(res);
});
