import b from "benny";
import { MethodRouter, methods } from ".";

const routes = [
  { method: methods.GET, url: "/user" },
  { method: methods.GET, url: "/user/comments" },
  { method: methods.GET, url: "/user/avatar" },
  { method: methods.GET, url: "/user/lookup/username/:username" },
  { method: methods.GET, url: "/user/lookup/email/:address" },
  { method: methods.GET, url: "/event/:id" },
  { method: methods.GET, url: "/event/:id/comments" },
  { method: methods.POST, url: "/event/:id/comment" },
  { method: methods.GET, url: "/map/:location/events" },
  { method: methods.GET, url: "/status" },
  { method: methods.GET, url: "/very/deeply/nested/route/hello/there" },
  { method: methods.GET, url: "/static/*" },
];

function noop() {}

const router = new MethodRouter();

routes.forEach(function (route) {
  router.on(route.method, route.url, noop);
});

b.suite(
  "routes",
  b.add("short static", function () {
    const _ = router.find("GET", "/user");
  }),
  b.add("static with some radix", function () {
    const _ = router.find("GET", "/user/comments");
  }),
  b.add("dynamic route", function () {
    const _ = router.find("GET", "/user/lookup/username/john");
  }),
  b.add("mixed static dynamic", function () {
    const _ = router.find("GET", "/event/abcd1234/comments");
  }),
  b.add("long static", function () {
    const _ = router.find("GET", "/very/deeply/nested/route/hello/there");
  }),
  b.add("wildcard", function () {
    const _ = router.find("GET", "/static/index.html");
  }),
  b.add("all together", function () {
    let _ = router.find("GET", "/user");
    _ = router.find("GET", "/user/comments");
    _ = router.find("GET", "/user/lookup/username/john");
    _ = router.find("GET", "/event/abcd1234/comments");
    _ = router.find("GET", "/very/deeply/nested/route/hello/there");
    _ = router.find("GET", "/static/index.html");
  }),
  b.cycle(),
  b.complete(),
);
