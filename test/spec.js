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
});

['cookie', 'local', 'session'].forEach(function (type) {
    QUnit.module(type);
    QUnit.test('get/set', function (assert) {
        Storage[type]().set('foo', 'bar');
        assert.equal(Storage[type]().get('foo'), 'bar');
    });

    QUnit.test('remove', function (assert) {
        Storage[type]().set('foo', 'bar');
        Storage[type]().remove('foo');
        assert.equal(Storage[type]().get('foo'), null);
    });

    QUnit.test('clear', function (assert) {
        Storage[type]().set('foo', 1);
        Storage[type]().set('bar', 2);
        Storage[type]().set('baz', 3);
        Storage[type]().clear();
        assert.equal(Storage[type]().keys().length, 0);
    });

    QUnit.test('keys', function (assert) {
        Storage[type]().set('foo', 1);
        Storage[type]().set('bar', 2);
        Storage[type]().set('baz', 3);

        var keys = Storage[type]().keys();
        assert.equal(keys.length, 3);
        assert.ok(keys.indexOf('foo') > -1);
        assert.ok(keys.indexOf('bar') > -1);
        assert.ok(keys.indexOf('baz') > -1);
    });
});