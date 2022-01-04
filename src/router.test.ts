import { HTTPRouter, MethodRouter } from ".";
import { METHODS } from "http";
import supertest from "supertest";
import express from "express";

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
routes.forEach((route) => {
  router.on(
    route.method,
    route.url,
    () => route,
  );
});

describe("when using the method router", () => {
  it("returns a router", () => {
    let callback: Function;

    ({ callback } = router.find("GET", "/user"));
    expect(callback()).toEqual({ method: "GET", url: "/user" });

    ({ callback } = router.find("GET", "/user/comments"));
    expect(callback()).toEqual({ method: "GET", url: "/user/comments" });

    ({ callback } = router.find("GET", "/user/lookup/username/john"));
    expect(callback()).toEqual({
      method: "GET",
      url: "/user/lookup/username/:username",
    });

    ({ callback } = router.find("GET", "/event/abcd1234/comments"));
    expect(callback()).toEqual({
      method: "GET",
      url: "/event/:id/comments",
    });

    ({ callback } = router.find(
      "GET",
      "/very/deeply/nested/route/hello/there",
    ));
    expect(callback()).toEqual({
      method: "GET",
      url: "/very/deeply/nested/route/hello/there",
    });

    ({ callback } = router.find("GET", "/static/index.html"));
    expect(callback()).toEqual({
      method: "GET",
      url: "/static/*",
    });
  });
});

