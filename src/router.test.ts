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

const router = new MethodRouter();
routes.forEach(function (route) {
  router.on(
    route.method,
    route.url,
    function (index) {
      return route;
    }(route),
  );
});

describe("when using the benchmark router", function () {
  it("returns a router", function () {
    let route = router.find("GET", "/user");
    expect(route).toEqual({ method: "GET", url: "/user" });

    route = router.find("GET", "/user/comments");
    expect(route).toEqual({ method: "GET", url: "/user/comments" });

    route = router.find("GET", "/user/lookup/username/john");
    expect(route).toEqual({
      method: "GET",
      url: "/user/lookup/username/:username",
    });

    route = router.find("GET", "/event/abcd1234/comments");
    expect(route).toEqual({
      method: "GET",
      url: "/event/:id/comments",
    });

    route = router.find("GET", "/very/deeply/nested/route/hello/there");
    expect(route).toEqual({
      method: "GET",
      url: "/very/deeply/nested/route/hello/there",
    });

    route = router.find("GET", "/static/index.html");
    expect(route).toEqual({
      method: "GET",
      url: "/static/*",
    });
  });
});

describe("a router", function () {
  it("defaults to matching with a leading slash", function () {
    const router = new MethodRouter();
    router.on(methods.GET, "/", "/");
    router.on(methods.GET, "/user", "/user");

    let route = router.find("GET", "");
    expect(route).toEqual("/");

    route = router.find("GET", "user");
    expect(route).toEqual("/user");
  });
});
