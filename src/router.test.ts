import { MethodRouter } from ".";
import { METHODS } from "http";

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
    router.on("GET", "/", "/");
    router.on("GET", "/user", "/user");

    var { callback } = router.find("GET", "");
    expect(callback).toEqual("/");

    var { callback } = router.find("GET", "user");
    expect(callback).toEqual("/user");
  });

  describe("when using splatting", function () {
    it("supports named splats", function () {
      const router = new MethodRouter();
      router.on("GET", "/*named", "named");

      const { callback, params } = router.find("GET", "/an/entire/path");
      expect(callback).toEqual("named");
      expect(params).toEqual({ named: "an/entire/path" });
    });

    it("supports multiple named splats", function () {
      const router = new MethodRouter();
      router.on("GET", "/*a/foo/*b", "named");

      const { callback, params } = router.find("GET", "/zoo/woo/foo/bar/baz");
      expect(callback).toEqual("named");
      expect(params).toEqual({ a: "zoo/woo", b: "bar/baz" });
    });

    it("supports splats and params", function () {
      const router = new MethodRouter();
      router.on("GET", "/books/*section/:title", "named");

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

  describe("when using params", function () {
    it("uses the shortest distance to match", function () {
      const router = new MethodRouter();
      router.on("GET", "/customer/:name-:surname", "params");

      const { callback, params } = router.find(
        "GET",
        "/customer/john-doe",
      );
      expect(callback).toEqual("params");
      expect(params).toEqual({
        name: "john",
        surname: "doe",
      });
    });

    it("can read nested params for a file extension", function () {
      const router = new MethodRouter();
      router.on("GET", "/profile/:id.:format", "params");

      const { callback, params } = router.find(
        "GET",
        "/profile/123.jpeg",
      );
      expect(callback).toEqual("params");
      expect(params).toEqual({
        id: "123",
        format: "jpeg",
      });
    });
  });

  describe("when using routes with unicode", function () {
    it("specific routes have precedence", function () {
      const router = new MethodRouter();
      router.on("GET", "/*", "named");
      router.on("GET", "/こんにちは", "unicode");

      const { callback } = router.find(
        "GET",
        "こんにちは",
      );
      expect(callback).toEqual("unicode");
    });

    it("allows params to use unicode", function () {
      const router = new MethodRouter();
      router.on("GET", "/profile/:name", "unicode");

      const { callback, params } = router.find(
        "GET",
        "/profile/こんにちは",
      );
      expect(callback).toEqual("unicode");
      expect(params).toEqual({
        name: "こんにちは",
      });
    });

    it("allows splats to use unicode", function () {
      const router = new MethodRouter();
      router.on("GET", "/profile/*name", "unicode");

      const { callback, params } = router.find(
        "GET",
        "/profile/こんにちは",
      );
      expect(callback).toEqual("unicode");
      expect(params).toEqual({
        name: "こんにちは",
      });
    });
  });

  describe("with all supported HTTP methods", function () {
    let router: MethodRouter;

    beforeEach(function () {
      router = new MethodRouter();
      router.acl("/", "ACL /");
      router.bind("/", "BIND /");
      router.checkout("/", "CHECKOUT /");
      router.connect("/", "CONNECT /");
      router.copy("/", "COPY /");
      router.delete("/", "DELETE /");
      router.get("/", "GET /");
      router.head("/", "HEAD /");
      router.link("/", "LINK /");
      router.lock("/", "LOCK /");
      router.msearch("/", "M-SEARCH /");
      router.merge("/", "MERGE /");
      router.mkactivity("/", "MKACTIVITY /");
      router.mkcalendar("/", "MKCALENDAR /");
      router.mkcol("/", "MKCOL /");
      router.move("/", "MOVE /");
      router.notify("/", "NOTIFY /");
      router.options("/", "OPTIONS /");
      router.patch("/", "PATCH /");
      router.post("/", "POST /");
      router.propfind("/", "PROPFIND /");
      router.proppatch("/", "PROPPATCH /");
      router.purge("/", "PURGE /");
      router.put("/", "PUT /");
      router.rebind("/", "REBIND /");
      router.report("/", "REPORT /");
      router.search("/", "SEARCH /");
      router.source("/", "SOURCE /");
      router.subscribe("/", "SUBSCRIBE /");
      router.trace("/", "TRACE /");
      router.unbind("/", "UNBIND /");
      router.unlink("/", "UNLINK /");
      router.unlock("/", "UNLOCK /");
      router.unsubscribe("/", "UNSUBSCRIBE /");
    });

    METHODS.forEach(function (method) {
      it(`supports ${method}`, function () {
        const { callback } = router.find(method, "/");
        expect(callback).toEqual(`${method} /`);
      });
    });
  });
});
