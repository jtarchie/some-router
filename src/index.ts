class PathRoute {
  constructor(
    public callback: any,
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
  callback: any;
}

class PathRouter {
  routes: Array<PathRoute> = [];
  matcherByMinPrefix: mapMatchByMinPrefix = {};
  staticMatchers: mapStaticMatchers = {};
  minPrefixLength: number = Infinity;

  on(path: string, callback: any) {
    let parts = [];
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
    let $self = this;

    this.routes.forEach(function (route) {
      const prefix = route.path.slice(0, $self.minPrefixLength);
      const routes = $self.matcherByMinPrefix[prefix] || [];
      routes.push(route);
      $self.matcherByMinPrefix[prefix] = routes;
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

  on(method: string, path: string, callback: any) {
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

  acl(path: string, callback: any) {
    this.on("ACL", path, callback);
  }
  bind(path: string, callback: any) {
    this.on("BIND", path, callback);
  }
  checkout(path: string, callback: any) {
    this.on("CHECKOUT", path, callback);
  }
  connect(path: string, callback: any) {
    this.on("CONNECT", path, callback);
  }
  copy(path: string, callback: any) {
    this.on("COPY", path, callback);
  }
  delete(path: string, callback: any) {
    this.on("DELETE", path, callback);
  }
  get(path: string, callback: any) {
    this.on("GET", path, callback);
  }
  head(path: string, callback: any) {
    this.on("HEAD", path, callback);
  }
  link(path: string, callback: any) {
    this.on("LINK", path, callback);
  }
  lock(path: string, callback: any) {
    this.on("LOCK", path, callback);
  }
  msearch(path: string, callback: any) {
    this.on("M-SEARCH", path, callback);
  }
  merge(path: string, callback: any) {
    this.on("MERGE", path, callback);
  }
  mkactivity(path: string, callback: any) {
    this.on("MKACTIVITY", path, callback);
  }
  mkcalendar(path: string, callback: any) {
    this.on("MKCALENDAR", path, callback);
  }
  mkcol(path: string, callback: any) {
    this.on("MKCOL", path, callback);
  }
  move(path: string, callback: any) {
    this.on("MOVE", path, callback);
  }
  notify(path: string, callback: any) {
    this.on("NOTIFY", path, callback);
  }
  options(path: string, callback: any) {
    this.on("OPTIONS", path, callback);
  }
  patch(path: string, callback: any) {
    this.on("PATCH", path, callback);
  }
  post(path: string, callback: any) {
    this.on("POST", path, callback);
  }
  propfind(path: string, callback: any) {
    this.on("PROPFIND", path, callback);
  }
  proppatch(path: string, callback: any) {
    this.on("PROPPATCH", path, callback);
  }
  purge(path: string, callback: any) {
    this.on("PURGE", path, callback);
  }
  put(path: string, callback: any) {
    this.on("PUT", path, callback);
  }
  rebind(path: string, callback: any) {
    this.on("REBIND", path, callback);
  }
  report(path: string, callback: any) {
    this.on("REPORT", path, callback);
  }
  search(path: string, callback: any) {
    this.on("SEARCH", path, callback);
  }
  source(path: string, callback: any) {
    this.on("SOURCE", path, callback);
  }
  subscribe(path: string, callback: any) {
    this.on("SUBSCRIBE", path, callback);
  }
  trace(path: string, callback: any) {
    this.on("TRACE", path, callback);
  }
  unbind(path: string, callback: any) {
    this.on("UNBIND", path, callback);
  }
  unlink(path: string, callback: any) {
    this.on("UNLINK", path, callback);
  }
  unlock(path: string, callback: any) {
    this.on("UNLOCK", path, callback);
  }
  unsubscribe(path: string, callback: any) {
    this.on("UNSUBSCRIBE", path, callback);
  }
}

export default MethodRouter;
export { MethodRouter };
