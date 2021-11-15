# some-router
A framework independent routing in Javascript.
It will match params, globs, and static routes.
It does not invoke the handler, just returns it.

## Usage

```javascript
import {MethodRouter} from 'some-router';

const router = new MethodRouter();
router.get('/', function() { console.log('/')});
router.get('/a', function() { console.log('/a')});

const { callback } = router.find('/');
callback();
// stdout: /
```