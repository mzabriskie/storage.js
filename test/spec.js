QUnit.testDone(function () {
    Storage.cookie().clear();
    Storage.local().clear();
    Storage.session().clear();
});

QUnit.module('API');
QUnit.test('cookie methods', function (assert) {
    assert.equal(typeof Storage.cookie, 'function');
    assert.equal(typeof Storage.cookie(), 'object');
    assert.equal(typeof Storage.cookie().get, 'function');
    assert.equal(typeof Storage.cookie().set, 'function');
    assert.equal(typeof Storage.cookie().remove, 'function');
    assert.equal(typeof Storage.cookie().clear, 'function');
    assert.equal(typeof Storage.cookie().keys, 'function');
    assert.equal(typeof Storage.cookie().watch, 'function');
    assert.equal(typeof Storage.cookie().unwatch, 'function');
});

QUnit.test('local methods', function (assert) {
    assert.equal(typeof Storage.local, 'function');
    assert.equal(typeof Storage.local(), 'object');
    assert.equal(Storage.local().store, localStorage);
    assert.equal(typeof Storage.local().get, 'function');
    assert.equal(typeof Storage.local().set, 'function');
    assert.equal(typeof Storage.local().remove, 'function');
    assert.equal(typeof Storage.local().clear, 'function');
    assert.equal(typeof Storage.local().keys, 'function');
    assert.equal(typeof Storage.local().watch, 'function');
    assert.equal(typeof Storage.local().unwatch, 'function');
});

QUnit.test('session methods', function (assert) {
    assert.equal(typeof Storage.session, 'function');
    assert.equal(typeof Storage.session(), 'object');
    assert.equal(Storage.session().store, sessionStorage);
    assert.equal(typeof Storage.session().get, 'function');
    assert.equal(typeof Storage.session().set, 'function');
    assert.equal(typeof Storage.session().remove, 'function');
    assert.equal(typeof Storage.session().clear, 'function');
    assert.equal(typeof Storage.session().keys, 'function');
    assert.equal(typeof Storage.session().watch, 'function');
    assert.equal(typeof Storage.session().unwatch, 'function');
});

['cookie', 'local', 'session'].forEach(function (type) {
    var storage = Storage[type]();

    QUnit.module(type);
    QUnit.test('get/set', function (assert) {
        storage.set('foo', 'bar');
        assert.equal(storage.get('foo'), 'bar');
    });

    QUnit.test('remove', function (assert) {
        storage.set('foo', 'bar');
        storage.remove('foo');
        assert.equal(storage.get('foo'), null);
    });

    QUnit.test('clear', function (assert) {
        storage.set('foo', 1);
        storage.set('bar', 2);
        storage.set('baz', 3);
        storage.clear();
        assert.equal(storage.keys().length, 0);
    });

    QUnit.test('keys', function (assert) {
        storage.set('foo', 1);
        storage.set('bar', 2);
        storage.set('baz', 3);

        var keys = storage.keys();
        assert.equal(keys.length, 3);
        assert.ok(keys.indexOf('foo') > -1);
        assert.ok(keys.indexOf('bar') > -1);
        assert.ok(keys.indexOf('baz') > -1);
    });

    QUnit.test('watch', function (assert) {
        var data1 = {
                oldVal: null,
                newVal: null
            },
            data2 = {
                oldVal: null,
                newVal: null
            },
            callback1 = function (oldVal, newVal) {
                data1.oldVal = oldVal;
                data1.newVal = newVal;
            },
            callback2 = function (oldVal, newVal) {
                data2.oldVal = oldVal;
                data2.newVal = newVal;
            };

        storage.watch('foo', callback1);
        storage.watch('foo', callback2);

        storage.set('foo', 1);
        assert.equal(data1.oldVal, null);
        assert.equal(data1.newVal, 1);
        assert.equal(data2.oldVal, null);
        assert.equal(data2.newVal, 1);

        storage.set('foo', 2);
        assert.equal(data1.oldVal, 1);
        assert.equal(data1.newVal, 2);
        assert.equal(data2.oldVal, 1);
        assert.equal(data2.newVal, 2);

        storage.unwatch('foo', callback1);

        storage.set('foo', 3);
        assert.equal(data1.oldVal, 1);
        assert.equal(data1.newVal, 2);
        assert.equal(data2.oldVal, 2);
        assert.equal(data2.newVal, 3);

        storage.remove('foo');
        assert.equal(data2.oldVal, 3);
        assert.equal(data2.newVal, null);

        storage.set('foo', 1);
        assert.equal(data2.oldVal, null);
        assert.equal(data2.newVal, 1);

        storage.clear();
        assert.equal(data2.oldVal, 1);
        assert.equal(data2.newVal, null);
    });

    QUnit.test('chaining', function (assert) {
        assert.equal(storage
                    .clear()
                    .set('foo', 1)
                    .set('bar', 2)
                    .set('baz', 3)
                    .remove('bar')
                    .keys().length, 2);
    });
});