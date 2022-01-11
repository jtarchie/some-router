# some-router

A framework independent routing in Javascript. It will match params, globs, and
static routes. It does not invoke the handler, just returns it.

Influenced by my experience in Sinatra Ruby framework. Motivation to have
generic router that can be used across different platforms -- HTTP, Cloudflare
Workers, etc.

## Usage

```javascript
import { MethodRouter } from "some-router";

const router = new MethodRouter();
router.get("/", function () {
  return ("/");
});
router.get("/a", function () {
  return ("/a");
});

const { callback } = router.find("/");
console.assert(callback() == "/");
```

### Route Types

- Static - This is an exact string match.

```javascript
import { MethodRouter } from "some-router";

const router = new MethodRouter();
router.get("/", () => {});
```

- Named Parameter - This support dynamic content, which will match against a
  regex wildcard (`.*?`). The parameters are returned in a `params` if a
  matching route is found as string values.

```javascript
import { MethodRouter } from "some-router";

const router = new MethodRouter();
router.get("/persons/:id/children/:child_id", () => {});

const { params } = router.find("/persons/1/children/100");
console.assert(params == { id: "1", child_id: "100" });
```

- Regexes - This supports dynamic content that needs to fit a specific regex
  matcher. The regexes must be represented in a capture group and the values
  will be returned as `regexN` in index 0 placement of the capture group.

  Named capture groups are also supported. The name on of the group will be
  placed as is in `params`.

  No effort is done to ensure regexes are proper, valid, etc. If the route isn't
  matching the regex is most likely wrong.

  **NOTE:** Proper escaping of back slash is required. This is because of
  javascript string encoding.

```javascript
import { MethodRouter } from "some-router";

const router = new MethodRouter();
router.get("/persons/(\\d+)/children/(?<child_id>\\w+)", () => {});

const { params } = router.find("/persons/1/children/100");
console.assert(params == { regex0: "1", child_id: "100" });
```

### Precedence

When defining routes, the order of declaration does not matter. The evaluation
of routes affects the order.

Listed in order of precedence:

- exact match of a static route

```javascript
import { MethodRouter } from "some-router";
const router = new MethodRouter();
router.get("/a", function () {
  return ("static");
});
router.get("/(\w+)", function () {
  return ("dynamic");
});

const { callback } = router.find("/a");
console.assert(callback() == "static");
```

- longest matching route based on minimize size of matcher (complexity)

```javascript
import { MethodRouter } from "some-router";
const router = new MethodRouter();
router.get("/:first-:second", () => {});
router.get("/:first", () => {});

const { params } = router.find("/a-b");
console.assert(params == { "first": "a", "second": "b" });
```

## Development

For development, the [`deno`](https://deno.land/) tool is used for linting and
formatting.

On Mac OS, we've included assistance for development.

```bash
brew bundle
yarn install
yarn run test
```