describe("a router", () => {
  it("defaults to matching with a leading slash", () => {
    const router = new MethodRouter();
    router.on("GET", "/", () => "/");
    router.on("GET", "/user", () => "/user");

    let { callback } = router.find("GET", "");
    expect(callback()).toEqual("/");

    ({ callback } = router.find("GET", "user"));
    expect(callback()).toEqual("/user");
  });

  describe("when using splatting", () => {
    it("supports named splats", () => {
      const router = new MethodRouter();
      router.on("GET", "/*named", () => "named");

      const { callback, params } = router.find("GET", "/an/entire/path");
      expect(callback()).toEqual("named");
      expect(params).toEqual({ named: "an/entire/path" });
    });

    it("supports multiple named splats", () => {
      const router = new MethodRouter();
      router.on("GET", "/*a/foo/*b", () => "named");

      const { callback, params } = router.find("GET", "/zoo/woo/foo/bar/baz");
      expect(callback()).toEqual("named");
      expect(params).toEqual({ a: "zoo/woo", b: "bar/baz" });
    });

    it("supports splats and params", () => {
      const router = new MethodRouter();
      router.on("GET", "/books/*section/:title", () => "named");

      const { callback, params } = router.find(
        "GET",
        "/books/some/section/last-words-a-memoir",
      );
      expect(callback()).toEqual("named");
      expect(params).toEqual({
        section: "some/section",
        title: "last-words-a-memoir",
      });
    });

    it("returns 'splats' for anonymous splats", () => {
      const router = new MethodRouter();
      router.on("GET", "/say/*/to/*", () => "anonymous");

      const { callback, params } = router.find(
        "GET",
        "/say/hello/to/world",
      );
      expect(callback()).toEqual("anonymous");
      expect(params).toEqual({
        splat0: "hello",
        splat1: "world",
      });
    });

    it("returns anonymous and named splats", () => {
      const router = new MethodRouter();
      router.on("GET", "/say/*a/to/*", () => "anonymous");

      const { callback, params } = router.find(
        "GET",
        "/say/hello/to/world",
      );
      expect(callback()).toEqual("anonymous");
      expect(params).toEqual({
        splat0: "world",
        a: "hello",
      });
    });
  });

  describe("when using params", () => {
    it("uses the shortest distance to match", () => {
      const router = new MethodRouter();
      router.on("GET", "/customer/:name-:surname", () => "params");

      const { callback, params } = router.find(
        "GET",
        "/customer/john-doe",
      );
      expect(callback()).toEqual("params");
      expect(params).toEqual({
        name: "john",
        surname: "doe",
      });
    });

    it("can read nested params for a file extension", () => {
      const router = new MethodRouter();
      router.on("GET", "/profile/:id.:format", () => "params");

      const { callback, params } = router.find(
        "GET",
        "/profile/123.jpeg",
      );
      expect(callback()).toEqual("params");
      expect(params).toEqual({
        id: "123",
        format: "jpeg",
      });
    });
  });

  describe("when using routes with unicode", () => {
    it("specific routes have precedence", () => {
      const router = new MethodRouter();
      router.on("GET", "/*", () => "named");
      router.on("GET", "/こんにちは", () => "unicode");

      const { callback } = router.find(
        "GET",
        "/こんにちは",
      );
      expect(callback()).toEqual("unicode");
    });

    it("allows params to use unicode", () => {
      const router = new MethodRouter();
      router.on("GET", "/profile/:name", () => "unicode");

      const { callback, params } = router.find(
        "GET",
        "/profile/こんにちは",
      );
      expect(callback()).toEqual("unicode");
      expect(params).toEqual({
        name: "こんにちは",
      });
    });

    it("allows splats to use unicode", () => {
      const router = new MethodRouter();
      router.on("GET", "/profile/*name", () => "unicode");

      const { callback, params } = router.find(
        "GET",
        "/profile/こんにちは",
      );
      expect(callback()).toEqual("unicode");
      expect(params).toEqual({
        name: "こんにちは",
      });
    });
  });

  describe("when using regexes", () => {
    it("allows named captured groups", () => {
      const router = new MethodRouter();
      router.on(
        "GET",
        `/customer/(?<name>\\w+)-(?<surname>\\w+)`,
        () => "regex",
      );

      const { callback, params } = router.find(
        "GET",
        "/customer/john-doe",
      );
      expect(callback()).toEqual("regex");
      expect(params).toEqual({
        name: "john",
        surname: "doe",
      });
    });

    it("returns 'capture' for anonymous regexes", () => {
      const router = new MethodRouter();
      router.on("GET", `/customer/(\\w+)-(\\w+)`, () => "regex");

      const { callback, params } = router.find(
        "GET",
        "/customer/john-doe",
      );
      expect(callback()).toEqual("regex");
      expect(params).toEqual({
        regex0: "john",
        regex1: "doe",
      });
    });
  });

  describe("with all supported HTTP methods", () => {
    let router: MethodRouter;

    beforeEach(() => {
      router = new MethodRouter();
      router.acl("/", () => "ACL /");
      router.bind("/", () => "BIND /");
      router.checkout("/", () => "CHECKOUT /");
      router.connect("/", () => "CONNECT /");
      router.copy("/", () => "COPY /");
      router.delete("/", () => "DELETE /");
      router.get("/", () => "GET /");
      router.head("/", () => "HEAD /");
      router.link("/", () => "LINK /");
      router.lock("/", () => "LOCK /");
      router.msearch("/", () => "M-SEARCH /");
      router.merge("/", () => "MERGE /");
      router.mkactivity("/", () => "MKACTIVITY /");
      router.mkcalendar("/", () => "MKCALENDAR /");
      router.mkcol("/", () => "MKCOL /");
      router.move("/", () => "MOVE /");
      router.notify("/", () => "NOTIFY /");
      router.options("/", () => "OPTIONS /");
      router.patch("/", () => "PATCH /");
      router.post("/", () => "POST /");
      router.pri("/", () => "PRI /");
      router.propfind("/", () => "PROPFIND /");
      router.proppatch("/", () => "PROPPATCH /");
      router.purge("/", () => "PURGE /");
      router.put("/", () => "PUT /");
      router.rebind("/", () => "REBIND /");
      router.report("/", () => "REPORT /");
      router.search("/", () => "SEARCH /");
      router.source("/", () => "SOURCE /");
      router.subscribe("/", () => "SUBSCRIBE /");
      router.trace("/", () => "TRACE /");
      router.unbind("/", () => "UNBIND /");
      router.unlink("/", () => "UNLINK /");
      router.unlock("/", () => "UNLOCK /");
      router.unsubscribe("/", () => "UNSUBSCRIBE /");
    });

    METHODS.forEach((method) => {
      it(`supports ${method}`, () => {
        const { callback } = router.find(method, "/");
        expect(callback()).toEqual(`${method} /`);
      });
    });
  });
});

describe("when using http router", () => {
  let app: express.Application;
  let router: HTTPRouter;

  beforeEach(() => {
    app = express();
    router = new HTTPRouter();

    app.get("*", (request, response) => {
      router.lookup(request, response);
    });
  });

  it("handles a GET request", async () => {
    router.get("/persons/:name", (_request, response, params) => {
      response.writeHead(200);
      response.end(`Hello, ${params.name}`);
    });

    const response = await supertest(app).get("/persons/bob");
    expect(response.statusCode).toEqual(200);
  });

  it("has a 404 when no path is found", async () => {
    const response = await supertest(app).get("/persons/bob");
    expect(response.statusCode).toEqual(404);
  });
});
