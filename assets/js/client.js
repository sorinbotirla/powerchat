function hexEncode(str) {
    let result = '';
    for (let i = 0; i < str.length; i++) {
        let hex = str.charCodeAt(i).toString(16);
        result += ("000" + hex).slice(-4);
    }
    return result;
}

function hexDecode(hexStr) {
    let hexes = hexStr.match(/.{1,4}/g) || [];
    let result = '';
    for (let i = 0; i < hexes.length; i++) {
        result += String.fromCharCode(parseInt(hexes[i], 16));
    }
    return result;
}


var ClientChat = function(){
    $.support.cors = true;
    var _self = this;
    var $body = $("body");
    _self.waiters = {};
    _self.repeaters = {};
    _self.websocketUrl = ""; // change this
    _self.apiUrl = ""; // change this
    _self.operatorAvatarUrl = ""; // change this
    _self.websocketPort = ""; // THE WEBSOCKET PORT
    _self.filesObjectToUpload = new FormData();
    _self.focused = false;
    _self.isDesktop = false;
    _self.isMobile = false;
    _self.scrollTop = window.scrollY || document.documentElement.scrollTop;
    _self.startY = 0;
    _self.operatorsOnline = 0;
    _self.preventScroll = function(e) {
        const el = e.target;

        // Allow scroll inside .chatConversationWrapper only
        if (el.closest('.chatConversationWrapper')) {
            return;
        }

        // Block all other touchmove events
        e.preventDefault();
    };

    _self.lockScroll = function () {
        _self.scrollTop = window.scrollY || document.documentElement.scrollTop;

        document.body.style.position = 'fixed';
        document.body.style.top = `-${_self.scrollTop}px`;
        document.body.style.left = '0';
        document.body.style.right = '0';
        document.body.style.width = '100%';
        document.body.style.overflow = 'hidden';
        document.body.style.touchAction = 'none'; // CRITICAL on Chrome
    };

    _self.unlockScroll = function () {
        document.body.style.position = '';
        document.body.style.top = '';
        document.body.style.left = '';
        document.body.style.right = '';
        document.body.style.width = '';
        document.body.style.overflow = '';
        document.body.style.touchAction = '';

        window.scrollTo(0, _self.scrollTop || 0);
    };

    _self.adjustChatScrollArea = function() {
        const totalHeight = window.visualViewport.height;
        const inputHeight = $(".powerChat .chatFooter").outerHeight();
        const scrollableHeight = totalHeight - inputHeight;

        $(".powerChat .chatConversationWrapper").css("height", (scrollableHeight-20) + "px");
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

    _self.uuid = function() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
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
        return !!!val || /^[a-zA-Z ]+$/.test(val) || val.toString().trim() == "";
    };
    _self.alphaOnly = function(val){
        return !!!val || /^[a-zA-Z ]+$/.test(val) || val.toString().trim() == "";
    };
    _self.emailValid = function(email) {
        return (!!email && email.toString().trim().length > 0 && (/^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(email))) ? true : false;
    };
    _self.phoneValid = function(phone) {
        return (!!phone && phone.toString().trim().split("").filter(function(v){return /^[0-9]*$/.test(v) ? true : false; }).length >= 10 && phone.toString().trim().replace("+4", "").length >= 10 && /^[\d()+]+$/.test(phone)) ? true : false;
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
        _self.setHostParameters(hostParams);
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

    _self.windowUUID = null;
    _self.orderNumber = null;
    _self.initialMessage = null;
    _self.pwrChatClientUUID = null;
    _self.pwrChatClientName = null;
    _self.pwrChatClientEmail = null;
    _self.pwrChatClientColor = null;

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
                "utm", "ga", "gad", "gclid", "fbclid", "yclid", "msclkid", "igshid", "mc", "ref", "trk", "spm", "amp", "vero", "hsa", "sca", "pk", "wt", "gbraid"
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
        return str.split("").reverse().join("");
    };

    _self.arrayShuffle = function(arr){
        var j, x, i;
        for (i = arr.length - 1; i > 0; i--) {
            j = Math.floor(Math.random() * (i + 1));
            x = arr[i];
            arr[i] = arr[j];
            arr[j] = x;
        }
        return arr;
    };

    _self.isJson = function (str) {
        try {
            JSON.parse(str);
        } catch (e) {
            return false;
        }
        return true;
    };

    _self.isBase64 = function (str) {
        try {
            window.atob(str);
        } catch (e) {
            return false;
        }
        return true;
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
    };

    _self.getInitials = function(name){
        return ("undefined" != typeof name && "string" == typeof name) ? name.match(/(^\S\S?|\s\S)?/g).map(v=>v.trim()).join("").match(/(^\S|\S$)?/g).join("").toLocaleUpperCase() : "NA";
    };

    _self.capitalizeLetters = function(text){
        return ("undefined" != typeof text && "string" == typeof text) ? text.replace(/(^\w|\s\w)(\S*)/g, (_,m1,m2) => m1.toUpperCase()+m2.toLowerCase()) : "";
    };

    _self.confirm = function(question, buttonYesText, buttonNotext, buttonYesFunction, buttonNoFunction, dialogClass){
        if ("undefined" != typeof question) {
            var $html = '<div id="dialog-confirm" title="'+question+'">';
            $html += '</div>';

            if ($("body").find("#dialog-confirm").length) {
                $("body").find("#dialog-confirm").remove();
            }
            $("body").append($html);

            if ("function" == typeof $.fn.dialog) {
                // console.log("Dialog opening");
                $("body").find("#dialog-confirm" ).dialog({
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

            if ($("body").find("#dialog-form").length) {
                $("body").find("#dialog-form").remove();
            }
            $("body").append($html);

            if ("function" == typeof $.fn.dialog) {
                // console.log("Dialog opening");
                $("body").find("#dialog-form" ).dialog({
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
        $("body").find(".powerChatStatusmsgs .msg").remove();
        $("body").find(".powerChatStatusmsgs").prepend("<div id='row"+_self.lastRow+"' class='msg "+msgType+"' style='white-space: nowrap;'>"+msg+"</div>");
        $("body").find(".powerChatStatusmsgs .msg").addClass("show");

        if ("undefined" != typeof _self.waiters.hideMsgTimeout){
            clearTimeout(_self.waiters.hideMsgTimeout)
        }
        _self.waiters.hideMsgTimeout = setTimeout(function(){
            $("body").find(".powerChatStatusmsgs .msg").removeClass("show");
        },3000);
    };

    _self.loader = function(start) {
        if ("undefined" == typeof start || "boolean" != typeof start) {
            var start = true;
        }

        if (start) {
            $("body").addClass("loading");
        } else {
            $("body").removeClass("loading");
        }
    };

    _self.getTime = function(callback){
        $.ajax({
            url: _self.apiUrl+"/",
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
                            "attr": "client",
                            "uuid": _self.pwrChatClientUUID,
                            "clientname": _self.pwrChatClientName,
                            "clientemail": _self.pwrChatClientEmail,
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
                // console.log("Received Websocket message", info);

                _self.handleWSMessage(info);
            };
        } else {
            // console.log("Server is online. will continue");
            if ("function" == typeof callback) {
                callback();
            }
        }
    };

    _self.notifyClientNewMessage = function(){
        var newMessages = 1;
        if ($("body").find(".btnShowPowerChatFob").length > 0) {
            if ($("body").find(".btnShowPowerChatFob .newMessagesCounter").length == 0) {
                $("body").find(".btnShowPowerChatFob").append("<span class='newMessagesCounter' data-newmessages='"+_self.sanitize(newMessages)+"'>"+_self.sanitize(newMessages)+"</span>");
            } else {
                if (!isNaN($("body").find(".btnShowPowerChatFob .newMessagesCounter").attr("data-newmessages"))) {
                    newMessages += parseInt($("body").find(".btnShowPowerChatFob .newMessagesCounter").attr("data-newmessages"),10);
                }
                $("body").find(".btnShowPowerChatFob .newMessagesCounter").attr("data-newmessages", _self.sanitize(newMessages));
                $("body").find(".btnShowPowerChatFob .newMessagesCounter").text(_self.sanitize(newMessages));
            }
        }
    };


    _self.handleWSMessage = function(message) {
        // console.log("Incoming message" , message);
        if (_self.isBase64(message)) {
            message = _self.safeDecodeURIComponent(atob(message));
            if (_self.isJson(message)) {
                message = JSON.parse(message);
                if ("undefined" != typeof message["comm"]) {
                    switch(message["comm"]){
                        case "newMessage":
                            _self.notifyClientNewMessage();
                            _self.renderMessage(message["data"]["message"], message["data"]["operator"], "Operator", new Date().toLocaleString("ro-RO"), ("undefined" != typeof message["data"]["files"]) ? message["data"]["files"] : "");
                            break;
                        case "clientConnected":
                            _self.renderChatNotice(message["data"]["message"], new Date().toLocaleString("ro-RO"));
                            break;
                        case "clientDisconnected":
                            _self.renderChatNotice(message["data"]["message"], new Date().toLocaleString("ro-RO"));
                            break;
                        case "typingEvent":
                            if ("undefined" != typeof message["data"]["operator"]) {
                                _self.renderTypingEvent(message["data"]["operator"]);
                            }
                            break;
                        case "seenEvent":
                            if ("undefined" != typeof message["data"]["uuid"], "undefined" != typeof message["data"]["operator"]) {
                                _self.renderSeenEvent(message["data"]["uuid"], message["data"]["operator"]);
                            }
                            break;
                    }
                }
            }
        }
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

    _self.sendMessage = function(message, files, callback){
        var messageObj = {
            "comm": "newMessage",
            "data": {
                "attr": "client",
                "uuid": _self.sanitize(_self.pwrChatClientUUID),
                "clientname": _self.sanitize(_self.pwrChatClientName),
                "clientemail": _self.sanitize(_self.pwrChatClientEmail),
                "windowuuid": _self.sanitize(_self.windowUUID),
                "message": _self.sanitize(message),
                "color": _self.sanitize(_self.pwrChatClientColor),
                "files": ("undefined" != typeof files && Array.isArray(files) && files.length > 0) ? btoa(encodeURIComponent(JSON.stringify(files))) : ""
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
            });
        }
    };

    _self.sendTypingEvent = function(callback){
        var messageObj = {
            "comm": "typingEvent",
            "data": {
                "attr": "client",
                "uuid": _self.pwrChatClientUUID,
                "clientname": _self.pwrChatClientName,
                "clientemail": _self.pwrChatClientEmail,
                "windowuuid": _self.windowUUID
            }
        };
        if (true == _self.WebSocketServerIsOnline()) {
            _self.WebSocketServer.send(btoa(encodeURIComponent(JSON.stringify(messageObj))));
            if ("function" == typeof callback){
                callback(resp);
            }
        } else {
            _self.initWebsocketServer(function(){
                _self.WebSocketServer.send(btoa(encodeURIComponent(JSON.stringify(messageObj))));
                if ("function" == typeof callback){
                    callback(resp);
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

    _self.checkChatCustomer = function(email, customerId, callback){
        $.ajax({
            url: _self.apiUrl + "/",
            data: {
                method: "checkchatcustomer",
                data: btoa(encodeURIComponent(JSON.stringify({"email": _self.sanitize(email), "customerid": _self.sanitize(customerId)})))
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

    _self.setupClient = function(callback){
        // console.log("Setting up client..");
        if (!!!_self.safeGetItem("pwrchatclientcolor")) {
            _self.safeSetItem("pwrchatclientcolor", _self.getRandomColor(40));
        }

        if ("undefined" != typeof window.customerData
            && "undefined" != typeof window.customerData.data
            && "undefined" != typeof window.customerData.data.customerid
            && "undefined" != typeof window.customerData.data.custconfirstname
            && "undefined" != typeof window.customerData.data.custconlastname
            && "undefined" != typeof window.customerData.data.custconemail) {
            console.log("checking customer");
            _self.safeSetItem("pwrchatcnm", _self.sanitize(btoa(encodeURIComponent([window.customerData.data.custconfirstname, window.customerData.data.custconlastname].join(" ").trim()))));
            _self.safeSetItem("pwrchatcml", _self.sanitize(btoa(encodeURIComponent(window.customerData.data.custconemail))));
            $("body").find(".powerChat .introductionFirstName").val(_self.sanitize(window.customerData.data.custconfirstname)).attr("disabled", "disabled").attr("readonly", "readonly").css({"style": "pointer-events: none !importantl"});
            $("body").find(".powerChat .introductionLastName").val(_self.sanitize(window.customerData.data.custconlastname)).attr("disabled", "disabled").attr("readonly", "readonly").css({"style": "pointer-events: none !importantl"});
            $("body").find(".powerChat .introductionEmail").val(_self.sanitize(window.customerData.data.custconemail)).attr("disabled", "disabled").attr("readonly", "readonly").css({"style": "pointer-events: none !importantl"});
            $("body").find(".powerChat .introductionInner").hide();
            $("body").find(".powerChat .introductionContainer p").html("<strong>Salut</strong>");
            _self.checkChatCustomer(window.customerData.data.custconemail, window.customerData.data.customerid, function(resp){
                if ("undefined" != typeof resp && "undefined" != typeof resp["data"]
                && "undefined" != typeof resp["data"]["uuid"]
                && "undefined" != typeof resp["data"]["color"]) {
                    _self.safeSetItem("pwrchatclientuuid", _self.sanitize(resp["data"]["uuid"]));
                    _self.safeSetItem("pwrchatclientcolor", _self.sanitize(resp["data"]["color"]));
                    _self.pwrChatClientUUID = _self.sanitize(_self.sanitize(resp["data"]["uuid"]));
                    _self.windowUUID = _self.uuid();
                    if (!!_self.safeGetItem("pwrchatcnm")) {
                        _self.pwrChatClientName = _self.safeGetItem("pwrchatcnm");
                    }
                    if (!!_self.safeGetItem("pwrchatcml")) {
                        _self.pwrChatClientEmail = _self.safeGetItem("pwrchatcml");
                    }
                    if (!!_self.safeGetItem("pwrchatclientcolor") && _self.safeGetItem("pwrchatclientcolor").indexOf("#") > -1 && _self.safeGetItem("pwrchatclientcolor").toString().trim().length == 7) {
                        _self.pwrChatClientColor = _self.safeGetItem("pwrchatclientcolor");
                    }

                    if ("function" == typeof callback) {
                        callback();
                    }
                }
            });
        } else {
            _self.windowUUID = _self.uuid();
            if (!!!_self.safeGetItem("pwrchatclientuuid")) {
                _self.safeSetItem("pwrchatclientuuid", _self.uuid());
            }

            if (!!_self.getUrlParameter("chatuuid")) {
                _self.safeSetItem("pwrchatclientuuid", _self.getUrlParameter("chatuuid"));
                _self.deleteUrlParameter("chatuuid");
            }
            if (!!_self.getUrlParameter("openchat")) {
                _self.deleteUrlParameter("openchat");
                $("body").find(".btnShowPowerChatFob")[0].click();
            }
            _self.pwrChatClientUUID = _self.sanitize(_self.safeGetItem("pwrchatclientuuid"));

            if (!!_self.safeGetItem("pwrchatcnm")) {
                _self.pwrChatClientName = _self.safeGetItem("pwrchatcnm");
            }
            if (!!_self.safeGetItem("pwrchatcml")) {
                _self.pwrChatClientEmail = _self.safeGetItem("pwrchatcml");
            }
            if (!!_self.safeGetItem("pwrchatclientcolor") && _self.safeGetItem("pwrchatclientcolor").indexOf("#") > -1 && _self.safeGetItem("pwrchatclientcolor").toString().trim().length == 7) {
                _self.pwrChatClientColor = _self.safeGetItem("pwrchatclientcolor");
            }

            if ("function" == typeof callback) {
                callback();
            }
        }


    };

    _self.checkClientUUID = function(callback){
        // console.log("Checking uuid");
        $.ajax({
            url: _self.apiUrl + "/",
            data: {
                method: "checkclientuuid",
                data: btoa(encodeURIComponent(JSON.stringify({
                    "clientuuid": _self.pwrChatClientUUID,
                })))
            },
            success: function (response) {
                if ("undefined" != typeof response) {
                    if ("string" == typeof response && _self.isJson(response)) {
                        response = JSON.parse(response);
                    }
                    if ("function" == typeof callback) {
                        callback(response);
                    }
                }
            },
            error: function (a, b, c) {

            },
            complete: function () {

            }
        });
    };

    _self.initConversation = function(callback){
        _self.setupClient(function(){
            _self.checkClientUUID(function(resp){
                console.log("resp", resp);
                if (!!resp && "undefined" != typeof resp["status"] && true == resp["status"]) {
                    // console.log("Conversation started already");
                    // conversation started already, get messages
                    if ("undefined" != typeof resp["data"] && "undefined" != typeof resp["data"]["clientname"] && !!resp["data"]["clientname"] && "string" == typeof resp["data"]["clientname"] && _self.isBase64(resp["data"]["clientname"])) {
                        _self.safeSetItem("pwrchatcnm", resp["data"]["clientname"]);
                        _self.pwrChatClientName = _self.safeGetItem("pwrchatcnm");
                        if ("undefined" != typeof resp["data"]["clientemail"] && !!resp["data"]["clientemail"] && "string" == typeof resp["data"]["clientemail"] && _self.isBase64(resp["data"]["clientemail"])) {
                            _self.safeSetItem("pwrchatcml", resp["data"]["clientemail"]);
                            _self.pwrChatClientEmail = _self.safeGetItem("pwrchatcml");
                        }
                        if ("undefined" != typeof resp["data"]["color"] && resp["data"]["color"].toString().indexOf("#") > -1) {
                            _self.safeSetItem("pwrchatclientcolor", _self.sanitize(resp["data"]["color"]));
                            _self.pwrChatClientColor = _self.sanitize(resp["data"]["color"]);
                        }
                        _self.getConversationMessages(_self.pwrChatClientUUID, function(resp){
                            _self.renderConversationMessages(resp, function(){
                                _self.initWebsocketServer(function(){
                                    if ("function" == typeof callback){
                                        callback();
                                    }
                                });
                            });
                        });
                    } else {
                        _self.showIntroduction();
                    }

                } else {
                    console.log("New conversation");
                    // _self.defaultMessage(callback);
                    _self.showIntroduction();
                }
            });
        });
    };

    _self.showIntroduction = function(callback){
        $("body").find(".powerChat .introductionWrapper").find(".introductionName").val("");
        $("body").find(".powerChat .introductionWrapper").addClass("show");
    };

    _self.defaultMessage = function(callback){
        // console.log("Welcoming new client");
        _self.getTime(function(resp){
            _self.renderMessage("Hello", "PowerChat", "Operator", resp["datestr"], null);
        });
        _self.waiters.defaultMessage2Timeout = setTimeout(function(){
            _self.getTime(function(resp){
                _self.renderMessage("How Can I help you?", "PowerChat", "Operator", resp["datestr"], null);
                if ("function" == typeof callback) {
                    callback();
                }
            });
        },2000);
    };

    _self.renderChatNotice = function(message, time){
        var $conversationWrapper = $("body").find(".powerChat .chatConversationWrapper"),
            $noticeHtml = "<div class='conversationNotice'>"+_self.sanitize(message)+"</div>";
        $conversationWrapper.append($noticeHtml);
        if ("undefined" != typeof _self.waiters.scrollConversationToBottomTimeout) {
            clearTimeout(_self.waiters.scrollConversationToBottomTimeout);
        }
        _self.waiters.scrollConversationToBottomTimeout = setTimeout(function(){
            _self.scrollConversationToBottom();
        },100);
    };

    _self.renderMessage = function(message, author, mClassType, time, files, seen){
        var hasUrl = false,
            urlPreviewUuid = "url_"+_self.uuid(),
            messageUuid = _self.uuid();

        if ("undefined" == typeof seen) {
            var seen = 0;
        }
        var $conversationWrapper = $("body").find(".powerChat .chatConversationWrapper"),
            $messageHtml = "<div data-messageuuid='"+_self.sanitize(messageUuid)+"' class='message message"+_self.sanitize(mClassType.toString())+" table'>";
                if ("Operator" == mClassType) {
                    $messageHtml += "<div class='messageAuthor td'>";
                        $messageHtml += "<div class='messageAuthorAvatarWrapper'>";
                            $messageHtml += "<img src='"+_self.sanitize(_self.operatorAvatarUrl)+"' class='messageAuthorAvatar' />";
                        $messageHtml += "</div>";
                        $messageHtml += "<div class='messageAuthorName'>"+_self.sanitize(author)+"</div>";
                    $messageHtml += "</div>";
                    $conversationWrapper.find(".typingEventMessage").remove();
                }
                $messageHtml += "<div class='messageContent td'>";
                $messageHtml += "<div class='messageContentInner'>";
                if ("undefined" != typeof message && "string" == typeof message && message.toString().trim().length > 0) {
                    $messageHtml += "<div class='messageContentText'>";
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
                                    $messageHtml += "<div class='messageImgItem' data-imgsrc='"+_self.sanitize(_self.apiUrl+"/filedata31424tngb48bfg4f/"+_self.sanitize(_self.pwrChatClientUUID)+"/original/"+_self.sanitize(file))+"'><img src='"+_self.sanitize(_self.apiUrl+"/filedata31424tngb48bfg4f/"+_self.sanitize(_self.pwrChatClientUUID)+"/optimized/"+_self.sanitize(file))+"' /></div>";
                                    break;
                                case "mp4":
                                case "m4v":
                                    $messageHtml += "<div class='messageVideoItem' data-videosrc='"+_self.sanitize(_self.apiUrl+"/filedata31424tngb48bfg4f/"+_self.sanitize(_self.pwrChatClientUUID)+"/original/"+_self.sanitize(file))+"'><i class='fas fa-play'></i></div>";
                                    break;
                            }

                        });
                        $messageHtml += "</div>";
                    }

                }
                $messageHtml += "<div class='messageContentDate'>"+_self.sanitize(time).replace("T", " ")+(("Client" == mClassType) ? "<span class='messageSeenStatus' data-seen='"+seen+"'><i class='fas fa-check-double'></i></span>" : "")+"</div>";
                $messageHtml += "</div>";
                $messageHtml += "</div>";
            $messageHtml += "</div>";

        $conversationWrapper.append($messageHtml);

        if (true == _self.focused && $("body").find(".powerChat").hasClass("show")) {
            if ("undefined" != typeof _self.waiters.markAsSeenTimeout) {
                clearTimeout(_self.waiters.markAsSeenTimeout);
            }
            _self.waiters.markAsSeenTimeout = setTimeout(function(){
                _self.markAsSeen();
            });
        }
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
        if ("undefined" != typeof _self.waiters.checkForOnlineOperatorsTimeout) {
            clearTimeout(_self.waiters.checkForOnlineOperatorsTimeout);
        }
        _self.waiters.checkForOnlineOperatorsTimeout = setTimeout(function(){
            _self.getOnlineOperators(function(respOperatorsStatus){
                _self.handleOnlineOperatorsStatus(respOperatorsStatus);
            });
        },500);
    };

    _self.renderTypingEvent = function(author){
        var $conversationWrapper = $("body").find(".powerChat .chatConversationWrapper"),
            $messageHtml = "<div class='message messageOperator typingEventMessage table'>";
                $messageHtml += "<div class='messageAuthor td'>";
                    $messageHtml += "<div class='messageAuthorAvatarWrapper'>";
                        $messageHtml += "<img src='"+_self.sanitize(_self.operatorAvatarUrl)+"' class='messageAuthorAvatar' />";
                    $messageHtml += "</div>";
                    $messageHtml += "<div class='messageAuthorName'>"+_self.sanitize(author)+"</div>";
                $messageHtml += "</div>";
                $messageHtml += "<div class='messageContent td'>";
                    $messageHtml += "<div class='messageContentInner'>";
                        $messageHtml += "<div class='messageContentText'> <div class='dotTyping dotTyping1'></div> <div class='dotTyping dotTyping2'></div> <div class='dotTyping dotTyping3'></div> </div>";
                    $messageHtml += "</div>";
                $messageHtml += "</div>";
            $messageHtml += "</div>";

        if ($conversationWrapper.find(".typingEventMessage").length == 0) {
            $conversationWrapper.append($messageHtml);
            if ("undefined" != typeof _self.waiters.scrollConversationToBottomTimeout) {
                clearTimeout(_self.waiters.scrollConversationToBottomTimeout);
            }
            _self.waiters.scrollConversationToBottomTimeout = setTimeout(function(){
                _self.scrollConversationToBottom();
            },100);
        }

        if ("undefined" != typeof _self.waiters.removeTypingEventTimeout) {
            clearTimeout(_self.waiters.removeTypingEventTimeout);
        }
        _self.waiters.removeTypingEventTimeout = setTimeout(function(){
            $conversationWrapper.find(".typingEventMessage").remove();
        },2000);
    };

    _self.renderSeenEvent = function(uuid, callback){
        if ("undefined" != typeof uuid && uuid == _self.pwrChatClientUUID) {
            $("body").find(".powerChat .messageSeenStatus").attr("data-seen", '1');
        }
        if ("function" == typeof callback) {
            callback();
        }
    };

    _self.scrollConversationToBottom = function(callback){
        var $conversationWrapper = $("body").find(".powerChat .chatConversationWrapper");
        $conversationWrapper.stop().animate({
            scrollTop: $conversationWrapper[0].scrollHeight - $conversationWrapper[0].clientHeight
        },1);
        if ("function" == typeof callback) {
            callback();
        }
    };

    _self.getConversationMessages = function(uuid, callback){
        if ("undefined" != typeof uuid) {
            $.ajax({
                url: _self.apiUrl + "/",
                data: {
                    method: "getconversationmessages",
                    data: btoa(encodeURIComponent(uuid))
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
        $("body").find(".powerChat .powerChatConversationMessagesInner").empty();
        if ("undefined" != typeof data && "undefined" != typeof data["data"] && Array.isArray(data["data"]) && data["data"].length > 0) {
            var newMessages = 0;
            data["data"].forEach(function(messageObj, i){
                var mClassType = ("Client" == messageObj["author"]) ? "Client" : "Operator",
                    time = new Date(parseFloat(messageObj["created"])).toLocaleString("ro-RO");
                if ("undefined" != typeof messageObj["seen"] && messageObj["seen"] == 0 && "undefined" != typeof messageObj["author"] && "Client" != messageObj["author"]) {
                    newMessages++;
                }
                _self.renderMessage(messageObj["message"], messageObj["author"], mClassType, time, ("undefined" != typeof messageObj["files"]) ? messageObj["files"] : "", (("undefined" != typeof messageObj["seen"]) ? messageObj["seen"] : 0));
            });

            console.log("newMessages", newMessages, data);
            if (newMessages > 0) {
                if ($("body").find(".btnShowPowerChatFob").length > 0) {
                    if ($("body").find(".btnShowPowerChatFob .newMessagesCounter").length == 0) {
                        $("body").find(".btnShowPowerChatFob").append("<span class='newMessagesCounter' data-newmessages='"+_self.sanitize(newMessages)+"'>"+_self.sanitize(newMessages)+"</span>");
                    } else {
                        $("body").find(".btnShowPowerChatFob .newMessagesCounter").attr("data-newmessages", _self.sanitize(newMessages));
                        $("body").find(".btnShowPowerChatFob .newMessagesCounter").text(_self.sanitize(newMessages));
                    }
                }
            }

            if ("undefined" != typeof _self.waiters.scrollConversationToBottomTimeout) {
                clearTimeout(_self.waiters.scrollConversationToBottomTimeout);
            }
            _self.waiters.scrollConversationToBottomTimeout = setTimeout(function(){
                _self.scrollConversationToBottom();
            },100);
        }
        if ("undefined" != typeof _self.waiters.checkForOnlineOperatorsTimeout) {
            clearTimeout(_self.waiters.checkForOnlineOperatorsTimeout);
        }
        _self.waiters.checkForOnlineOperatorsTimeout = setTimeout(function(){
            _self.getOnlineOperators(function(respOperatorsStatus){
                _self.handleOnlineOperatorsStatus(respOperatorsStatus);
            });
        },500);

        if ("function" == typeof callback) {
            callback();
        }
    };

    _self.getOnlineOperators = function(callback){
        $.ajax({
            url: _self.apiUrl + "/",
            data: {
                method: "getonlineoperators"
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

    _self.handleOnlineOperatorsStatus = function(data, callback){
        var onlineOperators = false;
        if ("undefined" != typeof data && "undefined" != typeof data["status"] && true == data["status"] && "undefined" != typeof data["data"] && !isNaN(data["data"]) && parseInt(data["data"],10) > 0) {
            // has online operators
            onlineOperators = true;
            if ($("body").find(".powerChat .chatBodyInner .operatorsOnlineMessageWrapper").length == 0) {
                // none
            } else {
                $("body").find(".powerChat .chatBodyInner .operatorsOnlineMessageWrapper").removeClass("noOperators").text("");
            }
            $("body").find(".powerChat .chatConversationWrapper").removeClass("noOperators");
        } else {
            // no operators are online
            if ($("body").find(".powerChat .chatBodyInner .operatorsOnlineMessageWrapper").length == 0) {
                $("body").find(".powerChat .chatBodyInner").prepend("<div class='operatorsOnlineMessageWrapper noOperators'>"+_self.sanitize("Right now, none of our operators are online, please write a message and we will get back to you here and on your email as soon as possible.")+"</div>");
            } else {
                $("body").find(".powerChat .chatBodyInner .operatorsOnlineMessageWrapper").addClass("noOperators").text(_self.sanitize("Right now, none of our operators are online, please write a message and we will get back to you here and on your email as soon as possible."));
            }
            $("body").find(".powerChat .chatConversationWrapper").addClass("noOperators");
        }

        if ("function" == typeof callback){
            callback(onlineOperators);
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
                "uuid": _self.pwrChatClientUUID
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
                                    if (
                                        "undefined" != typeof file["errors"]
                                        && "undefined" != typeof file["originalname"]
                                        && "undefined" != typeof file["storedname"]
                                        && "undefined" != typeof file["success"]
                                    ) {
                                        if ($("body").find($imgPreviewWrapper).find(".fileItem[data-filename='" + file["originalname"] + "']").length) {
                                            $("body").find($imgPreviewWrapper).find(".fileItem[data-filename='" + file["originalname"] + "']").each(function () {
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
        var $filesHtml = "<a href='javascript:void(0);' class='btnSelectAddMoreFiles'><i class='fas fa-plus-circle'></i></a>",
            i = 0;
        if ($("body").find(".powerChat .uploadedFilesInner .fileLargePreviewWrapper").length > 0) {
            $("body").find(".powerChat .uploadedFilesInner .fileLargePreviewWrapper").remove();
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
                $filesHtml += "<div class='fileItem"+((!error) ? "" : " uploadError")+"' data-filename='"+_self.sanitize(btoa(encodeURIComponent(fileObject.name)))+"'>";
                $filesHtml += "<div class='preview'>";

                if ("image" == fileType) {
                    $filesHtml += "<img src='"+URL.createObjectURL(fileObject)+"' />";
                } else if ("video" == fileType) {
                    $filesHtml += "<video src='"+URL.createObjectURL(fileObject)+"'></video>"
                }

                $filesHtml += "</div>";
                $filesHtml += "<div class='details'>";
                // $filesHtml += "<div class='fileName'>"+_self.sanitize(originalFileName)+"</div>";
                $filesHtml += "<div class='progressBar'></div>";
                $filesHtml += "</div>";
                $filesHtml += "<div class='actions'>";
                $filesHtml += "<a href='javascript:void(0);' class='deleteFileBtn' data-storedname='"+_self.sanitize(btoa(encodeURIComponent(originalFileName)))+"'><i class='fa fa-times'></i></a>";
                $filesHtml += "</div>";
                $filesHtml += "</div>";
            } else {
                // $filesHtml += "<div class='preview'><i class='fas fa-exclamation-triangle'></i></div>";
            }
            i++;
        }

        if (
            "undefined" != typeof $imgPreviewWrapper
            && $("body").find($imgPreviewWrapper).length > 0
        ) {
            $("body").find($imgPreviewWrapper).html($filesHtml).addClass("show");
            $("body").find(".powerChat .addFilesWrapper a.btnSelectNewFiles, .powerChat .newMessageInput, .powerChat .btnSendThisMessage").removeClass("show");
            $("body").find(".powerChat .addFilesWrapper a.btnCancelAddingNewFiles, .chatNewMessageWrapper .btnSendPreloadedFilesWrapper").addClass("show");
        }

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
        var $el = $("body").find('.powerChat #selectfile');
        $el.wrap('<form>').closest('form').get(0).reset();
        $el.unwrap();
        _self.renderPreloadedFiles($imgPreviewWrapper, callback);
    };

    _self.markAsSeen = function(callback){
        if (true == _self.focused && $("body").find(".powerChat").hasClass("show")) {
            console.log("markasseen");
            $.ajax({
                url: _self.apiUrl + "/",
                data: {
                    method: "markasseen",
                    uuid: btoa(encodeURIComponent(_self.pwrChatClientUUID)),
                    clientname: _self.pwrChatClientName,
                    clientemail: _self.pwrChatClientEmail
                },
                success: function (resp) {
                    if ("undefined" != typeof resp) {
                        if ("string" == typeof resp && _self.isJson(resp)) {
                            resp = JSON.parse(resp);
                        }

                        var messageObj = {
                            "comm": "seenEvent",
                            "data": {
                                "attr": "client",
                                "uuid": _self.pwrChatClientUUID,
                                "clientname": _self.pwrChatClientName,
                                "clientemail": _self.pwrChatClientEmail,
                                "windowuuid": _self.windowUUID
                            }
                        };
                        if (true == _self.WebSocketServerIsOnline()) {
                            _self.WebSocketServer.send(btoa(encodeURIComponent(JSON.stringify(messageObj))));
                            if ("function" == typeof callback) {
                                callback(resp);
                            }
                        } else {
                            _self.initWebsocketServer(function () {
                                _self.WebSocketServer.send(btoa(encodeURIComponent(JSON.stringify(messageObj))));
                                if ("function" == typeof callback) {
                                    callback(resp);
                                }
                            });
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

    _self.handleEvents = function(){
        // console.log("Handling events");
        window.onfocus = function() {
            _self.focused = true;
            if (null !== _self.pwrChatClientUUID && null !== _self.pwrChatClientEmail && null !== _self.pwrChatClientName && $("body").find(".powerChat").hasClass("show")) {
                if ("undefined" != typeof _self.waiters.markAsSeenTimeout) {
                    clearTimeout(_self.waiters.markAsSeenTimeout);
                }
                _self.waiters.markAsSeenTimeout = setTimeout(function(){
                    _self.markAsSeen();
                });
            }
        };
        window.onblur = function() {
            _self.focused = false;
        };


        if (window.visualViewport) {
            window.visualViewport.addEventListener('resize', () => {
                const height = window.visualViewport.height;
                // Adjust scroll or reposition elements here
                if (true == _self.isMobile) {
                    $("body").find(".powerChat").attr("style", "height: "+parseInt(height,10)+"px !important");
                    if ($("body").find(".powerChat").hasClass("show")) {
                        _self.adjustChatScrollArea();
                        $("html, body").attr("style", "height: "+parseInt(height,10)+"px !important");
                        window.scrollTo(0, 0);
                    } else {
                        $("html, body").removeAttr("style");
                    }
                }
            });
        }

        $("body").on("keydown", ".chatNewMessageWrapper textarea.newMessageInput", function(e){
            var $inp = $(this),
                $parent = $("body").find(".powerChat .chatNewMessageWrapper .inputWrapper"),
                inpVal = $inp.val().toString().trim(),
                emptyText = inpVal.replace(/(?:(?:\r\n|\r|\n)\s*){2}/gm, "");
            if((e.keyCode || e.which) == 13) { //Enter keycode
                $parent.empty();
                if ("undefined" != typeof _self.waiters.showTextareaTimeout) {
                    clearTimeout(_self.waiters.showTextareaTimeout);
                }
                if (emptyText != "") {
                    _self.sendMessage(_self.sanitize(emptyText), null, function(resp){
                        _self.renderMessage(_self.sanitize(emptyText), "", "Client", resp["datestr"], null);
                        _self.waiters.showTextareaTimeout = setTimeout(function(){
                            $parent.html('<textarea class="newMessageInput show" placeholder="Write your message here" rows="1" value="" data-msg="'+_self.sanitize(new Date().getTime())+'"></textarea><a href="javascript:void(0);" class="btnSendThisMessage show"><i class="fas fa-paper-plane"></i></a>');
                            $parent.find(".newMessageInput").focus();
                        },10);
                    });
                } else {
                    _self.waiters.showTextareaTimeout = setTimeout(function(){
                        $parent.html('<textarea class="newMessageInput show" placeholder="Write your message here" rows="1" value="" data-msg="'+_self.sanitize(new Date().getTime())+'"></textarea><a href="javascript:void(0);" class="btnSendThisMessage show"><i class="fas fa-paper-plane"></i></a>');
                        $parent.find(".newMessageInput").focus();
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

        $("body").on("input blur", "input.introductionFirstName", function(){
            var $inp = $(this),
                $wrapper = $inp.closest(".fieldWrapper"),
                inpVal = $inp.val().toString();

            inpVal = _self.capitalizeLetters(inpVal);

            $inp.val(inpVal);

            if (!_self.nameValid(inpVal)) {
                $wrapper.find(".error").text("Doar litere, fara cifre si simboluri").addClass("show");
            } else {
                $wrapper.find(".error").removeClass("show");
            }
        });

        $("body").on("input blur", "input.introductionLastName", function(){
            var $inp = $(this),
                $wrapper = $inp.closest(".fieldWrapper"),
                inpVal = $inp.val().toString();

            inpVal = _self.capitalizeLetters(inpVal);

            $inp.val(inpVal);

            if (!_self.nameValid(inpVal)) {
                $wrapper.find(".error").text("Doar litere, fara cifre si simboluri").addClass("show");
            } else {
                $wrapper.find(".error").removeClass("show");
            }
        });

        $("body").on("input", ".introductionEmail", function(){
            var $inp = $(this),
                $wrapper = $inp.closest(".fieldWrapper"),
                inpVal = $inp.val().toString();

            inpVal = inpVal.toLowerCase();

            $inp.val(inpVal);
        });

        $("body").on("blur", "input.introductionEmail", function(){
            var $inp = $(this),
                $wrapper = $inp.closest(".fieldWrapper"),
                inpVal = $inp.val().toString().toLowerCase().trim();

            $inp.val(inpVal);

            if (!_self.emailValid(inpVal)) {
                $wrapper.find(".error").text("Email invalid").addClass("show");
            } else {
                $wrapper.find(".error").removeClass("show");
            }
        });

        $("body").on("click", ".btnIntroductionStartConversation", function(e){
            e.preventDefault();
            var $btn = $(this),

                $wrapper = $btn.closest(".introductionWrapper"),
                $agreeInp = $wrapper.find("#agreegdprchat"),
                $wrapperTos = $agreeInp.closest(".fieldWrapper"),
                agree = $agreeInp.is(":checked") ? true : false,
                $inputFirstName = $wrapper.find("input.introductionFirstName"),
                $wrapperFirstName = $inputFirstName.closest(".fieldWrapper"),
                firstName = $inputFirstName.val().toString().trim(),
                $inputLastName = $wrapper.find("input.introductionLastName"),
                $wrapperLastName = $inputLastName.closest(".fieldWrapper"),
                lastName = $inputLastName.val().toString().trim(),
                $inputEmail = $wrapper.find("input.introductionEmail"),
                $wrapperEmail = $inputEmail.closest(".fieldWrapper"),
                email = $inputEmail.val().toString().trim(),
                valid = true;

            if (false == agree) {
                valid = false;
                _self.msg("Trebuie sa fiti de acord cu Termenii si Conditiile");
                $wrapperTos.find(".error").text("Necesar").addClass("show")
            }
            if (null == firstName || firstName.toString().trim().length == 0 || !_self.nameValid(firstName)) {
                valid = false;
                $wrapperFirstName.find(".error").text("Necesar").addClass("show");
            }
            if (null == lastName || lastName.toString().trim().length == 0 || !_self.nameValid(lastName)) {
                valid = false;
                $wrapperLastName.find(".error").text("Necesar").addClass("show");
            }
            if (null == email || email.toString().trim().length == 0 || !_self.emailValid(email)) {
                valid = false;
                $wrapperEmail.find(".error").text("Necesar").addClass("show");
            }

            if (valid == true){
                $wrapper.find(".error").removeClass("show");
                if (!!!_self.safeGetItem("pwrchatcnm")) {
                    _self.safeSetItem("pwrchatcnm", btoa(encodeURIComponent([firstName, lastName].join(" ").trim())));
                }
                if (!!!_self.safeGetItem("pwrchatcml")) {
                    _self.safeSetItem("pwrchatcml", btoa(encodeURIComponent(email)));
                }
                if (!!!_self.safeGetItem("pwrchatclientcolor")) {
                    _self.safeSetItem("pwrchatclientcolor", _self.sanitize(_self.getRandomColor()));
                }
                _self.pwrChatClientName = _self.safeGetItem("pwrchatcnm");
                _self.pwrChatClientEmail = _self.safeGetItem("pwrchatcml");
                _self.pwrChatClientColor = _self.safeGetItem("pwrchatclientcolor");
                _self.initWebsocketServer(function(){
                    $("body").find(".powerChat .introductionWrapper").removeClass("show");
                });
            } else {

            }
        });

        $("body").on("click", ".btnSelectNewFiles, .btnSelectAddMoreFiles", function(e){
            e.preventDefault();
            $("body").find(".powerChat #selectfile")[0].click();
        });
        $("body").on("click", "#selectfile", function(e){
            var $inp = $(this),
                $parent = $("body").find(".powerChat .newMessageInput").parent();
            $parent.empty();
            if ("undefined" != typeof _self.waiters.showTextareaTimeout){
                clearTimeout(_self.waiters.showTextareaTimeout);
            }
            _self.waiters.showTextareaTimeout = setTimeout(function(){
                console.log("showing textarea again");
                $parent.html('<textarea class="newMessageInput show" placeholder="Write your message here" rows="1" value="" spellcheck="false"></textarea><a href="javascript:void(0);" class="btnSendThisMessage show"><i class="fas fa-paper-plane"></i></a>');
            },10);
        });

        $("body").on("change", "#selectfile", function(e){
            var $inp = $(this);
            files = $inp[0].files;
            _self.filesPreload(files, ".addFilesWrapper .uploadedFilesThumbnailsInner");
        });
        $("body").on("click", ".btnCancelAddingNewFiles", function(e){
           e.preventDefault();
           var $btn = $(this);
            _self.removeAllPreloadedFiles(".powerChat .addFilesWrapper .uploadedFilesThumbnailsInner", function(){
                $("body").find(".powerChat .addFilesWrapper .uploadedFilesThumbnailsInner, .powerChat .chatNewMessageWrapper .btnSendPreloadedFilesWrapper, .powerChat .btnCancelAddingNewFiles").removeClass("show");
                $("body").find(".powerChat .chatNewMessageWrapper .addFilesWrapper a.btnSelectNewFiles, .powerChat .newMessageInput, .powerChat .btnSendThisMessage").addClass("show");
            });
        });

        $("body").on("click", ".btnSendPreloadedFiles", function(e){
            e.preventDefault();
            var $btn = $(this),
                $chatFooter = $("body").find(".powerChat .chatFooter"),
                $imgPreviewWrapper = ".powerChat .chatNewMessageWrapper .addFilesWrapper .uploadedFilesThumbnailsInner",
                filesNames = [],
                $inp = $("body").find(".powerChat .newMessageInput"),
                $parent = $inp.closest(".inputWrapper"),
                inpVal = $inp.val().toString().trim(),
                emptyText = inpVal.replace(/(?:(?:\r\n|\r|\n)\s*){2}/gm, "");
            $($imgPreviewWrapper).addClass("uploading");
            $chatFooter.addClass("uploading");
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
                    _self.sendMessage(_self.sanitize(emptyText), filesNames, function(resp2){
                        _self.renderMessage(_self.sanitize(emptyText), "", "Client", resp["datestr"], btoa(encodeURIComponent(JSON.stringify(filesNames))));
                        if ("undefined" != typeof _self.waiters.showTextareaTimeout) {
                            clearTimeout(_self.waiters.showTextareaTimeout);
                        }
                        $parent.empty();
                        _self.waiters.showTextareaTimeout = setTimeout(function(){
                            $parent.html('<textarea class="newMessageInput show" placeholder="Write your message here" rows="1" value="" data-msg="'+_self.sanitize(new Date().getTime())+'"></textarea><a href="javascript:void(0);" class="btnSendThisMessage show"><i class="fas fa-paper-plane"></i></a>');
                            $parent.find(".newMessageInput").focus();
                            _self.removeAllPreloadedFiles(".powerChat .addFilesWrapper .uploadedFilesThumbnailsInner", function(){
                                $("body").find(".powerChat .addFilesWrapper .uploadedFilesThumbnailsInner, .powerChat .chatNewMessageWrapper .btnSendPreloadedFilesWrapper, .powerChat .chatNewMessageWrapper .addFilesWrapper a.btnCancelAddingNewFiles").removeClass("show");
                                $("body").find(".powerChat .chatNewMessageWrapper .addFilesWrapper a.btnSelectNewFiles, .powerChat .newMessageInput, .powerChat .btnSendThisMessage").addClass("show");
                                $($imgPreviewWrapper).removeClass("uploading");
                                $chatFooter.removeClass("uploading");
                            });
                        },10);
                    });
                }
            });
        });

        $("body").on("click", ".uploadedFilesThumbnailsInner .fileItem .actions a.deleteFileBtn[data-storedname]", function(e){
            e.preventDefault();
            var $btn = $(this),
                storedname = $btn.attr("data-storedname");
            _self.removePreloadedFile(storedname, ".addFilesWrapper .uploadedFilesThumbnailsInner");
        });

        $("body").on("click focus input", ".newMessageInput", function(e){
            var $inp = $(this),
                inpVal = $inp.val();

            $inp.val(inpVal);

            if ("undefined" != typeof _self.waiters.markAsSeenTimeout) {
                clearTimeout(_self.waiters.markAsSeenTimeout);
            }
            _self.waiters.markAsSeenTimeout = setTimeout(function () {
                _self.markAsSeen();
            });
            if ("undefined" != typeof _self.waiters.scrollConversationToBottomTimeout) {
                clearTimeout(_self.waiters.scrollConversationToBottomTimeout);
            }
            _self.waiters.scrollConversationToBottomTimeout = setTimeout(function(){
                _self.scrollConversationToBottom();
            },100);
        });

        $("body").on("click", ".messageImgItem[data-imgsrc], .messageVideoItem[data-videosrc]", function(e){
            e.preventDefault();
            var $mediaItem = $(this),
                $messageWrapper = $mediaItem.closest(".message")
                mediaType = ("undefined" != typeof $mediaItem.attr("data-imgsrc")) ? "image" : "video",
                mediaSrc = ("undefined" != typeof $mediaItem.attr("data-imgsrc")) ? $mediaItem.attr("data-imgsrc") : $mediaItem.attr("data-videosrc"),
                mediaOptimizedSrc = ("undefined" != typeof $mediaItem.attr("data-imgsrc")) ? $mediaItem.find("img").attr("src") : "",
                $mediaItems = $messageWrapper.find(".messageImgItem[data-imgsrc], .messageVideoItem[data-videosrc]");

            if ($("body").find(".powerChatMediaPopup").length == 0) {
                var $popupHtml = "<div class='powerChatMediaPopup show'>";
                        $popupHtml += "<div class='powerChatMediaPopupHeader'>";
                            $popupHtml += "<a href='javascript:void(0);' class='btnClosePowerChatMediaPopup'><i class='fa fa-times'></i></a>";
                        $popupHtml += "</div>";
                        $popupHtml += "<div class='powerChatMediaPopupBody'>";
                        if ("image" == mediaType) {
                            $popupHtml += "<img src='"+_self.sanitize(mediaSrc)+"' />";
                        } else if ("video" == mediaType) {
                            $popupHtml += "<video controls src='"+_self.sanitize(mediaSrc)+"'></video>";
                        }
                        $popupHtml += "</div>";
                        $popupHtml += "<div class='powerChatMediaPopupThumbnails'>";
                        $mediaItems.each(function(){
                            var $mediaItem2 = $(this),
                                mediaType2 = ("undefined" != typeof $mediaItem2.attr("data-imgsrc")) ? "image" : "video",
                                mediaSrc2 = ("undefined" != typeof $mediaItem2.attr("data-imgsrc")) ? $mediaItem2.attr("data-imgsrc") : $mediaItem2.attr("data-videosrc"),
                                mediaOptimizedSrc2 = ("undefined" != typeof $mediaItem2.attr("data-imgsrc")) ? $mediaItem2.find("img").attr("src") : "";

                            if ("image" == mediaType2) {
                                $popupHtml += "<a href='javascript:void(0);' class='powerChatPopupThumbnailItem"+((_self.sanitize(mediaSrc2) == _self.sanitize(mediaSrc)) ? " active": "")+"' data-imgsrc='"+_self.sanitize(mediaSrc2)+"'>";
                                    $popupHtml += "<img src='"+_self.sanitize(mediaOptimizedSrc2)+"' />";
                                $popupHtml += "</a>";
                            } else if ("video" == mediaType2) {
                                $popupHtml += "<a href='javascript:void(0);' class='powerChatPopupThumbnailItem"+((_self.sanitize(mediaSrc2) == _self.sanitize(mediaSrc)) ? " active": "")+"' data-videosrc='"+_self.sanitize(mediaSrc2)+"'>";
                                    $popupHtml += "<i class='fas fa-play' />";
                                $popupHtml += "</a>";
                            }
                        });
                        $popupHtml += "</div>";
                    $popupHtml += "</div>";

                $("body").append($popupHtml);
            } else {
                var $popupThumbnailsHtml = "";
                $("body").find(".powerChatMediaPopup .powerChatMediaPopupBody").empty();
                if ("image" == mediaType) {
                    $("body").find(".powerChatMediaPopup .powerChatMediaPopupBody").append("<img src='"+_self.sanitize(mediaSrc)+"' />");
                } else if ("video" == mediaType) {
                    $("body").find(".powerChatMediaPopup .powerChatMediaPopupBody").append("<video controls src='"+_self.sanitize(mediaSrc)+"'></video>");
                }

                $mediaItems.each(function(){
                    var $mediaItem2 = $(this),
                        mediaType2 = ("undefined" != typeof $mediaItem2.attr("data-imgsrc")) ? "image" : "video",
                        mediaSrc2 = ("undefined" != typeof $mediaItem2.attr("data-imgsrc")) ? _self.sanitize($mediaItem2.attr("data-imgsrc")) : _self.sanitize($mediaItem2.attr("data-videosrc")),
                        mediaOptimizedSrc2 = ("undefined" != typeof $mediaItem2.attr("data-imgsrc")) ? _self.sanitize($mediaItem2.find("img").attr("src")) : "";

                    if ("image" == mediaType2) {
                        $popupThumbnailsHtml += "<a href='javascript:void(0);' class='powerChatPopupThumbnailItem"+((_self.sanitize(mediaSrc2) == _self.sanitize(mediaSrc)) ? " active": "")+"' data-imgsrc='"+_self.sanitize(mediaSrc2)+"'>";
                            $popupThumbnailsHtml += "<img src='"+_self.sanitize(mediaOptimizedSrc2)+"' />";
                        $popupThumbnailsHtml += "</a>";
                    } else if ("video" == mediaType2) {
                        $popupThumbnailsHtml += "<a href='javascript:void(0);' class='powerChatPopupThumbnailItem"+((_self.sanitize(mediaSrc2) == _self.sanitize(mediaSrc)) ? " active": "")+"' data-videosrc='"+_self.sanitize(mediaSrc2)+"'>";
                            $popupThumbnailsHtml += "<i class='fas fa-play' />";
                        $popupThumbnailsHtml += "</a>";
                    }
                });
                $("body").find(".powerChatMediaPopup .powerChatMediaPopupThumbnails").html($popupThumbnailsHtml);

                $("body").find(".powerChatMediaPopup").addClass("show");
            }
        });

        $("body").on("click", ".btnClosePowerChatMediaPopup", function(e){
            e.preventDefault();
            $("body").find(".powerChatMediaPopup").removeClass("show");
            $("body").find(".powerChatMediaPopup .powerChatMediaPopupBody, .powerChatMediaPopup .powerChatMediaPopupThumbnails").empty();
        });

        $("body").on("click", ".powerChatMediaPopup .powerChatPopupThumbnailItem[data-imgsrc], .powerChatMediaPopup .powerChatPopupThumbnailItem[data-videosrc]", function(e){
            e.preventDefault();
            var $mediaItem = $(this),
                $popup = $mediaItem.closest(".powerChatMediaPopup"),
                mediaType = ("undefined" != typeof $mediaItem.attr("data-imgsrc")) ? "image" : "video",
                mediaSrc = ("undefined" != typeof $mediaItem.attr("data-imgsrc")) ? $mediaItem.attr("data-imgsrc") : $mediaItem.attr("data-videosrc"),
                $mediaItems = $popup.find(".powerChatPopupThumbnailItem[data-imgsrc], .powerChatPopupThumbnailItem[data-videosrc]");

            if ("image" == mediaType) {
                $popup.find(".powerChatMediaPopupBody").html("<img src='"+_self.sanitize(mediaSrc)+"' />");
            } else if ("video" == mediaType) {
                $popup.find(".powerChatMediaPopupBody").html("<video controls src='"+_self.sanitize(mediaSrc)+"'></video>");
            }
            $mediaItems.not($mediaItem).removeClass("active");
            $mediaItem.addClass("active");
        });

        $("body").on("click", ".btnShowPowerChatFob", function(e){
            e.preventDefault();
            console.log("opening powerchat");
            var $btn = $(this),
                $powerChat = $("body").find(".powerChat");
            $powerChat.addClass("show");
            if (true == _self.isMobile && !$("body").hasClass("powerChatOpen")) {
                const height = window.visualViewport.height;
                const scrollY = document.body.style.top;
                $("html, body").addClass("powerChatOpen");
                $("html, body").attr("style", "height: "+parseInt(height,10)+"px !important");
                _self.adjustChatScrollArea();
                window.scrollTo(0, parseInt(scrollY || "0") * -1);
                _self.lockScroll();
                document.addEventListener("touchmove", _self.preventScroll, { passive: false });
            }
            if ($btn.find(".newMessagesCounter").length > 0) {
                $btn.find(".newMessagesCounter").text(0).attr("data-newmessages", "0");
            }
            if ($powerChat.hasClass("show")) {
                if ("undefined" != typeof _self.waiters.markAsSeenTimeout) {
                    clearTimeout(_self.waiters.markAsSeenTimeout);
                }
                _self.waiters.markAsSeenTimeout = setTimeout(function () {
                    _self.markAsSeen();
                });
            }
            if ("undefined" != typeof _self.waiters.checkForOnlineOperatorsTimeout) {
                clearTimeout(_self.waiters.checkForOnlineOperatorsTimeout);
            }
            _self.waiters.checkForOnlineOperatorsTimeout = setTimeout(function(){
                _self.getOnlineOperators(function(respOperatorsStatus){
                    _self.handleOnlineOperatorsStatus(respOperatorsStatus);
                });
            },500);
            if ("undefined" != typeof _self.waiters.scrollConversationToBottomTimeout) {
                clearTimeout(_self.waiters.scrollConversationToBottomTimeout);
            }
            _self.waiters.scrollConversationToBottomTimeout = setTimeout(function(){
                _self.scrollConversationToBottom();
            },100);
        });

        $("body").on("click", ".powerChat .btnToggleChat", function(e){
            e.preventDefault();
            console.log("closing powerchat");
            var $btn = $(this),
                $powerChat = $("body").find(".powerChat");
            $powerChat.removeClass("show");
            if (true == _self.isMobile && $("body").hasClass("powerChatOpen")) {
                $("html, body").removeClass("powerChatOpen");
                $("html, body").removeAttr("style");
                _self.adjustChatScrollArea();
                _self.unlockScroll();
                document.removeEventListener("touchmove", _self.preventScroll);
                if ("undefined" != typeof _self.waiters.scrollConversationToBottomTimeout) {
                    clearTimeout(_self.waiters.scrollConversationToBottomTimeout);
                }
                _self.waiters.scrollConversationToBottomTimeout = setTimeout(function(){
                    _self.scrollConversationToBottom();
                },100);
            }
        });

        $("body").on("touchstart", ".chatConversationWrapper", function(e) {
            _self.startY = e.originalEvent.touches[0].clientY;
        });

        $("body").on("touchmove", ".chatConversationWrapper", function(e) {
            const $this = $(this);
            const scrollTop = $this.scrollTop();
            const scrollHeight = $this[0].scrollHeight;
            const offsetHeight = $this.outerHeight();
            const currentY = e.originalEvent.touches[0].clientY;

            const isScrollingUp = currentY > _self.startY;
            const isScrollingDown = currentY < _self.startY;

            const atTop = scrollTop <= 0;
            const atBottom = scrollTop + offsetHeight >= scrollHeight;

            if ((atTop && isScrollingUp) || (atBottom && isScrollingDown)) {
                e.preventDefault(); // block bubbling to body
            }
        });

        $("body").on("click", ".powerChat .btnSendThisMessage", function(e){
            e.preventDefault();
            var $btn = $(this),
                $texInput = $("body").find(".chatNewMessageWrapper textarea.newMessageInput"),
                $parent = $texInput.parent();

            if ($texInput.length > 0) {
                const enterEvent = new KeyboardEvent("keydown", {
                    key: "Enter",
                    code: "Enter",
                    keyCode: 13,
                    which: 13,
                    bubbles: true,
                    cancelable: true
                });

                $texInput[0].dispatchEvent(enterEvent);

                if ("undefined" != typeof _self.waiters.showTextareaTimeout) {
                    clearTimeout(_self.waiters.showTextareaTimeout);
                }
                _self.waiters.showTextareaTimeout = setTimeout(function(){
                    $parent.empty();
                    $parent.html('<textarea class="newMessageInput show" placeholder="Write your message here" rows="1" value="" data-msg="'+_self.sanitize(new Date().getTime())+'"></textarea><a href="javascript:void(0);" class="btnSendThisMessage show"><i class="fas fa-paper-plane"></i></a>');
                    $parent.find(".newMessageInput").focus();
                },100);
            }
        });
    };

    _self.init = function(){
        // change mobile,desktop detection method
        if ($("head").find("script[src*='desktop.interface.js']").length > 0) {
            _self.isDesktop = true;
            _self.isMobile = false;
        } else if ($("head").find("script[src*='mobile.interface.js']").length > 0) {
            _self.isDesktop = false;
            _self.isMobile = true;
        }
        if (true == _self.isMobile) {
            // _self.msg("Is mobile");
        } else if (true == _self.isDesktop) {
            // _self.msg("Is desktop");
        }
        _self.handleEvents();
        _self.initConversation(function(){

        });
    };
};


if ("undefined" != typeof checkForPowerChatInterval) {
    clearInterval(checkForPowerChatInterval);
}
checkForPowerChatInterval = setInterval(function(){
    if ("undefined" != typeof $) {
        console.log("powerchat ready");
        clearInterval(checkForPowerChatInterval);
        window.ClientChat = new ClientChat();
        window.ClientChat.init();
    }
},10);
