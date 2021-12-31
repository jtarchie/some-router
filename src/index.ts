class PathRoute {
  constructor(
    public callback: unknown,
    public minLength: number,
    public path: string,
    public regex: RegExp,
    public regexCount: number,
    public splatCount: number,
  ) {}
}

type mapMatchByMinPrefix = {
  [key: string]: Array<PathRoute>;
};

type mapStaticMatchers = {
  [key: string]: PathRoute;
};

interface ResultRoute {
  params: { [key: string]: string };
  callback: unknown;
}

class PathRouter {
  routes: Array<PathRoute> = [];
  matcherByMinPrefix: mapMatchByMinPrefix = {};
  staticMatchers: mapStaticMatchers = {};
  minPrefixLength = Infinity;

  on(path: string, callback: unknown) {
    const parts = [];
    let minPrefixLength = 0;
    let splatCount = 0;
    let regexCount = 0;
    let minLength = 0;
    let isStatic = true;

    for (let i = 0; i < path.length;) {
      let startingPos = i;
      for (; i < path.length && !/[:*(]/.test(path[i]); i++);
      if (startingPos < i) {
        parts.push(
          path.slice(startingPos, i).replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
        );
        minLength += i - startingPos;

        if (minPrefixLength === 0) {
          minPrefixLength = i - startingPos;
        }
      }

      switch (path[i]) {
        case ":": {
          startingPos = ++i;
          for (; i < path.length && /\w/.test(path[i]); i++);
          parts.push(`(?<${path.slice(startingPos, i)}>[^\.]+)`);
          minLength++;
          isStatic = false;
          break;
        }
        case "*": {
          startingPos = ++i;
          for (; i < path.length && /\w/.test(path[i]); i++);
          if (startingPos < i) {
            parts.push(`(?<${path.slice(startingPos, i)}>.+)`);
          } else {
            parts.push(`(?<splat${splatCount}>.+)`);
            splatCount++;
          }
          minLength++;
          isStatic = false;
          break;
        }
        case "(": {
          startingPos = i++;
          let count = 1;
          for (; 0 < count && i < path.length; i++) {
            switch (path[i]) {
              case "(": {
                count++;
                break;
              }
              case ")": {
                count--;
                break;
              }
            }
          }

          if (count === 0) {
            if (path.slice(startingPos).startsWith("(?<")) {
              parts.push(path.slice(startingPos, i));
            } else {
              parts.push(
                `(?<regex${regexCount}>` + path.slice(startingPos, i) + ")",
              );
              regexCount++;
            }

            minLength++; // take a guess
            isStatic = false;
          } else {
            parts.push("\\(");
          }
          break;
        }
      }
    }

    const matcher = parts.join("");
    const route = new PathRoute(
      callback,
      minLength,
      path,
      new RegExp(`^${matcher}$`),
      regexCount,
      splatCount,
    );

    if (isStatic) {
      this.staticMatchers[path] = route;
      return;
    }

    this.routes.push(route);
    this.routes.sort((a, b) => b.minLength - a.minLength);

    if (this.minPrefixLength > minPrefixLength) {
      this.minPrefixLength = minPrefixLength;
    }

    this.matcherByMinPrefix = {};

    this.routes.forEach((route) => {
      const prefix = route.path.slice(0, this.minPrefixLength);
      const routes = this.matcherByMinPrefix[prefix] || [];
      routes.push(route);
      this.matcherByMinPrefix[prefix] = routes;
    });
  }

  find(path: string): ResultRoute | undefined {
    const matched = this.staticMatchers[path];
    if (matched) {
      return {
        callback: matched.callback,
        params: {},
      };
    }

    const prefix = path.substring(0, this.minPrefixLength);
    const matchers = this.matcherByMinPrefix[prefix];
    if (matchers) {
      for (let i = 0; i < matchers.length; i++) {
        const matcher = matchers[i];

        const matches = matcher.regex.exec(path);
        if (matches) {
          return {
            params: matches.groups || {},
            callback: matcher.callback,
          };
        }
      }
    }
  }
}

type mapPathRouter = {
  [key: string]: PathRouter;
};

class MethodRouter {
  routes: mapPathRouter = {};

