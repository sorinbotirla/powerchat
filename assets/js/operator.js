String.prototype.hexEncode = function(){
    var hex, i;

    var result = "";
    for (i=0; i<this.length; i++) {
        hex = this.charCodeAt(i).toString(16);
        result += ("000"+hex).slice(-4);
    }

    return result
};

String.prototype.hexDecode = function(){
    var j;
    var hexes = this.match(/.{1,4}/g) || [];
    var back = "";
    for(j = 0; j<hexes.length; j++) {
        back += String.fromCharCode(parseInt(hexes[j], 16));
    }

    return back;
};
$.support.cors = true;
var OperatorChat = function(){
    var _self = this;
    var $body = $("body");
    _self.waiters = {};
    _self.repeaters = {};
    _self.timeZone = "ro-RO";
    _self.websocketUrl = ""; // THE WEBSOCKET SERVER URL
    _self.apiUrl = ""; // THE index.php URL
    _self.attachmentsUrl = ""; // THE attachments folder URL
    _self.websocketPort = "5678"; // THE WEBSOCKET PORT
    _self.conversationsUpdateInterval = 1000;
    _self.conversationsUpdateMaxTimeout = 5000;
    _self.conversationsUpdatesLastTime = {};
    _self.filesObjectToUpload = new FormData();
    _self.focused = false;
    _self.$easyzoom = null;
    _self.operator = "Operator"; // DEFAULT OPERATOR NAME, CAN BE UPDATED IF MULTIPLE OPERATORS ARE USED
    _self.windowUUID = null;
    _self.clientId = null;
    _self.clientEmail = null;
    _self.clientName = null;
    _self.clientIsOnline = 0;
    _self.clientSentEmail = false;
    _self.clientInitials = null;
    _self.initialMessage = null;
    _self.pwrChatOperatortId = null;
    _self.pwrClientConversationUUID = null;
    _self.deviceData = null;
    _self.operatorAnswered = 0;
    _self.waitingForClientResponse = 0;
    _self.clientAvatarColor = "#000000";
    _self.totalConversations = 0;
    _self.renderedConversations = 0;
    _self.conversationsPage = 1;
    _self.conversationsTotalPages = 1;
    _self.lastOperatorMessages = {};
    _self.canFetchNextPage = 1;
    _self.filters = {
        conversations: {
            show: "all",
            page: 1,
            search: ""
        }
    };
    _self.lastConversationsData = [];

    _self.timeAgoEN = function(ms) {
        const now = new Date();
        const then = new Date(ms);

        // Normalize to local midnight to avoid time-of-day issues
        const nowMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const thenMidnight = new Date(then.getFullYear(), then.getMonth(), then.getDate());

        const diffMs = nowMidnight - thenMidnight;
        const diffDay = Math.floor(diffMs / (1000 * 60 * 60 * 24));

        // For "Today", "Yesterday", etc.
        if (diffDay === 0) return "Today";
        if (diffDay === 1) return "Yesterday";
        if (diffDay === 2) return "2 days ago";
        if (diffDay < 7) return diffDay+" days ago";
        if (diffDay < 14) return "Last week";
        if (diffDay < 30) return Math.floor(diffDay / 7)+" weeks ago";
        if (diffDay < 60) return "Last month";
        if (diffDay < 365) return Math.floor(diffDay / 30)+" months ago";
        if (diffDay < 730) return "Last year";
        return Math.floor(diffDay / 365)+" years ago";
    };
    
    _self.uuid = function() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    };

    _self.safeSetItem = function(key, value) {
        try { localStorage.setItem(key, value); } catch (e) { /* maybe log or ignore */ }
    };
    _self.safeGetItem = function(key) {
        try { return localStorage.getItem(key); } catch (e) { return null; }
    };

    _self.safeDecodeURIComponent = function(str) {
        try {
            return decodeURIComponent(str);
        } catch (e) {
            return str; // fallback to original if decoding fails
        }
    };

    _self.MD5 = function(d){
        var md5 = function (d) {
            return M(V(Y(X(d), 8 * d.length)))
        }
        function M (d) {
            for (var _, m = '0123456789abcdef', f = '', r = 0; r < d.length; r++) {
                _ = d.charCodeAt(r)
                f += m.charAt(_ >>> 4 & 15) + m.charAt(15 & _)
            }
            return f
        }
        function X (d) {
            for (var _ = Array(d.length >> 2), m = 0; m < _.length; m++) {
                _[m] = 0
            }
            for (m = 0; m < 8 * d.length; m += 8) {
                _[m >> 5] |= (255 & d.charCodeAt(m / 8)) << m % 32
            }
            return _
        }
        function V (d) {
            for (var _ = '', m = 0; m < 32 * d.length; m += 8) _ += String.fromCharCode(d[m >> 5] >>> m % 32 & 255)
            return _
        }
        function Y (d, _) {
            d[_ >> 5] |= 128 << _ % 32
            d[14 + (_ + 64 >>> 9 << 4)] = _
            for (var m = 1732584193, f = -271733879, r = -1732584194, i = 271733878, n = 0; n < d.length; n += 16) {
                var h = m
                var t = f
                var g = r
                var e = i
                f = md5ii(f = md5ii(f = md5ii(f = md5ii(f = md5hh(f = md5hh(f = md5hh(f = md5hh(f = md5gg(f = md5gg(f = md5gg(f = md5gg(f = md5ff(f = md5ff(f = md5ff(f = md5ff(f, r = md5ff(r, i = md5ff(i, m = md5ff(m, f, r, i, d[n + 0], 7, -680876936), f, r, d[n + 1], 12, -389564586), m, f, d[n + 2], 17, 606105819), i, m, d[n + 3], 22, -1044525330), r = md5ff(r, i = md5ff(i, m = md5ff(m, f, r, i, d[n + 4], 7, -176418897), f, r, d[n + 5], 12, 1200080426), m, f, d[n + 6], 17, -1473231341), i, m, d[n + 7], 22, -45705983), r = md5ff(r, i = md5ff(i, m = md5ff(m, f, r, i, d[n + 8], 7, 1770035416), f, r, d[n + 9], 12, -1958414417), m, f, d[n + 10], 17, -42063), i, m, d[n + 11], 22, -1990404162), r = md5ff(r, i = md5ff(i, m = md5ff(m, f, r, i, d[n + 12], 7, 1804603682), f, r, d[n + 13], 12, -40341101), m, f, d[n + 14], 17, -1502002290), i, m, d[n + 15], 22, 1236535329), r = md5gg(r, i = md5gg(i, m = md5gg(m, f, r, i, d[n + 1], 5, -165796510), f, r, d[n + 6], 9, -1069501632), m, f, d[n + 11], 14, 643717713), i, m, d[n + 0], 20, -373897302), r = md5gg(r, i = md5gg(i, m = md5gg(m, f, r, i, d[n + 5], 5, -701558691), f, r, d[n + 10], 9, 38016083), m, f, d[n + 15], 14, -660478335), i, m, d[n + 4], 20, -405537848), r = md5gg(r, i = md5gg(i, m = md5gg(m, f, r, i, d[n + 9], 5, 568446438), f, r, d[n + 14], 9, -1019803690), m, f, d[n + 3], 14, -187363961), i, m, d[n + 8], 20, 1163531501), r = md5gg(r, i = md5gg(i, m = md5gg(m, f, r, i, d[n + 13], 5, -1444681467), f, r, d[n + 2], 9, -51403784), m, f, d[n + 7], 14, 1735328473), i, m, d[n + 12], 20, -1926607734), r = md5hh(r, i = md5hh(i, m = md5hh(m, f, r, i, d[n + 5], 4, -378558), f, r, d[n + 8], 11, -2022574463), m, f, d[n + 11], 16, 1839030562), i, m, d[n + 14], 23, -35309556), r = md5hh(r, i = md5hh(i, m = md5hh(m, f, r, i, d[n + 1], 4, -1530992060), f, r, d[n + 4], 11, 1272893353), m, f, d[n + 7], 16, -155497632), i, m, d[n + 10], 23, -1094730640), r = md5hh(r, i = md5hh(i, m = md5hh(m, f, r, i, d[n + 13], 4, 681279174), f, r, d[n + 0], 11, -358537222), m, f, d[n + 3], 16, -722521979), i, m, d[n + 6], 23, 76029189), r = md5hh(r, i = md5hh(i, m = md5hh(m, f, r, i, d[n + 9], 4, -640364487), f, r, d[n + 12], 11, -421815835), m, f, d[n + 15], 16, 530742520), i, m, d[n + 2], 23, -995338651), r = md5ii(r, i = md5ii(i, m = md5ii(m, f, r, i, d[n + 0], 6, -198630844), f, r, d[n + 7], 10, 1126891415), m, f, d[n + 14], 15, -1416354905), i, m, d[n + 5], 21, -57434055), r = md5ii(r, i = md5ii(i, m = md5ii(m, f, r, i, d[n + 12], 6, 1700485571), f, r, d[n + 3], 10, -1894986606), m, f, d[n + 10], 15, -1051523), i, m, d[n + 1], 21, -2054922799), r = md5ii(r, i = md5ii(i, m = md5ii(m, f, r, i, d[n + 8], 6, 1873313359), f, r, d[n + 15], 10, -30611744), m, f, d[n + 6], 15, -1560198380), i, m, d[n + 13], 21, 1309151649), r = md5ii(r, i = md5ii(i, m = md5ii(m, f, r, i, d[n + 4], 6, -145523070), f, r, d[n + 11], 10, -1120210379), m, f, d[n + 2], 15, 718787259), i, m, d[n + 9], 21, -343485551)
                m = safeadd(m, h)
                f = safeadd(f, t)
                r = safeadd(r, g)
                i = safeadd(i, e)
            }
            return [m, f, r, i]
        }
        function md5cmn (d, _, m, f, r, i) {
            return safeadd(bitrol(safeadd(safeadd(_, d), safeadd(f, i)), r), m)
        }
        function md5ff (d, _, m, f, r, i, n) {
            return md5cmn(_ & m | ~_ & f, d, _, r, i, n)
        }
        function md5gg (d, _, m, f, r, i, n) {
            return md5cmn(_ & f | m & ~f, d, _, r, i, n)
        }
        function md5hh (d, _, m, f, r, i, n) {
            return md5cmn(_ ^ m ^ f, d, _, r, i, n)
        }
        function md5ii (d, _, m, f, r, i, n) {
            return md5cmn(m ^ (_ | ~f), d, _, r, i, n)
        }
        function safeadd (d, _) {
            var m = (65535 & d) + (65535 & _)
            return (d >> 16) + (_ >> 16) + (m >> 16) << 16 | 65535 & m
        }
        function bitrol (d, _) {
            return d << _ | d >>> 32 - _
        }
        function MD5Unicode(buffer){
            if (!(buffer instanceof Uint8Array)) {
                buffer = new TextEncoder().encode(typeof buffer==='string' ? buffer : JSON.stringify(buffer));
            }
            var binary = [];
            var bytes = new Uint8Array(buffer);
            for (var i = 0, il = bytes.byteLength; i < il; i++) {
                binary.push(String.fromCharCode(bytes[i]));
            }
            return md5(binary.join(''));
        }

        return MD5Unicode(d);
    };
    _self.nameValid = function(val){
        return !val || /^[a-zA-Z ]+$/.test(val) || val.toString().trim() == "";
    };
    _self.alphaOnly = function(val){
        return !val || /^[a-zA-Z ]+$/.test(val) || val.toString().trim() == "";
    };
    _self.emailValid = function(email) {
        return (!!email && email.toString().trim().length > 0 && (/^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(email))) ? true : false;
    };
    _self.phoneValid = function(phone) {
        return (!!phone && phone.toString().trim().split("").filter(function(v){return /^[0-9]*$/.test(v) ? true : false; }).length >= 10 && phone.toString().trim().replace("+4", "").length >= 10 && /^[\d()+]+$/.test(phone)) ? true : false;
    };
    _self.millisToMinutesAndSeconds = function(duration) {
        duration = Math.abs(duration);

        var milliseconds = parseInt((duration % 1000) / 100),
            seconds = Math.abs(Math.floor((duration / 1000) % 60)),
            minutes = Math.abs(Math.floor((duration / (1000 * 60)) % 60)),
            hours = Math.abs(Math.floor((duration / (1000 * 60 * 60)) % 24));

        hours = (hours < 10) ? "0" + hours : hours;
        minutes = (minutes < 10) ? "0" + minutes : minutes;
        seconds = (seconds < 10) ? "0" + seconds : seconds;

        return hours + ":" + minutes + ":" + seconds;
    };

    _self.hslToHex = function(h, s, l) {
        s /= 100;
        l /= 100;
        let c = (1 - Math.abs(2 * l - 1)) * s;
        let x = c * (1 - Math.abs((h / 60) % 2 - 1));
        let m = l - c / 2;
        let r = 0, g = 0, b = 0;
        if (h < 60) { r = c; g = x; }
        else if (h < 120) { r = x; g = c; }
        else if (h < 180) { g = c; b = x; }
        else if (h < 240) { g = x; b = c; }
        else if (h < 300) { r = x; b = c; }
        else { r = c; b = x; }
        r = Math.round((r + m) * 255);
        g = Math.round((g + m) * 255);
        b = Math.round((b + m) * 255);
        return "#" + [r, g, b].map(x => x.toString(16).padStart(2, '0')).join('');
    }

    _self.getRandomColor = function(brightness) {
        brightness = Math.max(0, Math.min(100, brightness));
        const h = Math.floor(Math.random() * 360);
        const s = 50; // 50% desaturated
        const l = brightness;
        return _self.hslToHex(h, s, l);
    };

    _self.setUrlParameter = function(paramName, paramValue){
        const url = new URL(window.location.href);
        url.searchParams.delete(paramName);
        if (Array.isArray(paramValue)) {
            paramValue = _self.safeDecodeURIComponent(paramValue.join(","));
        }
        console.log(paramValue);
        url.searchParams.set(paramName, paramValue);
        window.history.replaceState(null, null, url); // or pushState

        var hostParams = {};
        hostParams[paramName] = paramValue;
    };

    _self.setUrlParameters = function(params){
        const url = new URL(window.location.href);
        var hostParams = {};
        Object.keys(params).forEach(function(paramName, i) {
            var paramValue = params[paramName];
            url.searchParams.delete(paramName);
            if (Array.isArray(paramValue)) {
                paramValue = _self.safeDecodeURIComponent(paramValue.join(","));
            }
            // console.log(paramValue);
            url.searchParams.set(paramName, paramValue);

            hostParams[paramName] = paramValue;
        });
        window.history.replaceState(null, null, url); // or pushState
    };

    _self.deleteUrlParameter = function(paramName){
        const url = new URL(window.location.href);
        url.searchParams.delete(paramName);
        window.history.replaceState(null, null, url); // or pushState
    };

    _self.deleteUrlParameters = function(params){
        const url = new URL(window.location.href);
        params.forEach(function(paramName, i){
            url.searchParams.delete(paramName);
        });
        window.history.replaceState(null, null, url); // or pushState
    };

    _self.getUrlParameter = function(sParam) {
        const url = new URL(window.location.href);
        var paramVal = "";
        //check if search param contains []
        if (sParam.toString().indexOf("[]") > -1) {
            paramVal = url.searchParams.getAll(sParam);
        } else {
            var foundWithBrackets = false,
                foundWithoutBrackets = false;
            //check if search param doesn't contain [] but url param has []
            url.searchParams.forEach(function(paramValue, paramName){
                if (paramName.indexOf("[]") > -1) {
                    if (paramName.replace("[]", "").trim() == sParam.trim()) {
                        // found param as []
                        foundWithBrackets = true;
                    }
                } else {
                    if (paramName.trim() == sParam.trim()) {
                        foundWithoutBrackets = true;
                    }
                }
            });

            if (foundWithBrackets == true) {
                paramVal = url.searchParams.getAll(sParam.trim()+"[]");
                if (foundWithoutBrackets == true) {
                    paramVal.push(_self.safeDecodeURIComponent(url.searchParams.get(sParam)));
                }
            } else {
                paramVal = _self.safeDecodeURIComponent(url.searchParams.get(sParam));
            }
        }
        if ("string" == typeof paramVal) {
            if (paramVal.indexOf(",") > -1) {
                paramVal = paramVal.split(",");
            }
        }

        if ("null" === paramVal) {
            paramVal = null;
        }
        return paramVal;
    };

    _self.getAllUrlParameters = function(filteredParams, excludedParameters){
        const url = new URL(window.location.href);
        var urlParameters = [];
        if ("undefined" == typeof excludedParameters) {
            var excludedParameters = [];
        }
        url.searchParams.forEach(function(paramValue, paramName){
            if (urlParameters.indexOf(paramName) == -1) {
                if (!!filteredParams && filteredParams.length > 0) {
                    if (filteredParams.indexOf(paramName) > -1 && excludedParameters.indexOf(paramName) == -1) {
                        urlParameters.push(paramName);
                    }
                } else {
                    if (excludedParameters.indexOf(paramName) == -1) {
                        urlParameters.push(paramName);
                    }
                }
            }
        });
        return urlParameters;
    };

    _self.sendMessageToParent = function(msg){
        if (!!window.parent) {
            window.parent.postMessage(msg, '*');
        }
        if (!!window.opener) {
            window.opener.postMessage(msg, '*');
        }
    };

    _self.sanitize = function(str) {
        if (str == null) return '';
        str = String(str);
        str = str.replace(/<\/?[^>]+(>|$)/g, "");
        const textarea = document.createElement('textarea');
        textarea.innerHTML = str;
        str = textarea.value;
        return str;
    };

    _self.stripTrackingParams = function(url) {
        try {
            var parsed = new URL(url);
            // List of tracker param substrings (add any new as needed)
            var trackerPatterns = [
                "utm", "ga", "gad", "gclid", "fbclid", "yclid", "msclkid", "igshid", "mc", "ref", "trk", "spm", "amp", "vero", "hsa", "sca", "pk", "wt", "gbraid", "utm_source"
            ];
            // Make a list of params to remove (cannot modify while iterating in some browsers)
            var keysToRemove = [];
            parsed.searchParams.forEach(function(value, key) {
                var lowerKey = key.toLowerCase();
                for (var i = 0; i < trackerPatterns.length; i++) {
                    if (lowerKey.indexOf(trackerPatterns[i]) !== -1) {
                        keysToRemove.push(key);
                        break;
                    }
                }
            });
            keysToRemove.forEach(function(key) {
                parsed.searchParams.delete(key);
            });

            var cleanUrl = parsed.origin + parsed.pathname;
            var query = parsed.searchParams.toString();
            if (query) {
                cleanUrl += "?" + query;
            }
            if (parsed.hash) {
                cleanUrl += parsed.hash;
            }
            return cleanUrl;
        } catch (e) {
            return url;
        }
    };

    _self.linkifySafe = function(text, additionalClass) {
        text = _self.sanitize(text);

        function escapeHtml(str) {
            str = _self.sanitize(str);
            return str.replace(/[&<>"']/g, function(m) {
                switch (m) {
                    case '&': return '&amp;';
                    case '<': return '&lt;';
                    case '>': return '&gt;';
                    case '"': return '&quot;';
                    case "'": return '&#39;';
                    default: return m;
                }
            });
        }

        // Regex to find URLs (http/https only)
        const urlRegex = /((https?:\/\/)[\w\-.~:/?#[\]@!$&'()*+,;=%]+)/gi;

        return escapeHtml(text).replace(urlRegex, function(url) {
            if (!/^https?:\/\//i.test(url)) return url;
            var cleanUrl = _self.stripTrackingParams(url);
            // Show the cleaned URL both as href and as visible text
            return '<a class="url'+("undefined" != typeof additionalClass && "string" == typeof additionalClass ? " "+_self.sanitize(additionalClass) : "")+'" href="'+_self.sanitize(cleanUrl)+'" target="_blank" rel="noopener noreferrer">'+_self.sanitize(cleanUrl)+'</a>';
        });
    };

    _self.extractFirstUrl = function(text) {
        var match = text.match(/https?:\/\/[^\s<>"']+/i);
        return match ? match[0] : null;
    }

    _self.reverse = function(str) {
        return Array.from(str).reverse().join("");
    };

    _self.arrayShuffle = function(arr){
        const a = arr.slice();
        for (let i = a.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [a[i], a[j]] = [a[j], a[i]];
        }
        return a;
    };

    _self.isJson = function(str) {
        if (!str || typeof str !== 'string') return false;
        try {
            const obj = JSON.parse(str);
            return typeof obj === 'object' && obj !== null;
        } catch (e) {
            return false;
        }
    }

    _self.isBase64 = function (str) {
        if (typeof str !== 'string') return false;

        // Normalize string
        const normalized = str.trim().replace(/\r?\n|\r/g, '');

        // Must be divisible by 4
        if (normalized.length % 4 !== 0) return false;

        // Must only contain valid base64 characters
        if (!/^[A-Za-z0-9+/]+={0,2}$/.test(normalized)) return false;

        try {
            const decoded = atob(normalized);

            // Optional sanity check: base64 strings often decode to printable characters.
            // Reject if many null chars (or garbage) are present
            const nonPrintable = decoded.replace(/[\x20-\x7E]/g, '');
            if (nonPrintable.length > decoded.length * 0.3) return false;

            // Confirm roundtrip
            return btoa(decoded).replace(/=+$/, '') === normalized.replace(/=+$/, '');
        } catch (e) {
            return false;
        }
    };

    _self.prependArray = function(value, array) {
        var newArray = array.slice();
        newArray.unshift(value);
        return newArray;
    };

    _self.fallbackCopyTextToClipboard = function(text) {
        var textArea = document.createElement("textarea");
        textArea.value = text;

        // Avoid scrolling to bottom
        textArea.style.top = "0";
        textArea.style.left = "0";
        textArea.style.position = "fixed";

        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();

        try {
            var successful = document.execCommand('copy');
            var msg = successful ? 'successful' : 'unsuccessful';
            // console.log('Fallback: Copying text command was ' + msg);
        } catch (err) {
            // console.error('Fallback: Oops, unable to copy', err);
        }

        document.body.removeChild(textArea);
    };

    _self.copyTextToClipboard = function(text) {
        if (!navigator.clipboard) {
            _self.fallbackCopyTextToClipboard(text);
            return;
        }

        navigator.clipboard.write([
            new ClipboardItem({
                'text/html': new Blob([text], {type: 'text/html'}),
                'text/plain': new Blob([text], {type: 'text/plain'})
            })
        ]).then(function() {
            // console.log('Async: Copying to clipboard was successful!');
        }, function(err) {
            // console.error('Async: Could not copy text: ', err);
        });

        // navigator.clipboard.writeText(text).then(function() {
        //     console.log('Async: Copying to clipboard was successful!');
        // }, function(err) {
        //     console.error('Async: Could not copy text: ', err);
        // });
    };

    _self.renderOnlineOperators = function(data, callback) {
        var $html = "";
        if ("undefined" != typeof data && "undefined" != typeof data["data"]
        && "undefined" != typeof data["data"]["onlineOperators"] && data["data"]["onlineOperators"].length > 0) {
            $html += "Online Operators: ";
            data["data"]["onlineOperators"].forEach(function(onlineOperator, i){
                $html += "<div class='onlineOperator'>"+_self.sanitize(onlineOperator["operator"])+"</div>";
            });
        }

        $body.find(".onlineOperators").html($html);
    };

    _self.checkOpenConversations = function(){
        var conversations = {
            "openedConversations": {},
            "viewingConversations": {}
        };

        if (_self.pwrClientConversationUUID != null) {
            conversations["openedConversations"][_self.pwrClientConversationUUID] = {
                operator: _self.operator
            };
        } else {
            conversations["openedConversations"] = {};
        }

        $.ajax({
            url: _self.apiUrl + "/",
            type: "POST",
            data: {
                c: btoa(encodeURIComponent(JSON.stringify({
                    method: "handShake",
                    data: btoa(encodeURIComponent(JSON.stringify(conversations))),
                    operator: btoa(encodeURIComponent(_self.operator))
                })))
            },
            success: function (data) {
                if ("string" == typeof data) {
                    if (_self.isJson(data)) {
                        data = JSON.parse(data);
                    }
                }

                _self.renderOnlineOperators(data);

                if ("undefined" != typeof data["data"]) {
                    var requestTime = data["time"],
                        openedConversations = data["data"]["openedConversations"],
                        viewingConversations = data["data"]["viewingConversations"],
                        openedConversationUUIDs = [];

                    Object.keys(openedConversations).forEach(function(openedConversation, i){
                        var conversationUUID = _self.sanitize(openedConversation.toString().trim());
                        if (!!conversationUUID) {
                            if (openedConversationUUIDs.indexOf(conversationUUID) == -1) {
                                openedConversationUUIDs.push(conversationUUID);
                            }
                        }
                    });

                    $body.find(".powerChatConversationsList .conversationItem[data-conversationuuid]").each(function(){
                        var $conversation = $(this),
                            conversationUUID = $conversation.attr('data-conversationuuid');

                        if ($conversation.hasClass("dno")) {
                            $conversation.removeClass("dno");
                        }
                        if (openedConversationUUIDs.indexOf(conversationUUID) > -1 && "undefined" != typeof openedConversations[conversationUUID] && "undefined" != typeof openedConversations[conversationUUID]["operator"]) {
                            var operator =  openedConversations[conversationUUID]["operator"];
                            if ($conversation.find(".conversationItemClientName .openedBy").length == 0) {
                                $("<div class='openedBy'>taken over by "+_self.sanitize(operator)+"</div>").insertAfter($conversation.find(".conversationItemClientName .onlineStatus"));
                            } else {
                                if (_self.sanitize($conversation.find(".conversationItemClientName .openedBy").text()) != "taken over by "+_self.sanitize(operator)) {
                                    $conversation.find(".conversationItemClientName .openedBy").text(_self.sanitize(operator));
                                }
                            }

                            if (_self.operator != operator && !$conversation.hasClass("dno")) {
                                $conversation.addClass("dno");
                            }
                            if (_self.conversationUUID == conversationUUID && !$conversation.hasClass("dno")) {
                                if (_self.operator != operator) {
                                    $conversation.addClass("dno");
                                } else {
                                    if ($conversation.hasClass("dno")) {
                                        $conversation.removeClass("dno");
                                    }
                                }
                            } else {
                                if ($conversation.hasClass("dno")) {
                                    $conversation.removeClass("dno");
                                }
                            }
                        } else {
                            if ($conversation.find(".conversationItemClientName .openedBy").length > 0) {
                                $conversation.find(".conversationItemClientName .openedBy").remove();
                            }
                        }
                    });
                }

            },
            error: function (a, b, c) {
                //console.log(a,b,c);
            },
            complete: function () {

            }
        });
    };

    _self.monitorConversationOpening = function(start){
        if ("undefined" != typeof _self.repeaters.conversationOpeningMonitorInterval) {
            clearInterval(_self.repeaters.conversationOpeningMonitorInterval);
        }
        if (!!start) {
            _self.checkOpenConversations();
            _self.repeaters.conversationOpeningMonitorInterval = setInterval(function(){
                _self.checkOpenConversations();
            },1000);
        }
    };

    _self.getInitials = function(name){
        if (typeof name !== "undefined" && typeof name === "string") {
            var matches = name.match(/(^\S\S?|\s\S)?/g);
            if (matches) {
                return matches.map(function(v){ return v.trim(); }).join("").match(/(^\S|\S$)?/g).join("").toUpperCase();
            }
        }
        return "NA";
    };

    _self.capitalizeLetters = function(text){
        return ("undefined" != typeof text && "string" == typeof text) ? text.replace(/(^\w|\s\w)(\S*)/g, (_,m1,m2) => m1.toUpperCase()+m2.toLowerCase()) : "";
    };

    _self.confirm = function(question, buttonYesText, buttonNotext, buttonYesFunction, buttonNoFunction, dialogClass){
        if ("undefined" != typeof question) {
            var $html = '<div id="dialog-confirm" title="'+question+'">';
            $html += '</div>';

            if ($body.find("#dialog-confirm").length) {
                $body.find("#dialog-confirm").remove();
            }
            $body.append($html);

            if ("function" == typeof $.fn.dialog) {
                // console.log("Dialog opening");
                $body.find("#dialog-confirm" ).dialog({
                    dialogClass: dialogClass,
                    resizable: false,
                    height: "auto",
                    width: 400,
                    closeOnEscape: false,
                    modal: true,
                    position: [(($(document).width()-302)/2),150],
                    create: function (event, ui) {
                        $(event.target).parent().css('position', 'fixed');
                    },
                    buttons: [
                        {
                            text: buttonNotext,
                            class: "dialogButtonNo",
                            click: function() {
                                if ("function" == typeof buttonNoFunction) {
                                    buttonNoFunction();
                                }
                                $(this).dialog("close");
                            }
                        },
                        {
                            text: buttonYesText,
                            class: "dialogButtonYes",
                            click: function() {
                                if ("function" == typeof buttonYesFunction) {
                                    buttonYesFunction();
                                }
                                $(this).dialog("close");
                            }
                        }
                    ]
                });
            }
        }
    };

    _self.prompt = function(question, buttonYesText, buttonNotext, buttonYesFunction, buttonNoFunction, dialogClass){
        if ("undefined" != typeof question) {
            var $html = '<div id="dialog-form" title="'+question+'">';
            $html += '<div class="promptForm">';
            $html += "<input type='text' class='promptFormInput' id='promptFormInput' />"
            $html += '</div>';
            $html += '</div>';

            if ($body.find("#dialog-form").length) {
                $body.find("#dialog-form").remove();
            }
            $body.append($html);

            if ("function" == typeof $.fn.dialog) {
                // console.log("Dialog opening");
                $body.find("#dialog-form" ).dialog({
                    dialogClass: dialogClass,
                    resizable: false,
                    height: "auto",
                    width: 400,
                    closeOnEscape: false,
                    modal: true,
                    position: [(($(document).width()-302)/2),150],
                    create: function (event, ui) {
                        $(event.target).parent().css('position', 'fixed');
                    },
                    buttons: [
                        {
                            text: buttonNotext,
                            class: "dialogButtonNo",
                            click: function() {
                                if ("function" == typeof buttonNoFunction) {
                                    buttonNoFunction();
                                }
                                $(this).dialog("close");
                            }
                        },
                        {
                            text: buttonYesText,
                            class: "dialogButtonYes",
                            click: function() {
                                if ("function" == typeof buttonYesFunction) {
                                    buttonYesFunction();
                                }
                                $(this).dialog("close");
                            }
                        }
                    ]
                });
            }
        }
    };

    _self.msg = function(msg, msgType){
        if ("undefined" == typeof msgType) {
            var msgType = "info";
        }

        if ("undefined" == typeof msg) {
            var msg = "";
        }
        msg = msg.trim();

        // if (_self.msgMaxCharacters < msg.length) {
        //     msg.substring(0, _self.msgMaxCharacters);
        // }
        // if (_self.msgMaxCharacters > msg.length) {
        //     msg = msg+Array(parseInt(_self.msgMaxCharacters-msg.length,10)).join("*");
        // }
        $body.find(".statusMsgs .msg").remove();
        $body.find(".statusMsgs").prepend("<div id='row"+_self.lastRow+"' class='msg "+msgType+"' style='white-space: nowrap;'>"+msg+"</div>");
        $body.find(".statusMsgs .msg").addClass("show");

        if ("undefined" != typeof _self.waiters.hideMsgTimeout){
            clearTimeout(_self.waiters.hideMsgTimeout)
        }
        _self.waiters.hideMsgTimeout = setTimeout(function(){
            $body.find(".statusMsgs .msg").removeClass("show");
        },3000);
    };

    _self.loader = function(start) {
        if ("undefined" == typeof start || "boolean" != typeof start) {
            var start = true;
        }

        if (start) {
            $body.addClass("loading");
        } else {
            $body.removeClass("loading");
        }
    };

    _self.getTime = function(callback){
        $.ajax({
            url: _self.apiUrl + "/",
            data: {
                method: "gettime"
            },
            success: function(resp){
                if ("undefined" != typeof resp) {
                    if ("string" == typeof resp && _self.isJson(resp)) {
                        resp = JSON.parse(resp);
                    }
                    if ("function" == typeof callback) {
                        callback(resp);
                    }
                }
            },
            error: function(a,b,c){

            },
            complete: function(){

            }
        });
    };

    _self.checkUserPermission = function(username, callback){
        $.ajax({
            url: _self.apiUrl + "/",
            type: "POST",
            data: {
                method: "checkuser",
                username: username
            },
            success: function(data){

            },
            error: function(a,b,c) {
                console.log(a,b,c);
            },
            complete: function(xhr) {
                var allowed = false;
                if (200 == xhr.status && _self.isJson(xhr.responseText)) {
                    var data = JSON.parse(xhr.responseText);
                    if ("undefined" != typeof data) {
                        if ("undefined" != typeof data["allowed"]) {
                            if (true == data["allowed"]) {
                                allowed = true;
                            }
                        }
                    }
                }
                callback(allowed, data["data"]);
            }
        });
    };

    _self.WebSocketServer = null;

    _self.WebSocketServerIsOnline = function(){
        if (null !== _self.WebSocketServer && "undefined" != typeof _self.WebSocketServer.readyState && _self.WebSocketServer.readyState === WebSocket.OPEN) {
            return true;
        }
        return false;
    };

    _self.initWebsocketServer = function(callback){
        if (false == _self.WebSocketServerIsOnline()) {
            // console.log("Server not online. Starting");
            _self.WebSocketServer = ("undefined" != typeof ReconnectingWebSocket) ? new ReconnectingWebSocket("wss://"+_self.websocketUrl+":"+_self.websocketPort, null, {debug: false, reconnectInterval: 3000}) : new WebSocket("wss://"+_self.websocketUrl+":"+_self.websocketPort);

            _self.WebSocketServer.onopen = function (e) {
                if (true == _self.WebSocketServerIsOnline()) {
                    // console.log("Websocket connection is open");
                    // console.log(_self.currentClient + " connected...");
                    _self.WebSocketServer.send(btoa(JSON.stringify({
                        "comm": "clientConnected",
                        "data": {
                            "attr": "operator",
                            "operator": _self.operator,
                            "uuid": _self.pwrChatOperatortId,
                            "windowuuid": _self.windowUUID,
                            "message": ""
                        }
                    })));

                    if ("function" == typeof callback) {
                        callback();
                    }
                }
            };
            _self.WebSocketServer.onclose = function (e) {
                // console.log("Websocket connection closed.");
            };
            _self.WebSocketServer.onerror = function (e) {
                // console.log("Websocket connection error.");
            };
            _self.WebSocketServer.onmessage = function (e) {
                // var info = JSON.parse(atob(e.data));
                var info = e.data;
                _self.handleWSMessage(info);
            };
        } else {
            // console.log("Server is online. will continue");
            if ("function" == typeof callback) {
                callback();
            }
        }
    };

    _self.handleWSMessage = function(message) {
        // console.log("Incoming message" , message);
        if (_self.isBase64(message)) {
            message = _self.safeDecodeURIComponent(atob(message));
            if (_self.isJson(message)) {
                message = JSON.parse(message);
                if ("undefined" != typeof message["uuids"] && message["uuids"].length > 0) {
                    _self.renderOperatorClientsConversations(message["uuids"], "ws");
                } else if ("undefined" != typeof message["comm"]) {
                    switch(message["comm"]){
                        case "newMessage":
                            if ("undefined" != typeof message["data"]["uuid"] && "undefined" != typeof message["data"]["clientname"]) {
                                _self.renderMessage(message["data"]["uuid"], message["data"]["clientname"], message["data"]["message"], "Client", "Client", new Date().toLocaleString( _self.timeZone), ("undefined" != typeof message["data"]["files"]) ? message["data"]["files"] : "", ("undefined" != typeof message["data"]["seen"] && 1 == message["data"]["seen"]) ? message["data"]["seen"] : 0, ("undefined" != typeof message["data"]["emailed"] && 1 == message["data"]["emailed"]) ? message["data"]["emailed"] : 0);
                                _self.handleUnreadMessages(message["data"]["uuid"], function(resp){
                                    _self.renderUnreadMessages(resp);
                                });
                            } else if ("undefined" != typeof message["data"]["uuid"] && "undefined" != typeof message["data"]["attr"] && "operator" == message["data"]["attr"] && "undefined" != typeof message["data"]["operator"]) {
                                _self.renderMessage(message["data"]["uuid"], message["data"]["operator"], message["data"]["message"], "Operator", "Operator", new Date().toLocaleString( _self.timeZone), ("undefined" != typeof message["data"]["files"]) ? message["data"]["files"] : "", ("undefined" != typeof message["data"]["seen"] && 1 == message["data"]["seen"]) ? message["data"]["seen"] : 0, ("undefined" != typeof message["data"]["emailed"] && 1 == message["data"]["emailed"]) ? message["data"]["emailed"] : 0);
                                _self.handleUnreadMessages(message["data"]["uuid"], function(resp){
                                    _self.renderUnreadMessages(resp);
                                });
                            }
                            break;
                        case "clientConnected":
                            _self.renderChatNotice(message["data"]["message"], new Date().toLocaleString( _self.timeZone));
                            if ("undefined" != typeof message["data"]["uuid"] && "undefined" != typeof message["data"]["clientemail"]) {
                                _self.handleClientConnect(message["data"]["uuid"], message["data"]["clientemail"], function(){
                                    console.log("Connect", message);
                                });
                            }
                            break;
                        case "clientDisconnected":
                            _self.renderChatNotice(message["data"]["message"], new Date().toLocaleString( _self.timeZone));
                            if ("undefined" != typeof message["data"]["uuid"] && "undefined" != typeof message["data"]["clientemail"]) {
                                _self.handleClientDisconnect(message["data"]["uuid"], message["data"]["clientemail"], function(){
                                    console.log("Disconnect", message);
                                });
                            }
                            break;
                        case "typingEvent":
                            if ("undefined" != typeof message["data"]["uuid"] && "undefined" != typeof message["data"]["clientname"]) {
                                _self.renderTypingEvent(message["data"]["uuid"], message["data"]["clientname"]);
                            }
                            break;
                        case "seenEvent":
                            if ("undefined" != typeof message["data"]["uuid"] && "undefined" != typeof message["data"]["clientname"]) {
                                _self.renderSeenEvent(message["data"]["uuid"], message["data"]["clientname"]);
                            }
                            break;
                    }
                }
            }
        }
    };

    _self.sendMessage = function(message, files, callback){
        var messageObj = {
            "comm": "newMessage",
            "data": {
                "attr": "operator",
                "operator": _self.operator,
                "uuid": _self.pwrChatOperatortId,
                "windowuuid": _self.windowUUID,
                "message": message,
                "files": ("undefined" != typeof files && Array.isArray(files) && files.length > 0) ? btoa(encodeURIComponent(JSON.stringify(files))) : "",
                "isonline": ("undefined" != typeof _self.clientIsOnline && 1 == _self.clientIsOnline) ? 1 : 0
            }
        };
        if (true == _self.WebSocketServerIsOnline()) {
            _self.WebSocketServer.send(btoa(encodeURIComponent(JSON.stringify(messageObj))));
            _self.logMessage(messageObj, function(resp){
                if ("function" == typeof callback){
                    callback(resp);
                }
            });
        } else {
            _self.initWebsocketServer(function(){
                _self.WebSocketServer.send(btoa(encodeURIComponent(JSON.stringify(messageObj))));
                _self.logMessage(messageObj, function(resp){
                    if ("function" == typeof callback){
                        callback(resp);
                    }
                });
            })
        }
    };

    _self.sendTypingEvent = function(callback){
        var messageObj = {
            "comm": "typingEvent",
            "data": {
                "attr": "operator",
                "operator": _self.operator,
                "uuid": _self.pwrChatOperatortId,
                "windowuuid": _self.windowUUID
            }
        };
        if (true == _self.WebSocketServerIsOnline()) {
            _self.WebSocketServer.send(btoa(encodeURIComponent(JSON.stringify(messageObj))));
            if ("function" == typeof callback){
                callback();
            }
        } else {
            _self.initWebsocketServer(function(){
                _self.WebSocketServer.send(btoa(encodeURIComponent(JSON.stringify(messageObj))));
                if ("function" == typeof callback){
                    callback();
                }
            });
        }
    };

    _self.logMessage = function(messageObj, callback) {
        // console.log("Logging message", messageObj);
        $.ajax({
            url: _self.apiUrl + "/",
            data: {
                method: "logmessage",
                data: btoa(encodeURIComponent(JSON.stringify(messageObj)))
            },
            success: function (resp) {
                if ("undefined" != typeof resp) {
                    if ("string" == typeof resp && _self.isJson(resp)) {
                        resp = JSON.parse(resp);
                    }
                    if ("function" == typeof callback) {
                        callback(resp);
                    }
                }
            },
            error: function (a, b, c) {

            },
            complete: function () {

            }
        });
    };

    _self.setupOperator = function(callback){
        // console.log("Setting up operator..");
        if (!!!_self.safeGetItem("pwrchatoperatorid")) {
            _self.safeSetItem("pwrchatoperatorid", _self.uuid());
        }
        _self.windowUUID = _self.uuid();
        _self.pwrChatOperatortId = _self.safeGetItem("pwrchatoperatorid");

        localStorage.openpages = Date.now();

        if ("function" == typeof callback) {
            callback();
        }
    };

    _self.checkClientUUID = function(callback){
        // console.log("Checking uuid");
        $.ajax({
            url: _self.apiUrl + "/",
            data: {
                method: "checkclientuuid",
                data: btoa(encodeURIComponent(_self.pwrChatOperatortId))
            },
            success: function (resp) {
                if ("undefined" != typeof resp) {
                    if ("string" == typeof resp && _self.isJson(resp)) {
                        resp = JSON.parse(resp);
                    }
                    if ("function" == typeof callback) {
                        callback(resp);
                    }
                }
            },
            error: function (a, b, c) {

            },
            complete: function () {

            }
        });
    };

    _self.renderChatNotice = function(message, time){
        var $conversationWrapper = $body.find(".powerChatConversationMessagesInner"),
            $noticeHtml = "<div class='conversationNotice'>"+_self.sanitize(message)+"</div>";
        $conversationWrapper.append($noticeHtml);
        if ("undefined" != typeof _self.waiters.scrollConversationToBottomTimeout) {
            clearTimeout(_self.waiters.scrollConversationToBottomTimeout);
        }
        _self.waiters.scrollConversationToBottomTimeout = setTimeout(function(){
            _self.scrollConversationToBottom();
        },100);
    };

    _self.handleUnreadMessages = function(uuid, callback){
        $.ajax({
            url: _self.apiUrl + "/",
            data: {
                method: "getunreadmessages",
                uuid: btoa(encodeURIComponent(uuid))
            },
            success: function (resp) {
                if ("undefined" != typeof resp) {
                    if ("string" == typeof resp && _self.isJson(resp)) {
                        resp = JSON.parse(resp);
                    }
                    if ("function" == typeof callback) {
                        callback(resp);
                    }
                }
            },
            error: function (a, b, c) {

            },
            complete: function () {

            }
        });
    };

    _self.getUrlPreview = function(url,callback){
        // Call your PHP endpoint
        $.ajax({
            type: 'POST',
            url: _self.apiUrl+"/", // adapt path as needed
            data: {
                method: "geturlpreview",
                url: btoa(encodeURIComponent(url))
            },
            dataType: 'json',
            success: function(resp) {
                if ("undefined" != typeof resp) {
                    if ("string" == typeof resp && _self.isJson(resp)) {
                        resp = JSON.parse(resp);
                    }

                    if ("function" == typeof callback) {
                        callback(resp);
                    }
                }
            },
            error: function(a,b,c){
                //none
            },
            complete: function(){

            }
        });
    };
    _self.renderUrlPreview = function(data, $element, callback){
        // Call your PHP endpoint
        if ("undefined" != typeof data && "undefined" != typeof data["data"] && $body.find($element).length > 0) {
            var previewHtml = "<div class='waLinkPreview'>";
            if ("undefined" != typeof data["data"]["image"]) {
                previewHtml += "<div class='waLinkPreviewImg'><img src='" + encodeURI(_self.sanitize(data["data"]["image"])) + "' alt='' /></div>";
            }
            previewHtml += "<div class='waLinkPreviewBody'>";

            if ("undefined" != typeof data["data"]["title"]) {
                previewHtml += "<div class='waLinkPreviewTitle'>" + _self.sanitize(data["data"]["title"]) + "</div>";
            }

            if ("undefined" != typeof data["data"]["description"]) {
                previewHtml += "<div class='waLinkPreviewDesc'>" + _self.sanitize(data["data"]["description"]) + "</div>"
            };
            if ("undefined" != typeof data["data"]["url"]) {
                previewHtml += "<div class='waLinkPreviewUrl'><a href='" + _self.sanitize(encodeURI(data["data"]["url"])) + "' target='_blank' rel='noopener noreferrer'>" + _self.sanitize(data["data"]["url"]) + "</a></div>";
            }
            previewHtml += "</div></div>";

            $element.html(previewHtml);

            if ("undefined" != typeof _self.waiters.scrollConversationToBottomTimeout) {
                clearTimeout(_self.waiters.scrollConversationToBottomTimeout);
            }
            _self.waiters.scrollConversationToBottomTimeout = setTimeout(function(){
                _self.scrollConversationToBottom();
            },100);

            if ("function" == typeof callback) {
                callback();
            }
        }
    };

    _self.renderUnreadMessages = function(data){
        // console.log("rendering unread messages", data["data"]["newmessages"], _self.safeDecodeURIComponent(atob(data["data"]["uuid"])));
        if ("undefined" != typeof data && "undefined" != typeof data["data"] && "undefined" != typeof data["data"]["newmessages"] && !isNaN(data["data"]["newmessages"])
        && "undefined" != typeof data["data"]["uuid"] && _self.isBase64(data["data"]["uuid"])) {
            if ($body.find(".conversationItem[data-conversationuuid='"+_self.sanitize(_self.safeDecodeURIComponent(atob(data["data"]["uuid"])))+"']").length > 0) {
                $body.find(".conversationItem[data-conversationuuid='"+_self.sanitize(_self.safeDecodeURIComponent(atob(data["data"]["uuid"])))+"']").find(".newMessagesCounter").attr("data-newmessages", _self.sanitize(data["data"]["newmessages"])).text(_self.sanitize(data["data"]["newmessages"]));
            }
        }
    };

    _self.renderMessage = function(uuid, authorName, message, author, mClassType, time, files, seen, emailed){
        // console.log("New message", uuid, authorName, message, author, mClassType, time, files, seen, emailed);
        var hasUrl = false,
            urlPreviewUuid = "url_"+_self.uuid(),
            messageUuid = _self.uuid();

        if ("undefined" == typeof seen) {
            var seen = 0;
        }
        if ("undefined" == typeof emailed) {
            var emailed = 0;
        }
        if ("undefined" != typeof uuid && "undefined" != typeof author) {
            // show the message in conversation
            var $conversationItem = $body.find(".powerChatConversationsList .conversationItem[data-conversationuuid='"+_self.sanitize(uuid)+"']"),
                $conversationWrapper = $body.find(".powerChatConversationMessagesInner");

            if (uuid == _self.pwrClientConversationUUID) {
                var $messageHtml = "<div data-messageuuid='"+_self.sanitize(messageUuid)+"' class='message message" + _self.sanitize(mClassType.toString()) + " table'>";
                if ("Client" == mClassType) {
                    $messageHtml += "<div class='messageAuthor td'>";
                    $messageHtml += "<div class='messageAuthorAvatarWrapper'>";
                    $messageHtml += "<div class='messageAuthorInitials' style='background-color: "+_self.sanitize(_self.clientAvatarColor)+" !important;'>" + _self.sanitize(_self.clientInitials) + "</div>";
                    $messageHtml += "</div>";
                    $messageHtml += "</div>";
                    if ($conversationWrapper.length > 0) {
                        $conversationWrapper.find(".typingEventMessage").remove();
                    }
                    if ($conversationItem.length > 0) {
                        $conversationItem.find(".conversationItemIsTyping").attr("data-istyping", "0");
                    }
                }
                $messageHtml += "<div class='messageContent td'>";
                $messageHtml += "<div class='messageContentInner'>";
                // if ("Client" == mClassType) {
                if ("undefined" != typeof authorName && "string" == typeof authorName && authorName.toString().trim().length > 0) {
                    $messageHtml += "<div class='messageAuthorName'>" + _self.sanitize(("Client" == mClassType && _self.isBase64(authorName)) ? _self.safeDecodeURIComponent(atob(authorName)) : authorName) + "</div>";
                }

                // }
                if ("undefined" != typeof message && "string" == typeof message && message.toString().trim().length > 0) {
                    $messageHtml += "<div class='messageContentText'>";
                    if (1 == emailed) {
                        $messageHtml += "<i class='fas fa-envelope'></i>&nbsp;";
                    }

                    $messageHtml += _self.linkifySafe(_self.sanitize(message), urlPreviewUuid);
                    $messageHtml += "</div>";
                }

                if ("undefined" != typeof files && "string" == typeof files && _self.isBase64(files)) {
                    files = _self.safeDecodeURIComponent(atob(files));
                    if (_self.isJson(files)) {
                        files = JSON.parse(files);
                    }
                    if (Array.isArray(files) && files.length > 0) {
                        $messageHtml += "<div class='messageContentFiles'>";
                        files.forEach(function(file, f){
                            var ext = ("undefined" != typeof file && file.toString().indexOf(".") > -1 && file.split('.').pop().toString().trim().length > 0) ? file.split('.').pop() : "";
                            switch(ext.toString().trim().toLowerCase()){
                                case "jpg":
                                case "jpeg":
                                case "png":
                                case "webp":
                                case "webm":
                                    $messageHtml += "<div class='messageImgItem' data-imgsrc='"+_self.sanitize(_self.attachmentsUrl+"/"+_self.sanitize(_self.pwrClientConversationUUID)+"/original/"+_self.sanitize(file))+"'><img src='"+_self.sanitize(_self.attachmentsUrl+"/"+_self.sanitize(_self.pwrClientConversationUUID)+"/optimized/"+_self.sanitize(file))+"' /></div>";
                                    break;
                                case "mp4":
                                case "m4v":
                                    $messageHtml += "<div class='messageVideoItem' data-videosrc='"+_self.sanitize(_self.attachmentsUrl+"/"+_self.sanitize(_self.pwrClientConversationUUID)+"/original/"+_self.sanitize(file))+"'><i class='fas fa-play'></i></div>";
                                    break;
                            }

                        });
                        $messageHtml += "</div>";
                    }

                }
                $messageHtml += "<div class='messageContentDate'>"+_self.sanitize(time).replace("T", " ")+(("Operator" == mClassType) ? "<span class='messageSeenStatus' data-seen='"+seen+"'><i class='fas fa-check-double'></i></span>" : "") +"</div>";
                $messageHtml += "</div>";
                $messageHtml += "</div>";
                $messageHtml += "</div>";

                $conversationWrapper.append($messageHtml);

                //build preview if it has an url
                if (typeof message === "string" && message.trim().length > 0) {
                    var url = _self.extractFirstUrl(_self.sanitize(message));
                    if (url) {
                        // Find the most recent message block you just appended
                        var $lastMessage = $conversationWrapper.find(".message[data-messageuuid='"+messageUuid+"']").last();
                        var $previewDiv = $("<div class='messageUrlPreview' style='margin-top:8px;'></div>");
                        $lastMessage.find(".messageContentInner").prepend($previewDiv);

                        _self.getUrlPreview(url, function(respUrlPreview){
                            _self.renderUrlPreview(respUrlPreview, $lastMessage.find(".messageUrlPreview"));
                        });
                    }
                }

                if ("undefined" != typeof _self.waiters.scrollConversationToBottomTimeout) {
                    clearTimeout(_self.waiters.scrollConversationToBottomTimeout);
                }
                _self.waiters.scrollConversationToBottomTimeout = setTimeout(function(){
                    _self.scrollConversationToBottom();
                },100);
            }

            // show the message in conversations list
            if ($conversationItem.length > 0) {
                if ("string" == typeof author && _self.isBase64(_self.sanitize(author))) {
                    author = _self.sanitize(_self.safeDecodeURIComponent(atob(_self.sanitize(author))));
                }
                if (_self.sanitize(message).toString().trim().length > 0) {
                    if ($conversationItem.find(".conversationItemClientName .lastMessageWrapper").text() != (("Operator" == mClassType && author == _self.operator) ? "You:" : _self.sanitize(author)+": "+_self.sanitize(message))) {
                        $conversationItem.find(".conversationItemClientName .lastMessageWrapper").text(("Operator" == mClassType && author == _self.operator ? "You:" : _self.sanitize(author)+":")+" "+_self.sanitize(message)).attr("data-haslastmessage", "1");
                    }
                } else if (Array.isArray(files) && files.length > 0 || "string" == typeof files && true == _self.isBase64(files)) {
                    if ($conversationItem.find(".conversationItemClientName .lastMessageWrapper").text() != ("Operator" == mClassType && author == _self.operator ? "You: sent media files": _self.sanitize(author)+" sent media files")) {
                        $conversationItem.find(".conversationItemClientName .lastMessageWrapper").text(("Operator" == mClassType && author == _self.operator ? "You: sent media files": _self.sanitize(author)+" sent media files")).attr("data-haslastmessage", "1");
                    }
                }
            }
        }
    };

    _self.handleClientConnect = function(uuid, email, callback) {
        if ("undefined" != typeof uuid && "undefined" != typeof email) {
            console.log("Disconnect", uuid, email);
        }
        if ($body.find(".conversationItem[data-conversationuuid='"+_self.sanitize(uuid)+"']").length > 0) {
            $body.find(".conversationItem[data-conversationuuid='"+_self.sanitize(uuid)+"']").attr("data-online", 1);
            $body.find(".conversationItem[data-conversationuuid='"+_self.sanitize(uuid)+"']").find(".onlineStatus").attr("data-isonline", 1).text("online");
        }

        if (uuid == _self.pwrClientConversationUUID) {
            _self.clientIsOnline = 1;
            var $parent = $body.find(".powerChatConversationActionsNewMessageWrapper");
            _self.waiters.showTextareaTimeout = setTimeout(function () {
                if (_self.clientIsOnline == 1) {
                    // show input to direct message
                    var restoredMessage = "";
                    if ("undefined" != typeof _self.lastOperatorMessages[_self.pwrClientConversationUUID]) {
                        restoredMessage = _self.sanitize(_self.lastOperatorMessages[_self.pwrClientConversationUUID]);
                    }
                    $parent.html('<textarea class="newMessageInput" id="newMessageInput" name="newMessageInput" value="'+_self.sanitize(restoredMessage)+'" placeholder="' + ((_self.clientIsOnline == 1) ? "Write your message here" : "Send message on Customer Email") + '" rows="1" spellcheck="false" data-msg="' + _self.sanitize(new Date().getTime()) + '"></textarea>');
                    $parent.find("#newMessageInput").focus();
                    if ($body.find(".powerChatConversationInner").hasClass("emailOnly")) {
                        $body.find(".powerChatConversationInner").removeClass("emailOnly");
                        $body.find(".powerChatConversationInner").attr("data-operatoranswered", _self.operatorAnswered);
                    }
                } else {
                    // send email response
                    $parent.html('<a href="javascript:void(0);" class="btnOpenSendEmailPopup">Send message on Customer Email</a>');
                    if (!$body.find(".powerChatConversationInner").hasClass("emailOnly")) {
                        $body.find(".powerChatConversationInner").addClass("emailOnly");
                        $body.find(".powerChatConversationInner").attr("data-operatoranswered", _self.operatorAnswered);
                    }
                }
            }, 10);
        }
        if ("function" == typeof callback) {
            callback();
        }
    };

    _self.handleClientDisconnect = function(uuid, email, callback) {
        if ("undefined" != typeof uuid && "undefined" != typeof email) {
            console.log("Disconnect", uuid, email);
        }
        if ($body.find(".conversationItem[data-conversationuuid='"+_self.sanitize(uuid)+"']").length > 0) {
            $body.find(".conversationItem[data-conversationuuid='"+_self.sanitize(uuid)+"']").attr("data-online", 0);
            $body.find(".conversationItem[data-conversationuuid='"+_self.sanitize(uuid)+"']").find(".onlineStatus").attr("data-isonline", 0).text("offline");
        }
        if (uuid == _self.pwrClientConversationUUID) {
            _self.clientIsOnline = 0;
            var $parent = $body.find(".powerChatConversationActionsNewMessageWrapper");
            _self.waiters.showTextareaTimeout = setTimeout(function(){
                if (_self.clientIsOnline == 1) {
                    // show input to direct message
                    var restoredMessage = "";
                    if ("undefined" != typeof _self.lastOperatorMessages[_self.pwrClientConversationUUID]) {
                        restoredMessage = _self.sanitize(_self.lastOperatorMessages[_self.pwrClientConversationUUID]);
                    }
                    $parent.html('<textarea class="newMessageInput" id="newMessageInput" name="newMessageInput" value="'+_self.sanitize(restoredMessage)+'" placeholder="'+((_self.clientIsOnline == 1) ? "Write your message here" : "Send message on Customer Email")+'" rows="1" spellcheck="false" data-msg="'+_self.sanitize(new Date().getTime())+'"></textarea>');
                    $parent.find("#newMessageInput").focus();
                    if ($body.find(".powerChatConversationInner").hasClass("emailOnly")) {
                        $body.find(".powerChatConversationInner").removeClass("emailOnly");
                    }
                } else {
                    // send email response
                    $parent.html('<a href="javascript:void(0);" class="btnOpenSendEmailPopup">Send message on Customer Email</a>');
                    if (!$body.find(".powerChatConversationInner").hasClass("emailOnly")) {
                        $body.find(".powerChatConversationInner").addClass("emailOnly");
                    }
                }
                if ($body.find(".powerChatConversationInner").attr("data-operatoranswered"), _self.sanitize(_self.operatorAnswered)) {
                    $body.find(".powerChatConversationInner").attr("data-operatoranswered", _self.sanitize(_self.operatorAnswered));
                }
            },10);
        }
        if ("function" == typeof callback) {
            callback();
        }
    };

    _self.renderTypingEvent = function(uuid, clientName){
        if ("undefined" != typeof uuid && "undefined" != typeof clientName) {
            // show typing event only in conversations list
            var $conversationItem = $body.find(".powerChatConversationsList .conversationItem[data-conversationuuid='"+_self.sanitize(uuid)+"']"),
                $conversationWrapper = $body.find(".powerChatConversationMessagesInner");
            if ($conversationItem.length > 0) {
                $conversationItem.find(".conversationItemIsTyping").attr("data-istyping", "1");
            }

            // show typing event in current conversation messages
            if (uuid == _self.pwrClientConversationUUID) {
                var $messageHtml = "<div class='message messageClient typingEventMessage table'>";
                $messageHtml += "<div class='messageAuthor td'>";
                $messageHtml += "<div class='messageAuthorAvatarWrapper'>";
                $messageHtml+= "<div class='messageAuthorInitials'>"+_self.sanitize(_self.clientInitials)+"</div>";
                $messageHtml += "</div>";
                $messageHtml += "</div>";
                $messageHtml += "<div class='messageContent td'>";
                $messageHtml += "<div class='messageContentInner'>";
                $messageHtml += "<div class='messageAuthorName'>" + _self.sanitize(("undefined" != typeof clientName && "string" == typeof clientName && _self.isBase64(clientName)) ? _self.safeDecodeURIComponent(atob(clientName)) : "Client") + "</div>";
                $messageHtml += "<div class='messageContentText'> <div class='dotTyping dotTyping1'></div> <div class='dotTyping dotTyping2'></div> <div class='dotTyping dotTyping3'></div> </div>";
                $messageHtml += "</div>";
                $messageHtml += "</div>";
                $messageHtml += "</div>";

                if ($conversationWrapper.find(".typingEventMessage").length == 0) {
                    $conversationWrapper.append($messageHtml);
                    if ("undefined" != typeof _self.waiters.scrollConversationToBottomTimeout) {
                        clearTimeout(_self.waiters.scrollConversationToBottomTimeout);
                    }
                    _self.waiters.scrollConversationToBottomTimeout = setTimeout(function () {
                        _self.scrollConversationToBottom();
                    }, 100);
                }
            }

            // clear typing event
            if ("undefined" != typeof _self.waiters.removeTypingEventTimeout) {
                clearTimeout(_self.waiters.removeTypingEventTimeout);
            }
            _self.waiters.removeTypingEventTimeout = setTimeout(function () {
                if ($conversationWrapper.length > 0) {
                    $conversationWrapper.find(".typingEventMessage").remove();
                }
                $conversationItem.find(".conversationItemIsTyping").attr("data-istyping", "0");
            }, 2000);
        }
    };

    _self.renderSeenEvent = function(uuid, callback){
        if ("undefined" != typeof uuid && uuid == _self.pwrClientConversationUUID) {
            $body.find(".messageSeenStatus").attr("data-seen", '1');
        }
        if ("function" == typeof callback) {
            callback();
        }
    };

    _self.scrollConversationToBottom = function(callback){
        var $conversationWrapper = $body.find(".powerChatConversationMessagesInner");
        $conversationWrapper.stop().animate({
            scrollTop: $conversationWrapper[0].scrollHeight - $conversationWrapper[0].clientHeight
        },1);
        if ("function" == typeof callback) {
            callback();
        }
    };

    _self.getStoredConversations = function(callback){
        $.ajax({
            url: _self.apiUrl + "/",
            data: {
                method: "getstoredconversations",
                operator: _self.operator,
                filters: btoa(encodeURIComponent(JSON.stringify(_self.filters.conversations)))
            },
            success: function (resp) {
                if ("undefined" != typeof resp) {
                    if ("string" == typeof resp && _self.isJson(resp)) {
                        resp = JSON.parse(resp);
                    }
                    if ("function" == typeof callback) {
                        callback(resp);
                    }
                }
            },
            error: function (a, b, c) {

            },
            complete: function () {
                if ("undefined" != typeof _self.waiters.checkClientConversationsimeout) {
                    clearTimeout(_self.waiters.checkClientConversationsimeout);
                }
                _self.waiters.checkClientConversationsimeout = setTimeout(function(){
                    _self.getStoredConversations(function(resp2){
                        if ("undefined" != typeof resp2["data"] && JSON.stringify(_self.lastConversationsData) !== JSON.stringify(resp2["data"])) {
                            if ("undefined" != typeof resp2["data"]["items"] && !isNaN(resp2["data"]["items"])) {
                                _self.totalConversations = parseInt(resp2["data"]["items"],10);
                            }
                            if ("undefined" != typeof resp2["data"]["showing"] && !isNaN(resp2["data"]["showing"])) {
                                _self.renderedConversations = $body.find(".powerChatConversationsList .conversationItem").length;
                            }
                            if ("undefined" != typeof resp2["data"]["pages"] && !isNaN(resp2["data"]["pages"])) {
                                _self.conversationsTotalPages = parseInt(resp2["data"]["pages"],10);
                            }
                            _self.renderOperatorClientsConversations(resp2["data"]["items"], "ajax");
                        }
                        _self.getOperatorClientUUIDS();
                    });
                },_self.conversationsUpdateInterval);
            }
        });
    };

    _self.getOperatorClientUUIDS = function(){
        // console.log("getting uuids");
        var data = [],
            messageObj = {
                "comm": "getConversationsUUIDS",
                "data": {
                    "operator": _self.operator,
                    "attr": "operator",
                    "uuid": _self.pwrChatOperatortId,
                    "windowuuid": _self.windowUUID,
                    "message": ""
                }
            };

        if (true == _self.WebSocketServerIsOnline()) {
            _self.WebSocketServer.send(btoa(encodeURIComponent(JSON.stringify(messageObj))));
        } else {
            _self.initWebsocketServer(function(){
                _self.WebSocketServer.send(btoa(encodeURIComponent(JSON.stringify(messageObj))));
            });
        }
    };

    _self.renderOperatorClientsConversations = function(data, source){
        if ("undefined" != typeof data && Array.isArray(data) && data.length > 0 && Array.isArray(_self.lastConversationsData) && _self.lastConversationsData != data) {
            var $conversationsList = $body.find(".powerChatConversationsList");
            data.forEach(function (conversation, i) {
                var uuid = conversation["uuid"],
                    $item = $body.find(".powerChatConversationsList .conversationItem[data-conversationuuid='" + uuid + "']"),
                    updatedTime = ("undefined" != typeof conversation["updated"] && !isNaN(conversation["updated"])) ? _self.sanitize(parseFloat(conversation["updated"])) : "",
                    $itemStatus = $item.find(".onlineStatus"),
                    isActiveConversation = (conversation["uuid"] == _self.pwrClientConversationUUID) ? true : false;
                if ($item.length > 0) { // conversation exists
                    if (source == "ws") { // websocket packet from online converdation, just update
                        $item.attr("data-onlinecheck", new Date().getTime());

                        if ($item.attr("data-online") != "1") {
                            $item.attr("data-online", "1");
                        }
                        if ($itemStatus.attr("data-isonline") != "1") {
                            $itemStatus.attr("data-isonline", "1");
                        }
                        if ($itemStatus.text() != "online") {
                            $itemStatus.text("online");
                        }
                        _self.conversationsUpdatesLastTime[uuid] = new Date().getTime();
                        if (true == isActiveConversation) {
                            _self.clientIsOnline = 1;
                        }
                    } else if (source == "ajax") { // this is from the ajax pooling
                        if ($item.attr("data-updatedtime") != _self.sanitize(updatedTime)) {
                            $item.attr("data-updatedtime", _self.sanitize(updatedTime));
                        }

                        // if it was online, mark it as offline if the last time it was updated by websocket was more than 2 seconds ago
                        if ("undefined" != typeof $item.attr("data-onlinecheck") && !isNaN($item.attr("data-onlinecheck")) && parseFloat(new Date().getTime()) - parseFloat($item.attr("data-onlinecheck")) > 2000) {
                            if ($itemStatus.attr("data-isonline") == "1") {
                                $itemStatus.attr("data-isonline", "0");
                            }
                            if ($itemStatus.text() == "online") {
                                $itemStatus.text("offline");
                            }
                            if (true == isActiveConversation) {
                                _self.clientIsOnline = 0;
                            }
                        }
                    }
                }

                if (source == "ajax") { // the source is ajax pooling
                    var clientName = ("undefined" != typeof conversation["clientname"] && "string" == typeof conversation["clientname"] && !!conversation["clientname"]) ?  _self.sanitize(conversation["clientname"]) : "Client " + _self.sanitize(conversation["uuid"]),
                        clientNameInitials = _self.sanitize(_self.getInitials(clientName)),
                        clientEmail = ("undefined" != typeof conversation["clientemail"] && "string" == typeof conversation["clientemail"] && !!conversation["clientemail"] && _self.isBase64(conversation["clientemail"])) ? _self.sanitize(_self.safeDecodeURIComponent(atob(conversation["clientemail"]))) : "";


                    if (_self.isBase64(_self.sanitize(clientName))) {
                        clientName = _self.sanitize(_self.safeDecodeURIComponent(atob(clientName)));
                    }

                    clientNameInitials = _self.sanitize(_self.getInitials(clientName));


                    if ($conversationsList.find(".conversationItem[data-conversationuuid='"+_self.sanitize(conversation["uuid"])+"']").length == 0 && conversation["lastmessage"] !== null) { // the conversation item doesn't exist
                        var $conversationsListHtml = "<div class='conversationItem' ";
                        $conversationsListHtml += " data-updatedtime='" + _self.sanitize(updatedTime) + "' ";
                        $conversationsListHtml += " data-conversationuuid='" + _self.sanitize(conversation["uuid"]) + "' ";
                        $conversationsListHtml += " data-clientname='" + _self.sanitize(btoa(encodeURIComponent(clientName))) + "' ";
                        $conversationsListHtml += " data-clientemail='" + _self.sanitize(btoa(encodeURIComponent(clientEmail))) + "' ";
                        $conversationsListHtml += " data-online='0' ";

                        if ("undefined" != typeof conversation["clientid"]) {
                            $conversationsListHtml += " data-clientid='"+_self.sanitize(conversation["clientid"])+"' ";
                        }

                        $conversationsListHtml += " data-devicedata='"+_self.sanitize(btoa(encodeURIComponent(JSON.stringify({
                            "deviceagent": btoa(encodeURIComponent(_self.sanitize(conversation["deviceagent"]))),
                            "deviceclientname": btoa(encodeURIComponent(_self.sanitize(conversation["deviceclientname"]))),
                            "deviceclientversion": btoa(encodeURIComponent(_self.sanitize(conversation["deviceclientversion"]))),
                            "deviceclientengine": btoa(encodeURIComponent(_self.sanitize(conversation["deviceclientengine"]))),
                            "deviceosname": btoa(encodeURIComponent(_self.sanitize(conversation["deviceosname"]))),
                            "deviceosversion": btoa(encodeURIComponent(_self.sanitize(conversation["deviceosversion"]))),
                            "deviceosplatform": btoa(encodeURIComponent(_self.sanitize(conversation["deviceosplatform"]))),
                            "devicename": btoa(encodeURIComponent(_self.sanitize(conversation["devicename"]))),
                            "devicebrandname": btoa(encodeURIComponent(_self.sanitize(conversation["devicebrandname"]))),
                            "devicemodel": btoa(encodeURIComponent(_self.sanitize(conversation["devicemodel"]))),
                            "deviceisdesktop": btoa(encodeURIComponent(_self.sanitize(conversation["deviceisdesktop"]))),
                            "deviceismobile": btoa(encodeURIComponent(_self.sanitize(conversation["deviceismobile"]))),
                            "deviceistablet": btoa(encodeURIComponent(_self.sanitize(conversation["deviceistablet"]))),
                            "deviceisios": btoa(encodeURIComponent(_self.sanitize(conversation["deviceisios"]))),
                            "deviceisandroid": btoa(encodeURIComponent(_self.sanitize(conversation["deviceisandroid"]))),
                            "deviceid": btoa(encodeURIComponent(_self.sanitize(conversation["deviceid"]))),
                        }))))+"' ";

                        $conversationsListHtml += " data-color='"+_self.sanitize(conversation["color"])+"' ";
                        $conversationsListHtml += " data-operatoranswered='"+_self.sanitize(conversation["operatoranswered"])+"' ";
                        $conversationsListHtml += " data-waitingforclientresponse='"+_self.sanitize(conversation["waitingforclientresponse"])+"' ";
                        $conversationsListHtml += " >";
                        $conversationsListHtml += "<div class='conversationItemAvatar'>";
                        $conversationsListHtml += "<div data-newmessages='" + _self.sanitize(conversation["newmessages"]) + "' class='newMessagesCounter'>" + _self.sanitize(conversation["newmessages"]) + "</div>";
                        $conversationsListHtml += "<div class='conversationItemAvatarInitials' style='background-color: "+(("undefined" != typeof conversation["color"]) ? _self.sanitize(conversation["color"]) : _self.sanitize(_self.getRandomColor(40)))+" !important; color: #fff !important;' >" + _self.sanitize(clientNameInitials) + "</div>";
                        $conversationsListHtml += "</div>";
                        $conversationsListHtml += "<div class='conversationItemClientName'>";
                        $conversationsListHtml += "<div class='conversationItemClientNameInner'>";

                        $conversationsListHtml += _self.sanitize(clientName);

                        $conversationsListHtml += "</div>";

                        $conversationsListHtml += "<span class='onlineStatus' data-isonline='0'>offline</span>";

                        $conversationsListHtml += "<div class='conversationItemIsTyping' data-istyping='0'>writting..</div>";

                        if ("undefined" != typeof conversation["lastmessage"]
                            && conversation["lastmessage"] !== null
                            && "undefined" != typeof conversation["lastmessage"]["author"]
                            && "undefined" != typeof conversation["lastmessage"]["created"]
                            && "undefined" != typeof conversation["lastmessage"]["files"]
                            && "undefined" != typeof conversation["lastmessage"]["message"]
                            && "undefined" != typeof conversation["lastmessage"]["seen"]
                        ) {
                            $conversationsListHtml += "<div class='lastMessageWrapper' data-haslastmessage='1'>";
                            if ("client" != conversation["lastmessage"]["author"].toString().toLowerCase().trim()) {
                                if (_self.sanitize(conversation["lastmessage"]["author"]) == _self.sanitize(_self.operator)) {
                                    $conversationsListHtml += _self.sanitize("You: ");
                                } else {
                                    $conversationsListHtml += _self.sanitize(conversation["lastmessage"]["author"])+": ";
                                }

                            }
                            if (_self.sanitize(conversation["lastmessage"]["message"]).toString().trim().length > 0) {
                                $conversationsListHtml += _self.sanitize(_self.safeDecodeURIComponent(conversation["lastmessage"]["message"]));
                            } else if (_self.sanitize(conversation["lastmessage"]["files"]).toString().trim().length > 0) {
                                if ("client" != conversation["lastmessage"]["author"].toString().toLowerCase().trim()) {
                                    if (_self.sanitize(conversation["lastmessage"]["author"]) == _self.sanitize(_self.operator)) {
                                        $conversationsListHtml += "You. sent media files";
                                    } else {
                                        $conversationsListHtml += _self.sanitize(conversation["lastmessage"]["author"])+" sent media files";
                                    }
                                } else {
                                    $conversationsListHtml += "sent media files";
                                }
                            }
                            $conversationsListHtml += "</div>";
                            $conversationsListHtml += "<div class='lastMessageDate'>" + (("Today" == _self.timeAgoEN(conversation["lastmessage"]["created"])) ? "Today, "+(_self.sanitize(new Date(parseFloat(conversation["lastmessage"]["created"])).toLocaleTimeString( _self.timeZone).split(":")[0])+":"+_self.sanitize(new Date(parseFloat(conversation["lastmessage"]["created"])).toLocaleTimeString( _self.timeZone).split(":")[1])) : _self.sanitize(new Date(parseFloat(conversation["lastmessage"]["created"])).toLocaleDateString( _self.timeZone) +", "+(_self.sanitize(new Date(parseFloat(conversation["lastmessage"]["created"])).toLocaleTimeString( _self.timeZone).split(":")[0])+":"+_self.sanitize(new Date(parseFloat(conversation["lastmessage"]["created"])).toLocaleTimeString( _self.timeZone).split(":")[1])))) + "</div>";
                        } else {
                            $conversationsListHtml += "<div class='lastMessageWrapper' data-haslastmessage='0'></div>";
                            $conversationsListHtml += "<div class='lastMessageDate'></div>";
                        }

                        $conversationsListHtml += "</div>";
                        $conversationsListHtml += "</div>";
                        $conversationsList.prepend($conversationsListHtml);
                    } else { // the conversation item exists
                        var $conversationItem = $conversationsList.find(".conversationItem[data-conversationuuid='"+_self.sanitize(conversation["uuid"])+"']"),
                            $lastMessageDate = $conversationItem.find(".lastMessageDate"),
                            $lastMessageWrapper = $conversationItem.find(".lastMessageWrapper"),
                            $onlineStatus = $conversationItem.find(".onlineStatus"),
                            $newMessagesCounter = $conversationItem.find(".newMessagesCounter");

                        if ("undefined" != typeof conversation["operatoranswered"] && !isNaN(conversation["operatoranswered"]) && $conversationItem.attr("data-operatoranswered") != conversation["operatoranswered"]) {
                            $conversationItem.attr("data-operatoranswered", _self.sanitize(conversation["operatoranswered"]));
                        }
                        if ("undefined" != typeof conversation["waitingforclientresponse"] && !isNaN(conversation["waitingforclientresponse"]) && $conversationItem.attr("data-waitingforclientresponse") != conversation["waitingforclientresponse"]) {
                            $conversationItem.attr("data-waitingforclientresponse", _self.sanitize(conversation["waitingforclientresponse"]));
                        }
                    }
                }

                if (true == isActiveConversation) {
                    if ("undefined" != typeof conversation["clientname"] && "string" == typeof conversation["clientname"] && !!conversation["clientname"] && _self.isBase64(conversation["clientname"])) {
                        if (_self.clientName != _self.sanitize(_self.safeDecodeURIComponent(atob(conversation["clientname"])))){
                            _self.clientName = _self.sanitize(_self.safeDecodeURIComponent(atob(conversation["clientname"])));
                        }

                    }
                    if ("undefined" != typeof conversation["clientemail"] && "string" == typeof conversation["clientemail"] && !!conversation["clientemail"] && _self.isBase64(conversation["clientemail"])) {
                        if (_self.clientEmail != _self.sanitize(_self.safeDecodeURIComponent(atob(conversation["clientemail"])))) {
                            _self.clientEmail = _self.sanitize(_self.safeDecodeURIComponent(atob(conversation["clientemail"])));
                        }
                    }
                    if ("undefined" != typeof conversation["operatoranswered"] && !isNaN(conversation["operatoranswered"])) {
                        if (parseInt(_self.operatorAnswered,10) != parseInt(_self.sanitize(conversation["operatoranswered"]),10)) {
                            _self.operatorAnswered = parseInt(_self.sanitize(conversation["operatoranswered"]),10);
                        }
                    }
                    if ("undefined" != typeof conversation["waitingforclientresponse"] && !isNaN(conversation["waitingforclientresponse"])) {
                        if (parseInt(_self.waitingForClientResponse,10) != parseInt(_self.sanitize(conversation["waitingforclientresponse"]),10)) {
                            _self.waitingForClientResponse = parseInt(_self.sanitize(conversation["waitingforclientresponse"]),10);
                        }
                    }
                    if ("undefined" != typeof conversation["color"] && "string" == typeof conversation["color"] && conversation["color"].toString().trim().length == 7 && conversation["color"].indexOf("#") > -1) {
                        if (_self.clientAvatarColor != conversation["color"]) {
                            _self.clientAvatarColor = conversation["color"];
                        }
                    }
                }
            });

            if (source == "ajax") { // move the most recent conversation on top, sort the rest by the date in descending order
                var $list = $body.find('.powerChatConversationsList'),
                    $items = $list.children('.conversationItem'),
                    isSorted = true,
                    itemsWithTime = $items.map(function () {
                        return {
                            el: $(this),
                            updatedTime: parseFloat($(this).attr('data-updatedtime') || 0)
                        };
                    }).get();

                for (var i = 0; i < itemsWithTime.length - 1; i++) {
                    if (itemsWithTime[i].updatedTime < itemsWithTime[i + 1].updatedTime) {
                        isSorted = false;
                        break;
                    }
                }

                if (!isSorted) {
                    itemsWithTime.sort(function (a, b) {
                        return b.updatedTime - a.updatedTime;
                    });
                    var frag = document.createDocumentFragment();
                    itemsWithTime.forEach(function (item) {
                        frag.appendChild(item.el[0]);
                    });
                    $list[0].appendChild(frag);
                }

                _self.lastConversationsData = JSON.parse(JSON.stringify(data));
            }
        }
    };

    _self.getConversationMessages = function(uuid, callback){
        if ("undefined" != typeof uuid) {
            $.ajax({
                url: _self.apiUrl + "/",
                data: {
                    method: "getconversationmessages",
                    data: btoa(encodeURIComponent(uuid)),
                    operator: btoa(encodeURIComponent(_self.operator))
                },
                success: function (resp) {
                    if ("undefined" != typeof resp) {
                        if ("string" == typeof resp && _self.isJson(resp)) {
                            resp = JSON.parse(resp);
                        }
                        if ("function" == typeof callback) {
                            callback(resp);
                        }
                    }
                },
                error: function (a, b, c) {

                },
                complete: function () {

                }
            });
        }
    };

    _self.renderConversationMessages = function(data, callback) {
        console.log("will render conversation messages", data);
        $body.find(".powerChatConversationMessagesInner").empty();
        if ("undefined" != typeof data && "undefined" != typeof data["data"] && Array.isArray(data["data"]) && data["data"].length > 0) {
            data["data"].forEach(function(messageObj, i){
                if ("undefined" != typeof messageObj["author"]
                && "undefined" != typeof messageObj["clientname"]
                && "undefined" != typeof messageObj["message"]
                && "undefined" != typeof messageObj["files"]
                && "undefined" != typeof messageObj["seen"]
                && "undefined" != typeof messageObj["emailed"]
                ) {
                    // console.log("rendering message", messageObj);
                    var mClassType = ("Client" == messageObj["author"]) ? "Client" : "Operator",
                        time = new Date(parseFloat(messageObj["created"])).toLocaleString( _self.timeZone);

                    if (messageObj["author"] == "Client" && "string" == typeof messageObj["clientname"] && _self.isBase64(messageObj["clientname"])) {
                        messageObj["author"] = _self.sanitize(messageObj["clientname"]);
                    }
                    _self.renderMessage(messageObj["uuid"], messageObj["author"], messageObj["message"], messageObj["author"], mClassType, time, ("undefined" != typeof messageObj["files"]) ? messageObj["files"] : "", (("undefined" != typeof messageObj["seen"]) ? messageObj["seen"] : 0), (("undefined" != typeof messageObj["emailed"]) ? messageObj["emailed"] : 0));
                } else {
                    console.log("could not render message", messageObj);
                }
            });

            if ("undefined" != typeof _self.waiters.scrollConversationToBottomTimeout) {
                clearTimeout(_self.waiters.scrollConversationToBottomTimeout);
            }
            _self.waiters.scrollConversationToBottomTimeout = setTimeout(function(){
                _self.scrollConversationToBottom();
            },100);
        }
        if ("function" == typeof callback){
            callback();
        }
        _self.markAsSeen();
    };

    _self.renderConversationHeader = function(){
        var $wrapper = $body.find(".powerChatConversationMessagesContainer"),
            $headerHtml = "<div class='powerChatConversationHeader table'>";
                $headerHtml += "<div class='powerChatConversationContainer tr'>";
                    $headerHtml += "<div class='powerChatConversationAvatarWrapper td'>";
                        $headerHtml += "<div class='powerChatConversationAvatar' style='background-color: "+_self.sanitize(_self.clientAvatarColor)+" !important;'>"+_self.sanitize(_self.clientInitials)+"</div>";
                    $headerHtml += "</div>";
                    $headerHtml += "<div class='powerChatConversationClientNameWrapper td'><span class='powerChatConversationClientName'>";

                    $headerHtml += _self.sanitize(_self.clientName);

                    if (null !== _self.deviceData && "string" == typeof _self.deviceData && _self.deviceData.toString().trim().length > 0 && _self.isBase64(_self.deviceData)) {
                        var deviceData = JSON.parse(decodeURIComponent(atob(_self.deviceData)));

                        $headerHtml += "<div class='clientDeviceDataWrapper'>"
                            $headerHtml += "<div class='customerDeviceBrowserName' data-clientbrowser='"+_self.sanitize(decodeURIComponent(atob(deviceData["deviceclientname"])))+"'><i class='icon fab' data-browsericon='"+_self.sanitize(decodeURIComponent(atob(deviceData["deviceclientname"])))+"'></i><span class='desc'>"+_self.sanitize(decodeURIComponent(atob(deviceData["deviceclientname"])))+" v"+_self.sanitize(decodeURIComponent(atob(deviceData["deviceclientversion"])))+"</span></div>";
                            $headerHtml += "<div class='customerDeviceOSName' data-clientos='"+_self.sanitize(decodeURIComponent(atob(deviceData["deviceosname"])))+"'><i class='icon fab' data-osicon='"+_self.sanitize(decodeURIComponent(atob(deviceData["deviceosname"])))+"'></i><span class='desc'>"+([_self.sanitize(decodeURIComponent(atob(deviceData["deviceosname"]))), _self.sanitize(decodeURIComponent(atob(deviceData["deviceosversion"])))].join(" "))+"</span></div>";
                            $headerHtml += "<div class='customerDeviceDeviceName' data-clientdevice='"+_self.sanitize(decodeURIComponent(atob(deviceData["devicename"])))+"'><i class='icon fas' data-deviceicon='"+_self.sanitize(decodeURIComponent(atob(deviceData["devicename"])))+"'></i><span class='desc'>"+([_self.sanitize(decodeURIComponent(atob(deviceData["devicename"]))),_self.sanitize(decodeURIComponent(atob(deviceData["devicebrandname"]))),_self.sanitize(decodeURIComponent(atob(deviceData["devicemodel"])))].join(" "))+"</span></div>";
                        $headerHtml += "</div>";

                    }
                    $headerHtml += "</span></div>";
                $headerHtml += "</div>";
            $headerHtml += "</div>";

        if ($wrapper.find(".powerChatConversationHeader")) {
            $wrapper.find(".powerChatConversationHeader").remove();
        }
        $wrapper.prepend($headerHtml);
    };

    _self.assignUUID = function(uuid, callback){
        var messageObj = {
            "comm": "assignUUID",
            "data": {
                "operator": _self.operator,
                "uuid": _self.pwrChatOperatortId,
                "windowuuid": _self.windowUUID,
                "message": uuid
            }
        };
        if (true == _self.WebSocketServerIsOnline()) {
            _self.WebSocketServer.send(btoa(encodeURIComponent(JSON.stringify(messageObj))));
            if ("function" == typeof callback){
                callback();
            }
        } else {
            _self.initWebsocketServer(function(){
                _self.WebSocketServer.send(btoa(encodeURIComponent(JSON.stringify(messageObj))));
                if ("function" == typeof callback){
                    callback();
                }
            });
        }
    };

    _self.filesPreload = function(filesObject, $imgPreviewWrapper, callback) {
        if(filesObject != undefined) {
            // console.log("filesObject", filesObject);

            for (var i = 0; i < filesObject.length; i++) {
                var nameExists = false;
                for (let [fileKey, fileObject] of _self.filesObjectToUpload.entries()) {
                    if (filesObject[i].name == fileObject.name) {
                        nameExists = true;
                    }
                }
                if (false == nameExists) {
                    _self.filesObjectToUpload.append("file[]", filesObject[i]);
                }
            }

            _self.renderPreloadedFiles($imgPreviewWrapper, callback);
        }
    };

    _self.ajaxFileUpload = function($imgPreviewWrapper, callback) {
        $.ajax({
            type: 'POST',
            beforeSend: function () {

            },
            headers: {
                "uploadfiles": true,
                "uuid": _self.pwrClientConversationUUID
            },
            url: _self.apiUrl + "/",
            contentType: false,
            processData: false,
            data: _self.filesObjectToUpload,
            success: function (response) {
                if ("undefined" != typeof response) {
                    if ("string" == typeof response && _self.isJson(response)) {
                        response = JSON.parse(response);
                    }
                    // console.log(response);

                    if ("undefined" != typeof response["data"]) {
                        if ("undefined" != typeof response["data"]["files"]) {
                            if (Array.isArray(response["data"]["files"]) && response["data"]["files"].length > 0) {
                                response["data"]["files"].forEach(function (file, i) {
                                    /*
                                    errors: []
                                    originalname: "34-349073_saints-row-gat-out-of-hell.jpg"
                                    storedname: "6034f793aab6a.jpg"
                                    success: true
                                     */
                                    if (
                                        "undefined" != typeof file["errors"]
                                        && "undefined" != typeof file["originalname"]
                                        && "undefined" != typeof file["storedname"]
                                        && "undefined" != typeof file["success"]
                                    ) {
                                        if ($body.find($imgPreviewWrapper).find(".fileItem[data-filename='" + file["originalname"] + "']").length) {
                                            $body.find($imgPreviewWrapper).find(".fileItem[data-filename='" + file["originalname"] + "']").each(function () {
                                                var $fileItem = $(this);

                                                if (true == file["success"] && 0 == file["errors"].length) {
                                                    var reader = new FileReader();
                                                    reader.onload = function (e) {
                                                        $fileItem.find(".preview").html("<img src='" + _self.sanitize(e.target.result) + "' />");
                                                    };
                                                    reader.readAsDataURL(fileObject[i]);

                                                    $fileItem.removeClass("uploadError").addClass("uploadSuccess");
                                                    // $fileItem.find(".status").text("Image uploaded");
                                                    $fileItem.attr("data-storedname", _self.sanitize(file["storedname"]));
                                                    $fileItem.find(".deleteFileBtn").addClass("show").attr("data-storedname", _self.sanitize(file["storedname"]));
                                                } else {
                                                    $fileItem.removeClass("uploadSuccess").addClass("uploadError");
                                                    $fileItem.find(".status").text(_self.sanitize(file["errors"].join("; ")));
                                                    $fileItem.find(".preview").html("<i class='fas fa-exclamation'></i>");
                                                    $fileItem.find(".closeFilebtn").addClass("show");
                                                }
                                            });
                                        }

                                    }
                                });
                            }
                        }
                    }
                }
                if ("function" == typeof callback) {
                    callback(response);
                }
            },
            error: function (a, b, c) {
                // console.log(a, b, c);
                _self.msg("Cant't upload files");
            },
            complete: function () {
                // console.log("Images ajax upload complete");
            }
        });
    };

    _self.renderPreloadedFiles = function($imgPreviewWrapper, callback){
        var $filesHtml = "",
            renderedPreview = false,
            i = 0;
        if ($body.find(".uploadedFilesInner .fileLargePreviewWrapper").length > 0) {
            $body.find(".uploadedFilesInner .fileLargePreviewWrapper").remove();
        }

        for (let [fileKey, fileObject] of _self.filesObjectToUpload.entries()) {
            var error = false,
                mixedFile = fileObject.type.split("/"),
                fileType = mixedFile[0],
                originalFileName = ("undefined" != typeof fileObject.name && null !== fileObject.name && "string" == typeof fileObject.name && fileObject.name.toString().trim().length > 0) ? fileObject.name.toString().trim() : null,
                fileNameWithoutExtension = ("undefined" != typeof originalFileName && null !== originalFileName && "string" == typeof originalFileName && originalFileName.toString().trim().length > 0 && originalFileName.indexOf(".") && originalFileName.split(".").length > 1) ? originalFileName.split('.').slice(0, -1).join('.') : null,
                fileExtension = ("undefined" != typeof originalFileName && null !== originalFileName && "string" == typeof originalFileName && originalFileName.indexOf(".") > -1 && originalFileName.split(".").length > 1) ? originalFileName.split(".")[originalFileName.split(".").length-1] : null,
                encodedFileName = _self.MD5(btoa(encodeURIComponent(originalFileName))),
                allowedExtensions = ["mp4", "png", "jpg", "jpeg", "m4v"];

            if (null == originalFileName || null == fileNameWithoutExtension) {
                error = true;
            }

            // console.log("File type", fileObject.type);

            if (null == fileExtension) {
                error = true;
            }

            if (!error && allowedExtensions.indexOf(fileExtension.toString().toLowerCase().replace(/[^a-z0-9]/gi, "").trim()) == -1) {
                error = true;
            }


            if (!error) {
                $filesHtml += "<div class='fileItem"+((!error) ? "" : " uploadError")+((!renderedPreview) ? " active" : "")+"' data-filename='"+_self.sanitize(btoa(encodeURIComponent(fileObject.name)))+"'>";
                $filesHtml += "<div class='preview'>";

                if ("image" == fileType) {
                    $filesHtml += "<img src='"+URL.createObjectURL(fileObject)+"' />";
                } else if ("video" == fileType) {
                    $filesHtml += "<video src='"+URL.createObjectURL(fileObject)+"'></video>"
                }

                $filesHtml += "</div>";
                $filesHtml += "<div class='details'>";
                $filesHtml += "<div class='fileName'>"+_self.sanitize(originalFileName)+"</div>";
                $filesHtml += "<div class='progressBar'></div>";
                $filesHtml += "</div>";
                $filesHtml += "<div class='actions'>";
                $filesHtml += "<a href='javascript:void(0);' class='deleteFileBtn' data-storedname='"+_self.sanitize(btoa(encodeURIComponent(originalFileName)))+"'><i class='fas fa-plus'></i></a>";
                $filesHtml += "</div>";
                $filesHtml += "</div>";
            } else {
                $filesHtml += "<div class='preview'><i class='fas fa-ban'></i></div>";
            }

            if (!error && !renderedPreview) {
                var $largePreviewHtml = "";
                if ("image" == fileType) {
                    $largePreviewHtml += "<div class='fileLargePreviewWrapper easyzoom'>";
                        $largePreviewHtml += "<a href='"+URL.createObjectURL(fileObject)+"'>";
                            $largePreviewHtml += "<img src='"+URL.createObjectURL(fileObject)+"' />";
                        $largePreviewHtml += "</a>";
                    $largePreviewHtml += "</div>";
                } else if ("video" == fileType) {
                    $largePreviewHtml += "<div class='fileLargePreviewWrapper'>";
                    $largePreviewHtml += "<video controls src='"+URL.createObjectURL(fileObject)+"'></video>";
                    $largePreviewHtml += "</div>";
                }

                $body.find(".uploadedFilesInner").prepend($largePreviewHtml);
                renderedPreview = true;
            }
            i++;
        }

        if (
            "undefined" != typeof $imgPreviewWrapper
            && $body.find($imgPreviewWrapper).length > 0
        ) {
            $body.find($imgPreviewWrapper).html($filesHtml);
        }

        if ("undefined" != typeof _self.waiters.setFirstActivePreview) {
            clearTimeout(_self.waiters.setFirstActivePreview);
        }
        _self.waiters.setFirstActivePreview = setTimeout(function(){
            $body.find(".uploadedFilesWrapper .fileItem").first().click();
        },50);
        if ("function" == typeof callback) {
            callback();
        }
    };

    _self.removePreloadedFile = function(storedname, $imgPreviewWrapper, callback){
        if ("undefined" != typeof storedname && "string" == typeof storedname && _self.isBase64(storedname)) {
            storedname = _self.safeDecodeURIComponent(atob(storedname));
            // console.log(storedname);
            var FormDataTemp = new FormData();
            for (let [fileKey, fileObject] of _self.filesObjectToUpload.entries()) {
                if (fileObject.name != storedname) {
                    FormDataTemp.append("file[]", fileObject);
                } else {
                    // console.log("Found file "+storedname);
                }
            }
            _self.filesObjectToUpload.delete("file[]");
            for (let [fileKey, fileObject] of FormDataTemp.entries()) {
                _self.filesObjectToUpload.append("file[]", fileObject);
            }
            _self.renderPreloadedFiles($imgPreviewWrapper, callback);
        }
    };

    _self.removeAllPreloadedFiles = function($imgPreviewWrapper, callback){
        _self.filesObjectToUpload.delete("file[]");
        var $el = $body.find('#selectfile');
        $el.wrap('<form>').closest('form').get(0).reset();
        $el.unwrap();
        _self.renderPreloadedFiles($imgPreviewWrapper, callback);
    };

    _self.markAsSeen = function(callback){
        if (true == _self.focused) {
            $.ajax({
                url: _self.apiUrl + "/",
                data: {
                    method: "markasseen",
                    uuid: btoa(encodeURIComponent(_self.pwrClientConversationUUID)),
                    operator: btoa(encodeURIComponent(_self.operator))
                },
                success: function (resp) {
                    if ("undefined" != typeof resp) {
                        if ("string" == typeof resp && _self.isJson(resp)) {
                            resp = JSON.parse(resp);
                        }

                        var messageObj = {
                            "comm": "seenEvent",
                            "data": {
                                "attr": "operator",
                                "operator": _self.operator,
                                "uuid": _self.pwrClientConversationUUID,
                                "windowuuid": _self.windowUUID
                            }
                        };
                        if (true == _self.WebSocketServerIsOnline()) {
                            _self.WebSocketServer.send(btoa(encodeURIComponent(JSON.stringify(messageObj))));
                            _self.renderUnreadMessages({"data": {"status": true, "newmessages": 0, "uuid": btoa(encodeURIComponent(_self.pwrClientConversationUUID))}});
                            if ("function" == typeof callback) {
                                callback(resp);
                            }
                        } else {
                            _self.initWebsocketServer(function () {
                                _self.WebSocketServer.send(btoa(encodeURIComponent(JSON.stringify(messageObj))));
                                _self.renderUnreadMessages({"data": {"status": true, "newmessages": 0, "uuid": btoa(encodeURIComponent(_self.pwrClientConversationUUID))}});
                                if ("function" == typeof callback) {
                                    callback(resp);
                                }
                            });
                        }
                    }
                },
                error: function (a, b, c) {

                },
                complete: function () {

                }
            });
        }
    };

    _self.checkIfEmailed = function(uuid, callback){
        $.ajax({
            url: _self.apiUrl + "/",
            data: {
                method: "checkifemailed",
                uuid: btoa(encodeURIComponent(uuid)),
            },
            success: function (resp) {
                if ("undefined" != typeof resp) {
                    if ("string" == typeof resp && _self.isJson(resp)) {
                        resp = JSON.parse(resp);
                    }
                    if ("function" == typeof callback) {
                        callback(resp);
                    }
                }
            },
            error: function (a, b, c) {

            },
            complete: function () {

            }
        });
    };

    _self.handleEvents = function(){
        // console.log("Handling events");
        window.onfocus = function() {
            _self.focused = true;
            if (null !== _self.operator && null !== _self.pwrClientConversationUUID) {
                if ("undefined" != typeof _self.waiters.markAsSeenTimeout) {
                    clearTimeout(_self.waiters.markAsSeenTimeout);
                }
                _self.waiters.markAsSeenTimeout = setTimeout(function(){
                    _self.markAsSeen();
                },100);
            }
        };
        window.onblur = function() {
            _self.focused = false;
        };
        // window.addEventListener('storage', function (e) {
        //     if (e.key == "openpages") {
        //         localStorage.page_available = Date.now();
        //     }
        //     if(e.key == "page_available") {
        //         if (confirm("Aveti deja o conversatie deschisa in alta pagina, doriti sa o deschideti aici?")) {
        //             _self.closeOtherWindows();
        //             console.log("Closing other windows");
        //         } else {
        //             _self.closeChatByOtherWindow();
        //             console.log("Closing this window");
        //         }
        //     }
        // }, false);

        $body.on("keydown", ".powerChatConversationActionsNewMessageWrapper textarea#newMessageInput", function(e){
            var $inp = $(this),
                $parent = $body.find(".powerChatConversationActionsNewMessageWrapper"),
                inpVal = $inp.val().toString().trim(),
                emptyText = inpVal.replace(/(?:(?:\r\n|\r|\n)\s*){2}/gm, ""),
                messageType = $inp.attr("placeholder").toString().indexOf("email") > -1 ? "email" : "direct";

            if(((e.keyCode || e.which) == 13) && "direct" == messageType) { //Enter keycode
                $parent.empty();
                if (emptyText != "") {
                    _self.sendMessage(_self.sanitize(emptyText), null, function(resp){
                        _self.renderMessage(_self.pwrClientConversationUUID, _self.operator, _self.sanitize(emptyText), "", "Operator", resp["datestr"], null, 0, (_self.clientIsOnline == 0 ? 1 : 0));
                        _self.waiters.showTextareaTimeout = setTimeout(function(){
                            console.log("3. rendering textarea with status ",_self.clientIsOnline);
                            if (_self.clientIsOnline == 1) {
                                // show input to direct message
                                _self.lastOperatorMessages[_self.pwrClientConversationUUID] = "";
                                $parent.html('<textarea class="newMessageInput" id="newMessageInput" name="newMessageInput" placeholder="'+((_self.clientIsOnline == 1) ? "Write your message here" : "Send message on Customer Email")+'" rows="1" spellcheck="false" data-msg="'+_self.sanitize(new Date().getTime())+'"></textarea>');
                                $parent.find("#newMessageInput").focus();
                                if ($body.find(".powerChatConversationInner").hasClass("emailOnly")) {
                                    $body.find(".powerChatConversationInner").removeClass("emailOnly");
                                }
                            } else {
                                // send email response
                                _self.lastOperatorMessages[_self.pwrClientConversationUUID] = "";
                                $parent.html('<a href="javascript:void(0);" class="btnOpenSendEmailPopup">Send message on Customer Email</a>');
                                if (!$body.find(".powerChatConversationInner").hasClass("emailOnly")) {
                                    $body.find(".powerChatConversationInner").addClass("emailOnly");
                                }
                                if ($body.find(".powerChatConversationInner").attr("data-operatoranswered"), _self.sanitize(_self.operatorAnswered)) {
                                    $body.find(".powerChatConversationInner").attr("data-operatoranswered", _self.sanitize(_self.operatorAnswered));
                                }
                            }
                        },10);
                    });
                } else {
                    _self.waiters.showTextareaTimeout = setTimeout(function(){
                        console.log("4. rendering textarea with status ",_self.clientIsOnline);
                        if (_self.clientIsOnline == 1) {
                            // show input to direct message
                            $parent.html('<textarea class="newMessageInput" id="newMessageInput" name="newMessageInput" placeholder="'+((_self.clientIsOnline == 1) ? "Write your message here" : "Send message on Customer Email")+'" rows="1" spellcheck="false" data-msg="'+_self.sanitize(new Date().getTime())+'"></textarea>');
                            $parent.find("#newMessageInput").focus();
                            if ($body.find(".powerChatConversationInner").hasClass("emailOnly")) {
                                $body.find(".powerChatConversationInner").removeClass("emailOnly");
                            }
                        } else {
                            // send email response
                            $parent.html("<a href='javascript:void(0);' class='btnOpenSendEmailPopup'>Send message on Customer Email</a>");
                            if (!$body.find(".powerChatConversationInner").hasClass("emailOnly")) {
                                $body.find(".powerChatConversationInner").addClass("emailOnly");
                            }
                        }
                    },10);
                }
                if ("undefined" != typeof _self.waiters.sendTypingEventTimeout) {
                    clearTimeout(_self.waiters.sendTypingEventTimeout);
                }
            } else {
                if ("undefined" != typeof _self.waiters.sendTypingEventTimeout) {
                    clearTimeout(_self.waiters.sendTypingEventTimeout);
                } else {
                    _self.sendTypingEvent();
                }
                _self.waiters.sendTypingEventTimeout = setTimeout(function(){
                    _self.sendTypingEvent();
                },200);
            }
        });

        $body.on("click", ".conversationItem[data-conversationuuid][data-clientname][data-clientemail][data-online]", function(e){
            e.preventDefault();
            var $conversationItem = $(this),
                $imgPreviewWrapper = ".powerImagesUploaderWrapper .uploadedFilesThumbnailsInner";

            _self.clientName = _self.sanitize(_self.safeDecodeURIComponent(atob($conversationItem.attr("data-clientname"))));
            _self.clientEmail = _self.sanitize(_self.safeDecodeURIComponent(atob($conversationItem.attr("data-clientemail"))));
            _self.clientInitials = _self.sanitize(_self.getInitials(_self.clientName));
            _self.clientIsOnline = ("undefined" != typeof $conversationItem.attr("data-online") && 1 == parseInt($conversationItem.attr("data-online"),10)) ? 1 : 0;
            _self.pwrClientConversationUUID = _self.sanitize($conversationItem.attr("data-conversationuuid"));
            _self.deviceData = _self.sanitize($conversationItem.attr("data-devicedata"));

            if ("undefined" != typeof $conversationItem.attr("data-clientid") && !isNaN($conversationItem.attr("data-clientid"))){
                _self.clientId = parseInt($conversationItem.attr("data-clientid"),10);
            } else {
                _self.clientId = null;
            }

            if ("undefined" != typeof $conversationItem.attr("data-clientname") && "string" == typeof $conversationItem.attr("data-clientname") && !!$conversationItem.attr("data-clientname") && _self.isBase64($conversationItem.attr("data-clientname"))) {
                if (_self.clientName != _self.sanitize(_self.safeDecodeURIComponent(atob($conversationItem.attr("data-clientname"))))){
                    _self.clientName = _self.sanitize(_self.safeDecodeURIComponent(atob($conversationItem.attr("data-clientname"))));
                }
            }
            if ("undefined" != typeof $conversationItem.attr("data-clientemail") && "string" == typeof $conversationItem.attr("data-clientemail") && !!$conversationItem.attr("data-clientemail") && _self.isBase64($conversationItem.attr("data-clientemail"))) {
                if (_self.clientEmail != _self.sanitize(_self.safeDecodeURIComponent(atob($conversationItem.attr("data-clientemail"))))) {
                    _self.clientEmail = _self.sanitize(_self.safeDecodeURIComponent(atob($conversationItem.attr("data-clientemail"))));
                }
            }
            if ("undefined" != typeof $conversationItem.attr("data-operatoranswered") && !isNaN($conversationItem.attr("data-operatoranswered"))) {
                if (parseInt(_self.operatorAnswered,10) != parseInt(_self.sanitize($conversationItem.attr("data-operatoranswered")),10)) {
                    _self.operatorAnswered = parseInt(_self.sanitize($conversationItem.attr("data-operatoranswered")),10);
                }
                if ($body.find(".powerChatConversationInner").attr("data-operatoranswered") != _self.sanitize(_self.operatorAnswered)) {
                    $body.find(".powerChatConversationInner").attr("data-operatoranswered", _self.sanitize(_self.operatorAnswered));
                }
            }
            if ("undefined" != typeof $conversationItem.attr("data-waitingforclientresponse") && !isNaN($conversationItem.attr("data-waitingforclientresponse"))) {
                if (parseInt(_self.waitingForClientResponse,10) != parseInt(_self.sanitize($conversationItem.attr("data-waitingforclientresponse")),10)) {
                    _self.waitingForClientResponse = parseInt(_self.sanitize($conversationItem.attr("data-waitingforclientresponse")),10);
                }
            }
            if ("undefined" != typeof $conversationItem.attr("data-color") && "string" == typeof $conversationItem.attr("data-color") && $conversationItem.attr("data-color").toString().trim().length == 7 && $conversationItem.attr("data-color").indexOf("#") > -1) {
                if (_self.clientAvatarColor != $conversationItem.attr("data-color")) {
                    _self.clientAvatarColor = $conversationItem.attr("data-color");
                }
            }


            console.log("selected client is "+((1 == parseInt(_self.clientIsOnline,10)) ? "online" : "offline"));


            _self.assignUUID(_self.pwrClientConversationUUID, function(){
                _self.pwrChatOperatortId = _self.pwrClientConversationUUID;
                _self.renderConversationHeader();
                $body.find(".powerChatConversationInner").addClass("show");
                _self.checkIfEmailed(_self.pwrClientConversationUUID, function(respEmailed) {
                    if ("undefined" != typeof respEmailed && "undefined" != typeof respEmailed["status"] && true == respEmailed["status"]) {
                        $body.find(".powerChatConversationInner").addClass("emailed").attr("data-operatoranswered", 1);
                        $conversationItem.attr("data-operatoranswered", 1);
                        _self.operatorAnswered = 1;
                    } else {
                        $body.find(".powerChatConversationInner").removeClass("emailed").attr("data-operatoranswered", 0);
                        $conversationItem.attr("data-operatoranswered", 0);
                        _self.operatorAnswered = 0;
                    }
                    _self.getConversationMessages(_self.pwrClientConversationUUID, function (respMessages) {
                        console.log("got conversation messages", respMessages, _self.pwrClientConversationUUID);
                        _self.renderConversationMessages(respMessages, function () {
                            console.log("rendered conversation messages", respMessages, _self.pwrClientConversationUUID);
                            // $body.find("textarea#newMessageInput").show().removeAttr("disabled");
                            $parent = $body.find(".powerChatConversationActionsNewMessageWrapper");
                            if ("undefined" != typeof _self.waiters.showTextareaTimeout) {
                                clearTimeout(_self.waiters.showTextareaTimeout);
                            }
                            _self.waiters.showTextareaTimeout = setTimeout(function () {
                                console.log("1. rendering textarea with status ", _self.clientIsOnline);
                                if (_self.clientIsOnline == 1) {
                                    // show input to direct message
                                    $parent.html('<textarea class="newMessageInput" id="newMessageInput" name="newMessageInput" placeholder="' + ((_self.clientIsOnline == 1) ? "Write your message here" : "Send message on Customer Email") + '" rows="1" spellcheck="false" data-msg="' + _self.sanitize(new Date().getTime()) + '"></textarea>');
                                    $parent.find("#newMessageInput").focus();
                                    if ($body.find(".powerChatConversationInner").hasClass("emailOnly")) {
                                        $body.find(".powerChatConversationInner").removeClass("emailOnly");
                                    }
                                } else {
                                    // send email response
                                    $parent.html("<a href='javascript:void(0);' class='btnOpenSendEmailPopup'>Send message on Customer Email</a>");
                                    if (!$body.find(".powerChatConversationInner").hasClass("emailOnly")) {
                                        $body.find(".powerChatConversationInner").addClass("emailOnly");
                                    }
                                }
                            }, 10);

                            if ($body.find(".conversationItem").not($conversationItem).hasClass("selected")) {
                                $body.find(".conversationItem").not($conversationItem).removeClass("selected");
                            }
                            if (!$conversationItem.hasClass("selected")) {
                                $conversationItem.addClass("selected");
                            }

                            var messageObj = {
                                "comm": "clientConnected",
                                "data": {
                                    "attr": "operator",
                                    "operator": _self.operator,
                                    "uuid": _self.pwrChatOperatortId,
                                    "windowuuid": _self.windowUUID,
                                    "message": _self.operator + " joined the chat"
                                }
                            };
                            if (true == _self.WebSocketServerIsOnline()) {
                                _self.WebSocketServer.send(btoa(encodeURIComponent(JSON.stringify(messageObj))));
                            } else {
                                _self.initWebsocketServer(function () {
                                    _self.WebSocketServer.send(btoa(encodeURIComponent(JSON.stringify(messageObj))));
                                });
                            }
                            _self.removeAllPreloadedFiles($imgPreviewWrapper, function () {
                                $body.find(".powerImagesUploaderWrapper").removeClass("existingMessageMedia show");
                            });
                        });
                    });
                });
            });
        });

        $body.on("dragover", ".powerChatConversationWrapper", function(e) {
            // e.preventDefault();
            // e.stopPropagation();
            // e.stopImmediatePropagation();
            $body.find(".powerChatConversationWrapper").addClass("dragover");
            $body.find(".powerImagesUploaderWrapper").removeClass("existingMessageMedia").addClass("show");
            $body.find(".powerImagesUploaderWrapper .imageUploadWrapper").addClass("filesAboutToDrop");
            //do drragover
            $body.find("#dragUploadFile").addClass('dragging');
            // $body.find("#dragUploadFile").trigger("dragover");
            return false;
        });

        $body.on("dragleave", ".powerChatConversationWrapper", function(e) {
            // e.preventDefault();
            // e.stopPropagation();
            // e.stopImmediatePropagation();
            $body.find(".powerChatConversationWrapper").removeClass("dragover");
            $body.find(".powerImagesUploaderWrapper .imageUploadWrapper").removeClass("filesAboutToDrop");
            $body.find("#dragUploadFile").removeClass('dragging');
            if ($body.find(".powerImagesUploaderWrapper .fileItem").length == 0) {
                $body.find(".powerImagesUploaderWrapper").removeClass("existingMessageMedia show");
            }
        });

        $body.on("drop", ".powerChatConversationWrapper", function(e) {
            e.preventDefault();
            e.stopPropagation();
            var $dropzone = $(this);

            //do drop
            // var files = $dropzone[0].files || ($dropzone[0].dataTransfer && $dropzone[0].dataTransfer.files);
            // console.log("Files dropped in dropzpone", files);
            if(e.originalEvent.dataTransfer && e.originalEvent.dataTransfer.files.length) {
                var files = e.originalEvent.dataTransfer.files;
                _self.filesPreload(files, ".powerImagesUploaderWrapper .uploadedFilesThumbnailsInner", function(){
                    $body.find(".powerImagesUploaderWrapper .imageUploadWrapper").removeClass("filesAboutToDrop");
                    $body.find(".powerChatConversationWrapper").removeClass("dragover");
                });
            }

        });
        $body.on("change", "#selectfile", function(e){
            var $inp = $(this);
            files = $inp[0].files;
            _self.filesPreload(files, ".powerImagesUploaderWrapper .uploadedFilesThumbnailsInner");
        });
        $body.on("click", "#selectfilesBtn, .btnAddNewFiles", function(e){
            $body.find("#selectfile")[0].click();
        });
        $body.on("click", ".deleteFileBtn[data-storedname]", function(e){
            var $btn = $(this),
                storedname = $btn.attr("data-storedname");
            _self.removePreloadedFile(storedname, ".powerImagesUploaderWrapper .uploadedFilesThumbnailsInner");
            e.preventDefault();
        });
        $body.on("click", ".btnOpenSelectNewFile", function(e){
            e.preventDefault();
            $body.find(".powerImagesUploaderWrapper").removeClass("existingMessageMedia").addClass("show");
        });

        $body.on("click", ".btnSendPreloadedFiles", function(e){
            e.preventDefault();
            var $imgPreviewWrapper = ".powerImagesUploaderWrapper .uploadedFilesThumbnailsInner",
                filesNames = [];
            _self.ajaxFileUpload($imgPreviewWrapper, function(resp){
                console.log("File upload response", resp);
                if ("undefined" != typeof resp
                    && "undefined" != typeof resp["data"]
                    && "undefined" != typeof resp["data"]["files"]
                    && Array.isArray(resp["data"]["files"])
                    && resp["data"]["files"].length > 0
                ) {
                    resp["data"]["files"].forEach(function(file, i){
                        if ("undefined" != typeof file["storedname"] && "string" == typeof file["storedname"]
                        && filesNames.indexOf(_self.sanitize(file["storedname"])) == -1) {
                            filesNames.push(_self.sanitize(file["storedname"]));
                        }
                    });
                }

                if (filesNames.length > 0) {
                    _self.sendMessage("", filesNames, function(resp2){
                        _self.renderMessage(_self.pwrClientConversationUUID, _self.operator, "", "", "Operator", resp2["datestr"], btoa(encodeURIComponent(JSON.stringify(filesNames))));
                        _self.waiters.showTextareaTimeout = setTimeout(function(){
                            var $parent = $body.find(".powerChatConversationActionsNewMessageWrapper");
                            console.log("2. rendering textarea with status ",_self.clientIsOnline);
                            if (_self.clientIsOnline == 1) {
                                // show input to direct message
                                $parent.html('<textarea class="newMessageInput" id="newMessageInput" name="newMessageInput" placeholder="'+((_self.clientIsOnline == 1) ? "Write your message here" : "Send message on Customer Email")+'" rows="1" spellcheck="false" data-msg="'+_self.sanitize(new Date().getTime())+'"></textarea>');
                                $parent.find("#newMessageInput").focus();
                                if ($body.find(".powerChatConversationInner").hasClass("emailOnly")) {
                                    $body.find(".powerChatConversationInner").removeClass("emailOnly");
                                }
                            } else {
                                // send email response
                                $parent.html("<a href='javascript:void(0);' class='btnOpenSendEmailPopup'>Send message on Customer Email</a>");
                                if (!$body.find(".powerChatConversationInner").hasClass("emailOnly")) {
                                    $body.find(".powerChatConversationInner").addClass("emailOnly");
                                }
                            }
                            _self.removeAllPreloadedFiles($imgPreviewWrapper, function(){
                                $body.find(".powerImagesUploaderWrapper").removeClass("existingMessageMedia show");
                            });
                        },300);
                    });
                }
            });
        });
        $body.on("click", ".btnCloseFileUploader", function(e){
            e.preventDefault();
            var $btn = $(this),
                $imgPreviewWrapper = ".powerImagesUploaderWrapper .uploadedFilesThumbnailsInner";
            _self.removeAllPreloadedFiles($imgPreviewWrapper, function(){
                $body.find(".powerImagesUploaderWrapper").removeClass("existingMessageMedia show");
            });
        });

        $body.on("click", ".uploadedFilesWrapper .fileItem", function(e){
            e.preventDefault();
            var $thumb = $(this),
                $largePreviewWrapper = $body.find(".fileLargePreviewWrapper");

            if (null !== _self.$easyzoom && "undefined" != typeof _self.$easyzoom.data('easyZoom')) {
                _self.$easyzoom.data('easyZoom').teardown();
            }

            if ($thumb.find(".preview img").length > 0) {
                $largePreviewWrapper.removeClass("easyzoom zoomed");
                $largePreviewWrapper.addClass("easyzoom");
                $largePreviewWrapper.html("<a href='"+_self.sanitize($thumb.find(".preview img").attr("src"))+"'><img src='"+_self.sanitize($thumb.find(".preview img").attr("src"))+"' /></a>");
            } else if ($thumb.find(".preview video").length > 0) {
                $largePreviewWrapper.removeClass("easyzoom zoomed");

                $largePreviewWrapper.html("<video controls src='"+_self.sanitize($thumb.find(".preview video").attr("src"))+"'></video>");
            }
            $thumb.addClass("active");
            $body.find(".uploadedFilesWrapper .fileItem").not($thumb).removeClass("active");
        });

        $body.on("click", ".messageImgItem[data-imgsrc], .messageVideoItem[data-videosrc]", function(e){
            e.preventDefault();
            var $clickedMedia = $(this),
                $messageWrapper = $clickedMedia.closest(".message"),
                mediaType = $clickedMedia.hasClass("messageImgItem") && "undefined" != typeof $clickedMedia.attr("data-imgsrc") ? "image" : "video",
                mediaSrc = ("image" == mediaType) ? $clickedMedia.attr("data-imgsrc") : $clickedMedia.attr("data-videosrc"),
                $messageFilesWrapper = $clickedMedia.closest(".messageContentFiles"),
                $mediaFiles = $messageFilesWrapper.find(".messageImgItem[data-imgsrc], .messageVideoItem[data-videosrc]"),
                $popupWrapper = $body.find(".powerImagesUploaderWrapper"),
                $thumbnailsWrapper = $popupWrapper.find(".uploadedFilesThumbnailsInner"),
                $thumbnailsHtml = "";


            // render large preview
            if ("image" == mediaType) {
                if ($body.find(".uploadedFilesInner .fileLargePreviewWrapper").length > 0) {
                    $body.find(".uploadedFilesInner .fileLargePreviewWrapper").remove();
                }
                var $largePreviewHtml = "<div class='fileLargePreviewWrapper easyzoom'>";
                        $largePreviewHtml += "<a href='"+_self.sanitize(mediaSrc)+"'>";
                            $largePreviewHtml += "<img src='"+_self.sanitize(mediaSrc)+"' />";
                        $largePreviewHtml += "</a>";
                    $largePreviewHtml += "</div>";

                $body.find(".uploadedFilesInner").prepend($largePreviewHtml);
            } else if ("video" == mediaType) {
                if ($body.find(".uploadedFilesInner .fileLargePreviewWrapper").length > 0) {
                    $body.find(".uploadedFilesInner .fileLargePreviewWrapper").remove();
                }
                var $largePreviewHtml = "<div class='fileLargePreviewWrapper'>";
                $largePreviewHtml += "<video controls src='"+_self.sanitize(mediaSrc)+"'></video>";
                $largePreviewHtml += "</div>";

                console.log("VIDEO SRC", mediaSrc);

                $body.find(".uploadedFilesInner").prepend($largePreviewHtml);
            }

            // render thumbnails
            $mediaFiles.each(function(){
                var $mediaFileItem = $(this),
                    mediaType2 = $mediaFileItem.hasClass("messageImgItem") && "undefined" != typeof $mediaFileItem.attr("data-imgsrc") ? "image" : "video",
                    mediaSrc2 = ("image" == mediaType2) ? $mediaFileItem.attr("data-imgsrc") : $mediaFileItem.attr("data-videosrc");

                if ("image" == mediaType2) {
                    $thumbnailsHtml += "<div class='fileItem"+(mediaSrc == mediaSrc2 ? " active" : "")+"'>";
                        $thumbnailsHtml += "<div class='preview'>";
                            $thumbnailsHtml += "<img src='"+_self.sanitize(mediaSrc2)+"' />";
                        $thumbnailsHtml += "</div>";
                    $thumbnailsHtml += "</div>";
                } else if ("video" == mediaType2) {
                    $thumbnailsHtml += "<div class='fileItem"+(mediaSrc == mediaSrc2 ? " active" : "")+"''>";
                        $thumbnailsHtml += "<div class='preview'>";
                            $thumbnailsHtml += "<video src='"+_self.sanitize(mediaSrc2)+"'></video>";
                        $thumbnailsHtml += "</div>";
                    $thumbnailsHtml += "</div>";
                }
            });

            $thumbnailsWrapper.html($thumbnailsHtml);

            // show media
            $popupWrapper.addClass("existingMessageMedia show");
        });

        $body.on("click", ".easyzoom", function(e){
            e.preventDefault();
            var $easyzoom = $(this);

            if (!$easyzoom.hasClass("zoomed")) {
                if (null !== _self.$easyzoom && "undefined" != typeof _self.$easyzoom.data('easyZoom')) {
                    _self.$easyzoom.data('easyZoom').teardown();
                }
                _self.$easyzoom = $body.find(".easyzoom").easyZoom();
                $easyzoom.addClass("zoomed");
                _self.$easyzoom.data("easyZoom").show();
                $easyzoom.trigger("onenter").trigger("onmove");
            } else {
                $easyzoom.removeClass("zoomed");
                if (null !== _self.$easyzoom && "undefined" != typeof _self.$easyzoom.data('easyZoom')) {
                    _self.$easyzoom.data('easyZoom').teardown();
                }
            }
        });

        $body.on("click focus input", "#newMessageInput", function(e){
            _self.lastOperatorMessages[_self.pwrClientConversationUUID] = _self.sanitize($body.find("#newMessageInput").val().toString());
            if ("undefined" != typeof _self.waiters.markAsSeenTimeout) {
                clearTimeout(_self.waiters.markAsSeenTimeout);
            }
            _self.waiters.markAsSeenTimeout = setTimeout(function(){
                _self.markAsSeen();
            },100);
        });

        $body.on("click", ".conversationFilterBtn[data-filter]", function(e){
            e.preventDefault();
            var $btn = $(this),
                showFilter = _self.sanitize($btn.attr("data-filter"));
            if (["all", "unread", "notreplied"].indexOf(showFilter) > -1) {
                _self.filters.conversations.page = 1;
                _self.filters.conversations.show = _self.sanitize(showFilter);
                $body.find(".conversationFilterBtn").not($btn).removeClass("active");
                $btn.addClass("active");
                // reload conversations using the new filter
                if ("undefined" != typeof _self.waiters.checkClientConversationsimeout) {
                    clearTimeout(_self.waiters.checkClientConversationsimeout);
                }
                _self.getStoredConversations(function(resp2){
                    if ("undefined" != typeof resp2["data"] && JSON.stringify(_self.lastConversationsData) !== JSON.stringify(resp2["data"])) {
                        $body.find(".powerChatConversationsList").empty();
                        if ("undefined" != typeof resp2["data"]["items"] && !isNaN(resp2["data"]["items"])) {
                            _self.totalConversations = parseInt(resp2["data"]["items"],10);
                        }
                        if ("undefined" != typeof resp2["data"]["showing"] && !isNaN(resp2["data"]["showing"])) {
                            _self.renderedConversations = $body.find(".powerChatConversationsList .conversationItem").length;
                        }
                        if ("undefined" != typeof resp2["data"]["pages"] && !isNaN(resp2["data"]["pages"])) {
                            _self.conversationsTotalPages = parseInt(resp2["data"]["pages"],10);
                        }
                        _self.renderOperatorClientsConversations(resp2["data"]["items"], "ajax");
                    }
                    _self.getOperatorClientUUIDS();
                });
            }
        });

        $(".powerChatConversationsListWrapper").on("scroll", function(){
            var $this = $(this);
            if (_self.waiters.checkForConversationsListScrollToBottomTimeout) {
                clearTimeout(_self.waiters.checkForConversationsListScrollToBottomTimeout);
            }

            _self.waiters.checkForConversationsListScrollToBottomTimeout = setTimeout(function(){
                if ($this.scrollTop() + $this.innerHeight() >= $this[0].scrollHeight) {
                    console.log('Scrolled to bottom!');
                    if (1 == _self.canFetchNextPage) {

                        if (!isNaN(_self.filters.conversations.page) && !isNaN(_self.conversationsTotalPages)
                            && _self.filters.conversations.page < _self.conversationsTotalPages) {
                            console.log(_self.filters.conversations.page, _self.conversationsTotalPages);
                            // fetch next page
                            _self.filters.conversations.page++;
                            console.log(_self.filters.conversations.page, _self.conversationsTotalPages);
                            _self.getStoredConversations(function(resp2){
                                if ("undefined" != typeof resp2["data"] && JSON.stringify(_self.lastConversationsData) !== JSON.stringify(resp2["data"])) {
                                    if ("undefined" != typeof resp2["data"]["items"] && !isNaN(resp2["data"]["items"])) {
                                        _self.totalConversations = parseInt(resp2["data"]["items"],10);
                                    }
                                    if ("undefined" != typeof resp2["data"]["showing"] && !isNaN(resp2["data"]["showing"])) {
                                        _self.renderedConversations = $body.find(".powerChatConversationsList .conversationItem").length;
                                    }
                                    if ("undefined" != typeof resp2["data"]["pages"] && !isNaN(resp2["data"]["pages"])) {
                                        _self.conversationsTotalPages = parseInt(resp2["data"]["pages"],10);
                                    }
                                    _self.renderOperatorClientsConversations(resp2["data"]["items"], "ajax");
                                }
                                _self.getOperatorClientUUIDS();
                            });
                        }
                        _self.canFetchNextPage = 0;
                    }
                } else {
                    _self.canFetchNextPage = 1;
                }
            }, 100);
        });

        $body.on("input", ".inputSearchConversationItems", function(){
            var $inp = $(this),
                inpVal = $inp.val().toString().trim();
            if ("undefined" != typeof _self.waiters.searchConversationItemsTimeout) {
                clearTimeout(_self.waiters.searchConversationItemsTimeout);
            }
            _self.waiters.searchConversationItemsTimeout = setTimeout(function(){
                _self.filters.conversations.search = _self.sanitize(inpVal);
                _self.filters.conversations.page = 1;
                _self.getStoredConversations(function(resp2){
                    if ("undefined" != typeof resp2["data"] && JSON.stringify(_self.lastConversationsData) !== JSON.stringify(resp2["data"])) {
                        $body.find(".powerChatConversationsList").empty();
                        if ("undefined" != typeof resp2["data"]["items"] && !isNaN(resp2["data"]["items"])) {
                            _self.totalConversations = parseInt(resp2["data"]["items"],10);
                        }
                        if ("undefined" != typeof resp2["data"]["showing"] && !isNaN(resp2["data"]["showing"])) {
                            _self.renderedConversations = $body.find(".powerChatConversationsList .conversationItem").length;
                        }
                        if ("undefined" != typeof resp2["data"]["pages"] && !isNaN(resp2["data"]["pages"])) {
                            _self.conversationsTotalPages = parseInt(resp2["data"]["pages"],10);
                        }
                        _self.renderOperatorClientsConversations(resp2["data"]["items"], "ajax");
                    }
                    _self.getOperatorClientUUIDS();
                });
            },100);
        });

        $body.on("click", ".popup .btnClosePopup, .popup .btnCancel, .popupUnderlay", function(e){
            e.preventDefault();
            var $btn = $(this),
                $popup = $body.find(".popup"),
                $popupUnderlay = $body.find(".popupUnderlay");

            $popup.removeClass("show");
            $popupUnderlay.removeClass("show");
        });

        $body.on("click", ".btnOpenSendEmailPopup", function(e){
            e.preventDefault();
            var $btn = $(this),
                $popup = $body.find(".popup[data-popup='sendEmailPopup']"),
                $popupUnderlay = $body.find(".popupUnderlay");
            $popup.find(".popupHead .clientName").text(_self.sanitize([_self.clientName, _self.clientEmail].join(" | ").trim()));
            $popup.find(".emailBody").empty();
            setTimeout(function(){
                $popup.find(".emailBody").html('<textarea class="emailBodyInput" placeholder="Your reply"></textarea>');
                setTimeout(function(){
                    $popup.addClass("show");
                    $popupUnderlay.addClass("show");
                }, 2);
            },1);
        });

        $body.on("click", ".popup[data-popup='sendEmailPopup'] .btnConfirm", function(e){
            e.preventDefault();
            var $btn = $(this),
                $popup = $body.find(".popup[data-popup='sendEmailPopup']"),
                $popupUnderlay = $body.find(".popupUnderlay"),
                $emailTextarea = $popup.find("textarea.emailBodyInput"),
                emailText = _self.sanitize($emailTextarea.val().toString().trim()),
                valid = true;

            if (emailText.length < 2) {
                valid = false;
                _self.msg("Message is too short");
            }

            if (!_self.emailValid(_self.clientEmail)) {
                valid = false;
                _self.msg("Customer's email address is invalid. Message cannot be sent.");
            }


            if (true == valid) { // send email
                _self.sendMessage(_self.sanitize(emailText), null, function(resp){
                    _self.renderMessage(_self.pwrClientConversationUUID, _self.operator, _self.sanitize(emailText), "", "Operator", resp["datestr"], null, 0, (_self.clientIsOnline == 0 ? 1 : 0));
                    _self.waiters.showTextareaTimeout = setTimeout(function(){
                        // replace text button
                        console.log("Email resp", resp);
                        _self.msg("Email sent");
                        $popup.find(".emailBody").empty();
                        setTimeout(function(){
                            $popup.find(".emailBody").html('<textarea class="emailBodyInput" placeholder="Your reply"></textarea>');
                            setTimeout(function(){
                                $popup.removeClass("show");
                                $popupUnderlay.removeClass("show");
                                _self.operatorAnswered = 1;
                                if ($body.find(".powerChatConversationInner").attr("data-operatoranswered"), _self.sanitize(_self.operatorAnswered)) {
                                    $body.find(".powerChatConversationInner").attr("data-operatoranswered", _self.sanitize(_self.operatorAnswered));
                                }
                            }, 2);
                        },1);
                    },10);
                });
            }
            console.log("Email", _self.clientEmail, "Name", _self.clientName, "Text", emailText);
        });
    };

    _self.initApp = function(callback){
        _self.setupOperator(function(){
            _self.checkClientUUID(function(resp){
                if ("undefined" != typeof _self.waiters.checkClientConversationsimeout) {
                    clearTimeout(_self.waiters.checkClientConversationsimeout);
                }
                _self.getStoredConversations(function(resp2){
                    if ("undefined" != typeof resp2["data"] && JSON.stringify(_self.lastConversationsData) !== JSON.stringify(resp2["data"])) {
                        if ("undefined" != typeof resp2["data"]["items"] && !isNaN(resp2["data"]["items"])) {
                            _self.totalConversations = parseInt(resp2["data"]["items"],10);
                        }
                        if ("undefined" != typeof resp2["data"]["showing"] && !isNaN(resp2["data"]["showing"])) {
                            _self.renderedConversations = $body.find(".powerChatConversationsList .conversationItem").length;
                        }
                        if ("undefined" != typeof resp2["data"]["pages"] && !isNaN(resp2["data"]["pages"])) {
                            _self.conversationsTotalPages = parseInt(resp2["data"]["pages"],10);
                        }
                        _self.renderOperatorClientsConversations(resp2["data"]["items"], "ajax");
                    }
                    _self.getOperatorClientUUIDS();
                });
                _self.handleEvents();
                _self.loader(false);
                _self.monitorConversationOpening(true);
            });
        });

        $body.on("click", ".fileLargePreviewWrapper > a", function(e){
            var $a = $(this),
                $zoomer = $a.closest(".fileLargePreviewWrapper"),
                $target = $(e.target),
                $wrapper = $a.closest(".powerImagesUploaderWrapper"),
                $btnClose = $wrapper.find(".btnCloseFileUploader"),
                isTheImage = $target.is("img") ? true : false,
                isTheAnchor = $target.is("a") ? true : false;
            // console.log("isTheImage", isTheImage, "isTheAnchor", isTheAnchor);
            if (true == isTheAnchor && false == isTheImage) {
                e.preventDefault();
                e.stopImmediatePropagation();
                e.stopPropagation();
                $btnClose[0].click();
                return false;
            }
        });
    };

    _self.init = function(dev){
        if ("undefined" != typeof jQuery) {
            if ("function" != typeof jQuery.curCSS) {
                jQuery.curCSS = function (element, prop, val) {
                    return jQuery(element).css(prop, val);
                };
            }
        }
        if ("undefined" == typeof dev) {
            var dev = false;
        }
        _self.initApp();
    };
};


$(window).on("load", function(){
    window.OperatorChat = new OperatorChat();
    window.OperatorChat.init();
});
