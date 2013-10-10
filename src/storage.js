(function (window, document) {

    var cookie, local, session,
        Storage,
        StorageAdapter;

    // StorageAdapter
    StorageAdapter = function (store, type) {
        this.store = store;
        this.type = type;
    };

    StorageAdapter.prototype.set = function (key, val) {
        var existing = this.get(key);

        this.store.setItem.apply(this.store, arguments);

        if (val != existing) {
            EventService.fireEvent(this.type, key, [existing, val]);
        }

        return this;
    };

    StorageAdapter.prototype.get = function (key) {
        return this.store.getItem(key);
    };

    StorageAdapter.prototype.remove = function (key) {
        this.set(key, null); // Set is called for the sake of firing value change event
        this.store.removeItem(key);

        return this;
    };

    StorageAdapter.prototype.clear = function () {
        // Manually removing items for the sake of firing value change event
        var keys = this.keys(),
            i = keys.length;
        while (i--) {
            this.remove(keys[i]);
        }

        return this;
    };

    StorageAdapter.prototype.keys = function () {
        var keys = [];
        if (this.type === 'cookie') {
            keys = this.store.keys();
        } else {
            for (var key in this.store) {
                if (this.store.hasOwnProperty(key)) {
                    keys.push(key);
                }
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

    // Simulating local/sessionStorage for cookies
    var cookieStorage = {
        setItem: function (key, val, expires, path, domain, secure) {
            var cookie = [],
                existing = this.getItem(key);
            cookie.push(key + '=' + encodeURIComponent(val || ''));

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
        },

        getItem: function (key) {
            var match = document.cookie.match(new RegExp("(^|;)\\s*(" + key + ")\\s*=\\s*(.*?)(;|$)"));
            return (match ? decodeURIComponent(match[3]) || null : null);
        },

        removeItem: function (key) {
            this.setItem(key, null, Date.now() - 86400000);
        },

        clear: function () {
            var keys = this.keys(),
                i = keys.length;
            while (i--) {
                this.remove(keys[i]);
            }
        },

        keys: function () {
            var keys = [],
                parts = document.cookie.split(';');
            var RX_COOKIE = /(^|;)\s*(.*?)\s*=\s*(.*?)(;|$)/;

            for (var i=0, l=parts.length; i<l; i++) {
                if (parts[i].length > 0) {
                    var match = parts[i].match(RX_COOKIE);
                    if (match) {
                        keys.push(match[2]);
                    }
                }
            }

            return keys;
        }
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

    // Storage API that is publicly exposed
    Storage = {
        cookie: function () {
            if (!cookie) {
                cookie = new StorageAdapter(cookieStorage, 'cookie');
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