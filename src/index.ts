interface Matcher {
  regex: RegExp;
  callback: any;
}

class PathRouter {
  routes: any = {};
  matchersByMinLength: any = {};
  staticMatchers: any = {};
  matcherLengths: Array<number> = [];

  on(path: string, callback: any) {
    let parts = [];
    let minLength = 0;

    for (let i = 0; i < path.length;) {
      let startingPos = i;
      for (; i < path.length && !/(:|\*)/.test(path[i]); i++);
      if (startingPos < i) {
        parts.push(
          path.slice(startingPos, i).replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
        );
        minLength += i - startingPos;
      }

      if (path[i] === ":") {
        startingPos = ++i;
        for (; i < path.length && /\w/.test(path[i]); i++);
        parts.push(`(?<${path.slice(startingPos, i)}>[^\.]+)`);
        minLength += 1;
      } else if (path[i] === "*") {
        startingPos = ++i;
        for (; i < path.length && /\w/.test(path[i]); i++);
        if (startingPos < i) {
          parts.push(`(?<${path.slice(startingPos, i)}>.+)`);
        } else {
          parts.push(`.+`);
        }
        minLength += 1;
      }
    }

    const matcher = parts.join("");
    if (path === matcher) {
      this.staticMatchers[path] = callback;
      return;
    }

    this.matchersByMinLength[minLength] ||= [];
    this.matchersByMinLength[minLength].push({
      regex: new RegExp(`^${matcher}$`),
      callback: callback,
    });

    this.matcherLengths = Object.keys(this.matchersByMinLength).map((a) =>
      Number(a)
    ).sort((a, b) => a - b);
  }

  find(path: string) {
    const matched = this.staticMatchers[path];
    if (matched) {
      return {
        callback: matched,
      };
    }

    const maxLength = path.length;

    for (let i = this.matcherLengths.length; i >= 0; i--) {
      const length = this.matcherLengths[i];

      if (length <= maxLength) {
        for (let j = 0; j < this.matchersByMinLength[length].length; j++) {
          const matcher = this.matchersByMinLength[length][j];

          const matches = matcher.regex.exec(path);
          if (matches) {
            return {
              params: matches.groups,
              callback: matcher.callback,
            };
          }
        }
      }
    }
  }
}

class MethodRouter {
  routes: any = {};

  on(method: string, path: string, callback: any) {
    this.routes[method] ||= new PathRouter();
    this.routes[method].on(path, callback);
  }

  find(method: string, path: string) {
    const pathRouter = this.routes[method];
    if (pathRouter) {
      if (path[0] !== "/") {
        path = "/" + path;
      }
      return pathRouter.find(path);
    }
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
