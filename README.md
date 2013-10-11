storage.js
==========

JavaScript storage adapter

## Examples

```js
// NOTE:
// Storage.cookie() is being used for the sake of this example.
// You could also use Storage.local() or Storage.session() and the API remains the same.

// Add some values to cookie storage
Storage.cookie().set('foo', 'a');
Storage.cookie().set('bar', 'b');
Storage.cookie().set('baz', 'c');

// Get values back individually
console.log(Storage.cookie().get('foo'));
console.log(Storage.cookie().get('bar'));
console.log(Storage.cookie().get('baz'));

// Iterate over all values in cookie storage
Storage.cookie().forEach(function (val, key) {
	console.log(key, '=', val);
});

// Get the keys for all the values
console.log(Storage.cookie().keys()); // ['foo', 'bar', 'baz']

// Start watching changes to foo
function fooChange(oldVal, newVal) {
	console.log('foo changed:', oldVal, newVal);
}
Storage.cookie().watch('foo', fooChange);
Storage.cookie().set('foo', 'hello world');

// Stop watching changes to foo
Storage.cookie().unwatch('foo', fooChange);

// Remove a single value
Storage.cookie().remove('bar');

// Remove all values
Storage.cookie().clear();
```

## API

#### set(key, val[, expires[, path[, domain[, secure]]]])
Add a value to storage

###### Note
The arguments `expires`, `path`, `domain` and `secure` are only applicable to `cookie()`.

#### get(key)
Get the value from storage specified by `key`

#### remove(key)
Remove value from storage specified by `key`

#### clear()
Remove all values from storage

#### keys()
Get the keys of all the values in storage

#### forEach(callback)
Invoke `callback` for each value in storage

#### watch(key, callback)
Start watching changes to the value specified by `key`

###### Note
When watching changes `callback` will be called anytime `set`, `remove` or `clear` is called.

#### unwatch(key, callback)
Stop watching changes to value specified by `key`

## License

Released under the MIT license.