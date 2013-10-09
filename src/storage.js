(function (window, document) {

    var cookie, local, session,
        Storage,
        StorageAdapter,
        CookieAdapter;

    // StorageAdapter (localStorage, sessionStorage)
    StorageAdapter = function (store) { this.store = store; };

    StorageAdapter.prototype.set = function (key, val) {
        this.store.setItem(key, val);
    };

    StorageAdapter.prototype.get = function (key) {
        return this.store.getItem(key);
    };

    StorageAdapter.prototype.remove = function (key) {
        this.store.removeItem(key);
    };

    StorageAdapter.prototype.clear = function () {
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

    // CookieAdapter (document.cookie)
    CookieAdapter = function () {};

    CookieAdapter.prototype.set = function (key, val, expires, path, domain, secure) {
        var cookie = [];
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
    };

    CookieAdapter.prototype.get = function (key) {
        var match = document.cookie.match(new RegExp("(^|;)\\s*(" + key + ")\\s*=\\s*(.*?)(;|$)"));
        return (match ? decodeURIComponent(match[3]) : null);
    };

    CookieAdapter.prototype.remove = function (key) {
        this.set(key, '', Date.now() - 86400000);
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

    Storage = {
        cookie: function () {
            if (!cookie) {
                cookie = new CookieAdapter();
            }
            return cookie;
        },
        local: function () {
            if (!local) {
                local = new StorageAdapter(localStorage);
            }
            return local;
        },
        session: function () {
            if (!session) {
                session = new StorageAdapter(sessionStorage);
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