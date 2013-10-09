(function (window, document) {

    var cookie, local, session,
        Storage,
        StorageAdapter,
        CookieAdapter;

    // StorageAdapter (localStorage, sessionStorage)
    StorageAdapter = function (store, type) {
        this.store = store;
        this.type = type;
    };

    StorageAdapter.prototype.set = function (key, val) {
        var existing = this.get(key);

        this.store.setItem(key, val);

        if (val != existing) {
            EventService.fireEvent(this.type, key, [existing, val]);
        }
    };

    StorageAdapter.prototype.get = function (key) {
        return this.store.getItem(key);
    };

    StorageAdapter.prototype.remove = function (key) {
        this.set(key, null);
        this.store.removeItem(key);
    };

    StorageAdapter.prototype.clear = function () {
        var keys = this.keys(),
            i = keys.length;
        while (i--) {
            this.remove(keys[i]);
        }
        this.store.clear();
    };

    StorageAdapter.prototype.keys = function () {
        var keys = [];
        for (var key in this.store) {
            if (this.store.hasOwnProperty(key)) {
                keys.push(key);
            }
        }
        return keys;
    };

    StorageAdapter.prototype.watch = function (key, callback) {
        EventService.addEvent(this.type, key, callback);
    };

    StorageAdapter.prototype.unwatch = function (key, callback) {
        EventService.removeEvent(this.type, key, callback);
    };

    // CookieAdapter (document.cookie)
    CookieAdapter = function () {};

    CookieAdapter.prototype.set = function (key, val, expires, path, domain, secure) {
        var cookie = [],
            existing = this.get(key);
        cookie.push(key + '=' + encodeURIComponent(val));

        if (typeof expires === 'number') {
            var date = new Date();
            date.setTime(expires);
            cookie.push('expires=' + date.toGMTString());
        }

        if (typeof path === 'string') {
            cookie.push('path=' + path);
        }

        if (typeof domain === 'string') {
            cookie.push('domain=' + domain);
        }

        if (secure === true) {
            cookie.push('secure');
        }

        document.cookie = cookie.join('; ');

        if (val != existing) {
            EventService.fireEvent('cookie', key, [existing, val]);
        }
    };

    CookieAdapter.prototype.get = function (key) {
        var match = document.cookie.match(new RegExp("(^|;)\\s*(" + key + ")\\s*=\\s*(.*?)(;|$)"));
        return (match ? decodeURIComponent(match[3]) : null);
    };

    CookieAdapter.prototype.remove = function (key) {
        this.set(key, null, Date.now() - 86400000);
    };

    CookieAdapter.prototype.clear = function () {
        var keys = this.keys(),
            i = keys.length;
        while (i--) {
            this.remove(keys[i]);
        }
    };

    var RX_COOKIE = /(^|;)\s*(.*?)\s*=\s*(.*?)(;|$)/;
    CookieAdapter.prototype.keys = function () {
        var keys = [],
            parts = document.cookie.split(';');

        for (var i=0, l=parts.length; i<l; i++) {
            if (parts[i].length > 0) {
                var match = parts[i].match(RX_COOKIE);
                if (match) {
                    keys.push(match[2]);
                }
            }
        }

        return keys;
    };

    CookieAdapter.prototype.watch = function (key, callback) {
        EventService.addEvent('cookie', key, callback);
    };

    CookieAdapter.prototype.unwatch = function (key, callback) {
        EventService.removeEvent('cookie', key, callback);
    };

    // Pub/Sub Service
    var EventService = {
        registry: {},

        addEvent: function (adapter, key, callback) {
            if (typeof this.registry[adapter] === 'undefined') {
                this.registry[adapter] = {};
            }

            if (typeof this.registry[adapter][key] === 'undefined') {
                this.registry[adapter][key] = [];
            }

            this.registry[adapter][key].push(callback);
        },

        removeEvent: function (adapter, key, callback) {
            if (typeof this.registry[adapter] === 'undefined' ||
                typeof this.registry[adapter][key] === 'undefined') {
                return;
            }

            var queue = this.registry[adapter][key],
                i = queue.length;
            while (i--) {
                if (queue[i] === callback) {
                    queue.splice(i, 1);
                }
            }
        },

        fireEvent: function (adapter, key, args) {
            if (typeof this.registry[adapter] === 'undefined' ||
                typeof this.registry[adapter][key] === 'undefined') {
                return;
            }

            var queue = this.registry[adapter][key];
            for (var i=0, l=queue.length; i<l; i++) {
                queue[i].apply(null, args);
            }
        }
    };

    Storage = {
        cookie: function () {
            if (!cookie) {
                cookie = new CookieAdapter();
            }
            return cookie;
        },
        local: function () {
            if (!local) {
                local = new StorageAdapter(localStorage, 'local');
            }
            return local;
        },
        session: function () {
            if (!session) {
                session = new StorageAdapter(sessionStorage, 'session');
            }
            return session;
        }
    };

    // Expose Storage
    if (typeof define === 'function' && define.amd) {
        define('Storage', [], function() { return Storage; });
    } else {
        window.Storage = Storage;
    }
})(window, document);