  on(method: string, path: string, callback: unknown) {
    const route = this.routes[method] || new PathRouter();
    route.on(path, callback);
    this.routes[method] = route;
  }

  find(method: string, path: string): ResultRoute {
    const pathRouter = this.routes[method];
    if (pathRouter) {
      if (path[0] !== "/") {
        path = "/" + path;
      }
      const result = pathRouter.find(path);
      if (result) {
        return result;
      }
    }

    return { params: {}, callback: undefined };
  }

  acl(path: string, callback: unknown) {
    this.on("ACL", path, callback);
  }
  bind(path: string, callback: unknown) {
    this.on("BIND", path, callback);
  }
  checkout(path: string, callback: unknown) {
    this.on("CHECKOUT", path, callback);
  }
  connect(path: string, callback: unknown) {
    this.on("CONNECT", path, callback);
  }
  copy(path: string, callback: unknown) {
    this.on("COPY", path, callback);
  }
  delete(path: string, callback: unknown) {
    this.on("DELETE", path, callback);
  }
  get(path: string, callback: unknown) {
    this.on("GET", path, callback);
  }
  head(path: string, callback: unknown) {
    this.on("HEAD", path, callback);
  }
  link(path: string, callback: unknown) {
    this.on("LINK", path, callback);
  }
  lock(path: string, callback: unknown) {
    this.on("LOCK", path, callback);
  }
  msearch(path: string, callback: unknown) {
    this.on("M-SEARCH", path, callback);
  }
  merge(path: string, callback: unknown) {
    this.on("MERGE", path, callback);
  }
  mkactivity(path: string, callback: unknown) {
    this.on("MKACTIVITY", path, callback);
  }
  mkcalendar(path: string, callback: unknown) {
    this.on("MKCALENDAR", path, callback);
  }
  mkcol(path: string, callback: unknown) {
    this.on("MKCOL", path, callback);
  }
  move(path: string, callback: unknown) {
    this.on("MOVE", path, callback);
  }
  notify(path: string, callback: unknown) {
    this.on("NOTIFY", path, callback);
  }
  options(path: string, callback: unknown) {
    this.on("OPTIONS", path, callback);
  }
  patch(path: string, callback: unknown) {
    this.on("PATCH", path, callback);
  }
  post(path: string, callback: unknown) {
    this.on("POST", path, callback);
  }
  pri(path: string, callback: unknown) {
    this.on("PRI", path, callback);
  }
  propfind(path: string, callback: unknown) {
    this.on("PROPFIND", path, callback);
  }
  proppatch(path: string, callback: unknown) {
    this.on("PROPPATCH", path, callback);
  }
  purge(path: string, callback: unknown) {
    this.on("PURGE", path, callback);
  }
  put(path: string, callback: unknown) {
    this.on("PUT", path, callback);
  }
  rebind(path: string, callback: unknown) {
    this.on("REBIND", path, callback);
  }
  report(path: string, callback: unknown) {
    this.on("REPORT", path, callback);
  }
  search(path: string, callback: unknown) {
    this.on("SEARCH", path, callback);
  }
  source(path: string, callback: unknown) {
    this.on("SOURCE", path, callback);
  }
  subscribe(path: string, callback: unknown) {
    this.on("SUBSCRIBE", path, callback);
  }
  trace(path: string, callback: unknown) {
    this.on("TRACE", path, callback);
  }
  unbind(path: string, callback: unknown) {
    this.on("UNBIND", path, callback);
  }
  unlink(path: string, callback: unknown) {
    this.on("UNLINK", path, callback);
  }
  unlock(path: string, callback: unknown) {
    this.on("UNLOCK", path, callback);
  }
  unsubscribe(path: string, callback: unknown) {
    this.on("UNSUBSCRIBE", path, callback);
  }
}

export default MethodRouter;
export { MethodRouter };
