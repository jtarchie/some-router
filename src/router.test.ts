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
    var { callback } = router.find("GET", "/user");
    expect(callback).toEqual({ method: "GET", url: "/user" });

    var { callback } = router.find("GET", "/user/comments");
    expect(callback).toEqual({ method: "GET", url: "/user/comments" });

    var { callback } = router.find("GET", "/user/lookup/username/john");
    expect(callback).toEqual({
      method: "GET",
      url: "/user/lookup/username/:username",
    });

    var { callback } = router.find("GET", "/event/abcd1234/comments");
    expect(callback).toEqual({
      method: "GET",
      url: "/event/:id/comments",
    });

    var { callback } = router.find(
      "GET",
      "/very/deeply/nested/route/hello/there",
    );
    expect(callback).toEqual({
      method: "GET",
      url: "/very/deeply/nested/route/hello/there",
    });

    var { callback } = router.find("GET", "/static/index.html");
    expect(callback).toEqual({
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

    var { callback } = router.find("GET", "");
    expect(callback).toEqual("/");

    var { callback } = router.find("GET", "user");
    expect(callback).toEqual("/user");
  });

  describe("when using splatting", function () {
    it("supports named splats", function () {
      const router = new MethodRouter();
      router.on(methods.GET, "/*named", "named");

      const { callback, params } = router.find("GET", "/an/entire/path");
      expect(callback).toEqual("named");
      expect(params).toEqual({ named: "an/entire/path" });
    });

    it("supports multiple named splats", function () {
      const router = new MethodRouter();
      router.on(methods.GET, "/*a/foo/*b", "named");

      const { callback, params } = router.find("GET", "/zoo/woo/foo/bar/baz");
      expect(callback).toEqual("named");
      expect(params).toEqual({ a: "zoo/woo", b: "bar/baz" });
    });

    it("supports splats and params", function () {
      const router = new MethodRouter();
      router.on(methods.GET, "/books/*section/:title", "named");

      const { callback, params } = router.find(
        "GET",
        "/books/some/section/last-words-a-memoir",
      );
      expect(callback).toEqual("named");
      expect(params).toEqual({
        section: "some/section",
        title: "last-words-a-memoir",
      });
    });
  });

  it("supports unicode characters", function () {
    const router = new MethodRouter();
    router.on(methods.GET, "/*", "named");
    router.on(methods.GET, "/こんにちは", "unicode");

    const { callback } = router.find(
      "GET",
      "こんにちは",
    );
    expect(callback).toEqual("unicode");
  });

  describe("with all supported HTTP methods", function () {
    let router: MethodRouter;

    beforeEach(function () {
      router = new MethodRouter();
      for (const method in methods) {
        router[method]("/", `${method} /`);
      }
    });

    for (const method in methods) {
      it(`supports ${method}`, function () {
        const { callback } = router.find(method, "/");
        expect(callback).toEqual(`${method} /`);
      });
    }
  });
});
