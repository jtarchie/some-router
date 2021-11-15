enum methods {
  GET = "GET",
  POST = "POST",
}

interface Matcher {
  regex: RegExp;
  callback: any;
}

class PathRouter {
  routes: any = {};
  matchersByMinLength: any = {};
  matcherLengths: Array<number> = [];

  on(path: string, callback: any) {
    const lookups = path.split(/(?=:\w+)|\/|(?=\*\w*)/);

    let minLength = 0;
    const matcher = lookups.map(function (lookup, index) {
      if (lookup[0] === ":") {
        minLength += 1;
        return `(?<${lookup.slice(1)}>\\w+)`;
      } else if (lookup === "*") {
        minLength += 1;
        return `.*?`;
      } else if (lookup[0] === "*") {
        minLength += 1;
        return `(?<${lookup.slice(1)}>.*?)`;
      } else {
        minLength += lookup.length;
        return lookup.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      }
    }).join(`/`);

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
    const maxLength = path.length;

    for (let i = this.matcherLengths.length; i >= 0; i--) {
      const length = this.matcherLengths[i];
      if (length <= maxLength) {
        for (let j = 0; j < this.matchersByMinLength[length].length; j++) {
          const matcher = this.matchersByMinLength[length][j];
          const matches = matcher.regex.exec(path);
          if (matches) {
            return matcher.callback;
          }
        }
      }
    }
  }
}

class MethodRouter {
  routes: any = {};

  on(method: methods, path: string, callback: any) {
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
}

export default MethodRouter;
export { MethodRouter, methods };
