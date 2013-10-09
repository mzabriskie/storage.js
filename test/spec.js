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