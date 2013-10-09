(function (window) {

    var cookie, local, session,
        Storage = {},
        AbstractAdapter = function () {},
        StorageAdapter = function (store) { this.store = store;},
        CookieAdapter = function () {},
        abstractMethod = function (method) {
            return function () { throw new Error(method + ' is abstract and must be overridden'); };
        };

    AbstractAdapter.prototype.get   = abstractMethod('get');
    AbstractAdapter.prototype.set   = abstractMethod('set');
    AbstractAdapter.prototype.remove= abstractMethod('remove');
    AbstractAdapter.prototype.clear = abstractMethod('clear');
    AbstractAdapter.prototype.keys  = abstractMethod('keys');

    StorageAdapter.prototype = AbstractAdapter.prototype;
    CookieAdapter.prototype = AbstractAdapter.prototype;

    Storage.cookie = function () {
        if (!cookie) {
            cookie = new CookieAdapter();
        }
        return cookie;
    };

    Storage.local = function () {
        if (!local) {
            local = new StorageAdapter(localStorage);
        }
        return local;
    };

    Storage.session = function () {
        if (!session) {
            session = new StorageAdapter(sessionStorage);
        }
        return session;
    };

    // Expose Storage
    if (typeof define === 'function' && define.amd) {
        define('Storage', [], function() { return Storage; });
    } else {
        window.Storage = Storage;
    }
})(window);