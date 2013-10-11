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
    assert.equal(typeof Storage.cookie().forEach, 'function');
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
    assert.equal(typeof Storage.local().forEach, 'function');
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
    assert.equal(typeof Storage.session().forEach, 'function');
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

    QUnit.test('forEach', function (assert) {
        storage.set('foo', 'a');
        storage.set('bar', 'b');
        storage.set('baz', 'c');

        var keys = [], vals = [];
        storage.forEach(function (val, key) {
            vals.push(val);
            keys.push(key);
        });

        assert.equal(vals.length, 3);
        assert.equal(keys.length, 3);

        assert.ok(vals.indexOf('a') > -1);
        assert.ok(vals.indexOf('b') > -1);
        assert.ok(vals.indexOf('c') > -1);

        assert.ok(keys.indexOf('foo') > -1);
        assert.ok(keys.indexOf('bar') > -1);
        assert.ok(keys.indexOf('baz') > -1);
    });

    QUnit.test('chaining', function (assert) {
        assert.equal(storage
                    .clear()
                    .set('foo', 1)
                    .set('bar', 2)
                    .set('baz', 3)
                    .remove('bar')
                    .watch('foo', function () {})
                    .unwatch('foo', function () {})
                    .set('foo', 5)
                    .keys().length, 2);
    });
});

//QUnit.module('local');
//QUnit.test('max', function (assert) {
//    var error = false,
//        count = 0,
//        lipsum = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Duis consectetur ultrices felis in tristique. Sed tortor eros, tempor id risus at, faucibus auctor augue. Suspendisse pharetra, sem ac commodo ornare, odio diam hendrerit augue, vitae egestas libero tellus ut lacus. Quisque rutrum in urna sed faucibus. Cras vestibulum convallis ligula id semper. Suspendisse vehicula nisi eu risus tincidunt, sed placerat eros malesuada. Vestibulum augue elit, molestie at dui ut, suscipit egestas nisi. Nunc condimentum justo sit amet rutrum porta. Aliquam erat volutpat. Nunc dapibus sollicitudin lacinia. Quisque molestie vel urna vitae semper. Morbi id consequat tellus, at lacinia felis. Quisque tincidunt felis in magna imperdiet gravida. Morbi at massa dolor.' +
//                'Morbi non rutrum nulla. In accumsan arcu at justo faucibus volutpat. Morbi consectetur commodo purus, eu ornare metus scelerisque eu. Duis posuere consectetur arcu eget tincidunt. Cras mollis leo sed fringilla mattis. Suspendisse vitae volutpat ante. Phasellus pulvinar nisl suscipit mi convallis, eu porttitor nibh consequat. Proin a varius libero. Vestibulum fermentum egestas dolor sed elementum. Donec suscipit malesuada est. Quisque sollicitudin, leo ac porta semper, nibh nisl pulvinar magna, eu faucibus justo ante id velit. Etiam sem libero, interdum sit amet interdum dignissim, tristique vel felis. Phasellus semper massa sed accumsan fringilla. Sed venenatis, libero blandit facilisis viverra, lectus eros interdum est, quis mattis enim velit sit amet turpis. Nunc viverra lacinia enim iaculis lacinia.' +
//                'Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos. Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas. Quisque sit amet dui nec lorem tempus luctus. Nunc quis quam semper tortor luctus scelerisque. In hac habitasse platea dictumst. Aliquam porta arcu quis elit facilisis varius. Morbi pretium purus nisi, in tincidunt ligula sagittis sit amet.' +
//                'Curabitur ante metus, accumsan non mollis sed, luctus at metus. Donec sed nisl at eros euismod molestie. Aliquam erat volutpat. Vivamus rutrum quis odio id imperdiet. Cras facilisis tellus neque, sed mollis lectus rhoncus auctor. Proin euismod massa ac aliquam aliquam. Sed ac pharetra mi, in interdum tellus. Donec imperdiet erat quis adipiscing ornare. Maecenas posuere convallis dui. Donec vel odio venenatis, feugiat augue vitae, sagittis nulla. Vestibulum id orci sit amet dui ornare eleifend a sed nibh. Nam volutpat placerat pulvinar. Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos.' +
//                'Ut suscipit neque volutpat commodo congue. In elementum consectetur leo. Phasellus congue libero in ipsum rutrum, id sagittis lectus mollis. In hac habitasse platea dictumst. Fusce in eros fringilla, rhoncus mi vitae, lacinia elit. Vestibulum at congue lacus, a sagittis nulla. Etiam ultrices accumsan nisi sodales condimentum. Vivamus a nisl sagittis, convallis velit sed, adipiscing eros. Pellentesque ut urna a metus sollicitudin consequat. Duis ac luctus nisl. Nunc hendrerit risus sit amet lacinia fringilla. Morbi nec sollicitudin ante.';
//
//    lipsum += lipsum;
//    lipsum += lipsum;
//    lipsum += lipsum;
//    lipsum += lipsum;
//    lipsum += lipsum;
//    lipsum += lipsum;
//
//    console.log('');
//    console.log('Lipsum:', lipsum.length / 3171);
//    console.log('Mb:', (lipsum.length * 8) / (1024 * 1024));
//
//    try {
//        while (true) {
//            count++;
//            Storage.local().set('key' + Date.now(), lipsum);
//        }
//    } catch (e) {
//        console.log('Loops:', count);
//        error = true;
//    }
//
//    assert.ok(error);
//});

//['local', 'session'].forEach(function (type) {
//    var storage = Storage[type]();
//
//    QUnit.test('json', function (assert) {
//        storage.set('foo', {a:123, b:456, c: {d:'abc'}});
//        var val = storage.get('foo');
//        assert.equal(typeof val, 'object');
//    });
//});