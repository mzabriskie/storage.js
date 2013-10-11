(function (window, document) {

    var cookie, local, session,
        stores,
        cookieStorage,
        EventService,
        Adapter;

    // Adapter
    Adapter = function (type) {
        this.type = type;
        this.store = stores[type];
        this.length = this.store.length;
    };

    Adapter.prototype.set = function (key, val) {
        var oldValue = this.get(key);

        this.store.setItem.apply(this.store, arguments);
        this.length = this.store.length;

        if (val != oldValue) {
            EventService.fireEvent(this.type, key, [oldValue, val]);
        }

        return this;
    };

    Adapter.prototype.get = function (key) {
        return this.store.getItem(key);
    };

    Adapter.prototype.remove = function (key) {
        this.set(key, null); // Set is called for the sake of firing value change event
        this.store.removeItem(key);
        this.length = this.store.length;

        return this;
    };

    Adapter.prototype.clear = function () {
        // Manually removing items for the sake of firing value change event
        var keys = this.keys(),
            i = keys.length;
        while (i--) {
            this.remove(keys[i]);
        }

        return this;
    };

    Adapter.prototype.keys = function () {
        var keys = [];
        if (typeof this.store.keys === 'function') {
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

    Adapter.prototype.watch = function (key, callback) {
        EventService.addEvent(this.type, key, callback);

        return this;
    };

    Adapter.prototype.unwatch = function (key, callback) {
        EventService.removeEvent(this.type, key, callback);

        return this;
    };

    Adapter.prototype.forEach = function (callback) {
        var keys = this.keys();
        for (var i=0, l=keys.length; i<l; i++) {
            callback(this.get(keys[i]), keys[i]);
        }
    };

    // Simulating local/sessionStorage for cookies
    cookieStorage = {
        length: 0,

        setItem: function (key, val, expires, path, domain, secure) {
            var cookie = [];
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

            this.length = this.keys().length;
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
                this.removeItem(keys[i]);
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
    cookieStorage.length = cookieStorage.keys().length;

    // Pub/Sub Service
    EventService = {
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

    // Mapping of available stores
    stores = {
        'cookie': cookieStorage,
        'local': localStorage,
        'session': sessionStorage
    };

    // Expose methods on existing Storage interface
    if (typeof window.Storage === 'undefined') {
        window.Storage = function () {};
    }

    Storage.cookie = function () {
            if (!cookie) {
                cookie = new Adapter('cookie');
            }
            return cookie;
        };
    Storage.local = function () {
            if (!local) {
                local = new Adapter('local');
            }
            return local;
        };
    Storage.session = function () {
            if (!session) {
                session = new Adapter('session');
            }
            return session;
        };
})(window, document);