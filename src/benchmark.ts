import b from "benny";
import { MethodRouter } from ".";
import Router, { HTTPMethod } from "find-my-way";

const routes = [
  { method: "GET", url: "/user" },
  { method: "GET", url: "/user/comments" },
  { method: "GET", url: "/user/avatar" },
  { method: "GET", url: "/user/lookup/username/:username" },
  { method: "GET", url: "/user/lookup/email/:address" },
  { method: "GET", url: "/event/:id" },
  { method: "GET", url: "/event/:id/comments" },
  { method: "POST", url: "/event/:id/comment" },
  { method: "GET", url: "/map/:location/events" },
  { method: "GET", url: "/status" },
  { method: "GET", url: "/very/deeply/nested/route/hello/there" },
  { method: "GET", url: "/static/*" },
];

function noop() {}

function createSomeRouter() {
  const router = new MethodRouter();

  routes.forEach(function (route) {
    router.on(route.method, route.url, noop);
  });

  return router;
}

function createFindMyWay() {
  const router = Router();

  routes.forEach(function (route) {
    router.on(route.method as HTTPMethod, route.url, noop);
  });

  return router;
}

const router1 = createSomeRouter();
const router2 = createFindMyWay();

b.suite(
  "some-router routes",
  b.add("setting routes", function () {
    const _ = createSomeRouter();
  }),
  b.add("short static", function () {
    const _ = router1.find("GET", "/user");
  }),
  b.add("static with some radix", function () {
    const _ = router1.find("GET", "/user/comments");
  }),
  b.add("dynamic route", function () {
    const _ = router1.find("GET", "/user/lookup/username/john");
  }),
  b.add("mixed static dynamic", function () {
    const _ = router1.find("GET", "/event/abcd1234/comments");
  }),
  b.add("long static", function () {
    const _ = router1.find("GET", "/very/deeply/nested/route/hello/there");
  }),
  b.add("wildcard", function () {
    const _ = router1.find("GET", "/static/index.html");
  }),
  b.add("all together", function () {
    let _ = router1.find("GET", "/user");
    _ = router1.find("GET", "/user/comments");
    _ = router1.find("GET", "/user/lookup/username/john");
    _ = router1.find("GET", "/event/abcd1234/comments");
    _ = router1.find("GET", "/very/deeply/nested/route/hello/there");
    _ = router1.find("GET", "/static/index.html");
  }),
  b.cycle(),
  b.complete(),
);

b.suite(
  "find-my-way routes",
  b.add("setting routes", function () {
    const _ = createFindMyWay();
  }),
  b.add("short static", function () {
    const _ = router2.find("GET", "/user");
  }),
  b.add("static with some radix", function () {
    const _ = router2.find("GET", "/user/comments");
  }),
  b.add("dynamic route", function () {
    const _ = router2.find("GET", "/user/lookup/username/john");
  }),
  b.add("mixed static dynamic", function () {
    const _ = router2.find("GET", "/event/abcd1234/comments");
  }),
  b.add("long static", function () {
    const _ = router2.find("GET", "/very/deeply/nested/route/hello/there");
  }),
  b.add("wildcard", function () {
    const _ = router2.find("GET", "/static/index.html");
  }),
  b.add("all together", function () {
    let _ = router2.find("GET", "/user");
    _ = router2.find("GET", "/user/comments");
    _ = router2.find("GET", "/user/lookup/username/john");
    _ = router2.find("GET", "/event/abcd1234/comments");
    _ = router2.find("GET", "/very/deeply/nested/route/hello/there");
    _ = router2.find("GET", "/static/index.html");
  }),
  b.cycle(),
  b.complete(),
);
