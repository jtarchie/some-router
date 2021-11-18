# some-router
A framework independent routing in Javascript.
It will match params, globs, and static routes.
It does not invoke the handler, just returns it.

## Usage

```javascript
import {MethodRouter} from 'some-router';

const router = new MethodRouter();
router.get('/', function() { return('/')});
router.get('/a', function() { return('/a')});

const { callback } = router.find('/');
console.assert(callback() == "/");
```

When defining routes, the order of declaration does not matter.
The evaluation of routes affects the order.

Listed in order of precedence:
* exact match of a static route
```javascript
const router = new MethodRouter()
router.get('/a', function() { return('static')});
router.get('/(\w+)', function() { return('dynamic')});

const { callback } = router.find('/a')
console.assert(callback() == "static");
```
* longest matching route based on minimize size of matcher
```javascript
const router = new MethodRouter()
router.get('/:first-:second', ()=>{});
router.get('/:first', ()=>{});

const { params } = router.find('/a-b')
console.assert(params == {'first': 'a', 'second': 'b'});
```

## Development

For development, the [`deno`](https://deno.land/) tool is used for linting and formatting.

On Mac OS, we've included assistance for development.

```bash
brew bundle
yarn install
yarn run test
```