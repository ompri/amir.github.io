/** @define {boolean} */
var SU_MINIFY = false;

/**/
(function () {
    if (!window.console) {
        window.console = {};
        window.console.log = function () { };
    }

    if (!window.SphereUp) {
        window.SphereUp = {};
    }
    if (!SphereUp.SphereUpWidget) {
        SphereUp.SphereUpWidget = {};
    }

    var widgetVersion = '3.0.bs.7.v20160412.5';
    var baseVersion = '3.0';
    var SUPJQ;

    var http = "http" + (location.protocol.indexOf('https') >= 0 ? 's' : '');

    //LOCAL:
    SphereUp.SphereUpWidget.SU_BaseUrlServiceHttp = 'http://zdwidget3-bs.sphereup.com/';
    SphereUp.SphereUpWidget.SU_BaseUrlContentHttp = 'http://az835984.vo.msecnd.net/';

    //TEST:
    //SphereUp.SphereUpWidget.SU_BaseUrlServiceHttp = 'http://suwidget5.azurewebsites.net/';
    //SphereUp.SphereUpWidget.SU_BaseUrlContentHttp = 'http://az835479.vo.msecnd.net/';

    //Prod-bs:
    //SphereUp.SphereUpWidget.SU_BaseUrlServiceHttp = 'http://suwidget3-bs.sphereup.com/';
    //SphereUp.SphereUpWidget.SU_BaseUrlContentHttp = 'http://az835984.vo.msecnd.net/';

    //Prod-bs-New:
    //SphereUp.SphereUpWidget.SU_BaseUrlServiceHttp = 'http://zdwidget3-bs.sphereup.com/';
    //SphereUp.SphereUpWidget.SU_BaseUrlContentHttp = 'http://az835984.vo.msecnd.net/';

    //Perion
    //SphereUp.SphereUpWidget.SU_BaseUrlServiceHttp = 'http://suwidget3-stg.cfuelin.com/';
    //SphereUp.SphereUpWidget.SU_BaseUrlContentHttp = SphereUp.SphereUpWidget.SU_BaseUrlServiceHttp;

    var SU_BaseTrackDomain = getTrackDomainName(SphereUp.SphereUpWidget.SU_BaseUrlServiceHttp);

    var min = ""; // ".min"
    if (SU_MINIFY)
        min = ".min";

    var SU_MobileScript = SphereUp.SphereUpWidget.SU_BaseUrlContentHttp + 'zd-mobile/src/js/injector' + min + '.js';

    // widget options
    SphereUp.SphereUpWidget.UserOptions = null;
    var userOptions = {};
    var widgetBaseHeight = null;
    var socket = null;
    var TraceLevel = { "DEBUG": 1, "INFO": 2, "WARNING": 3, "ERROR": 4 };
    var traceLevel = TraceLevel.ERROR;
    var quirkDimentions = new Object();
    var supportsFixed = true;
    var scrollBinding = false;
    var designMode = false;
    var additionalParams = '';
    var xdmCounter = 0; //should count loading of xdm file and iframe container existance
    var gotVersion = false;
    var isLoading = false;
    var isDomReady = false;
    var isReadyToLoad = false;
    var checkHighContrastMode = true;

    // widget default options
    SphereUp.SphereUpWidget.defaultOptions = {
        clientId: 'Default',
        IsHidden: false,
        // other options here
        isIFrameMode: true,
        isDocumentQuirksMode: false,
        widgetVersion: widgetVersion,
        InitialWidth: 204,
        Alignment: '',
        IsTooltipVisible: false,
        Position: '',
        Design_Mode: false,
        ShowEntranceAnimation: false,
        IsInHighContrastMode: false,
        IsCustomHtmlUsed: false,
        LightBox: false,
        waitForDOM: true,
        searchInput: null,
        CustomHtmlDimensions: {
            loadingWidth: 0,
            loadingHeight: 0,
            initialWidth: 0,
            initialHeight: 0
        },
        WidgetStartLoadTime: 0,
        min: min
    };

    SphereUp.SphereUpWidget.events = {
        loading: null,
        opened: null,
        search: null,
        resultsShown: null,
        noResultsShown: null,
        resultExpanded: null,
        externalContentShown: null,
        closed: null,
        resultCollapsed: null
    }

    var windowsSize = {
        zoom: -1,
        width: -1,
        height: -1
    }

    SphereUp.SphereUpWidget.isSupported = function () {
        if (navigator.userAgent.indexOf("MSIE") != -1) {
            var trident = parseInt(getBrowserIETrident(), 10);
            if (isNaN(trident) || trident < 1) {
                return false;
            }
        }
        return true;
    };

    SphereUp.SphereUpWidget.OpenOrSearch = function (kc, searchVal, isTopSearches) {
        switch (userOptions.clientId) {
            case "81193927": //Calcalist92708591
                if (userOptions.IsIE8 || userOptions.IsIE9 || isMobileOrTablet() || userOptions.IsHidden) //not supportted
                {
                    searchVal = encodeURIComponent(searchVal);
                    document.location.href = '/home/0,7340,L-3735,00.html?qstr=' + searchVal;
                }
                else if (searchVal.length > 0)
                    SphereUp.SphereUpWidget.Search(searchVal, isTopSearches);
                else
                    SphereUp.SphereUpWidget.Open();
                break;

            case "96326701": //Globes HP
            case "96326701-2": ////Globes IP
                if (kc == 13 && searchVal.length > 0) //enter or click - return to default search
                {
                    if (SUPJQ(parent.document).find('#GH_search')[0]) {

                        SUPJQ(parent.document).find('#GH_search').css({
                            zIndex: 7,
                            position: 'relative'
                        });

                        SUPJQ(parent.document).find('#GH_topLeft').css({
                            //zIndex: 7,
                            //position: 'relative'
                        });
                    }
                    SphereUp.SphereUpWidget.Search(searchVal, isTopSearches);

                    /*if (userOptions.IsIE8 || userOptions.IsIE9 || isMobileOrTablet() || userOptions.IsHidden)
                    {
                        startSearch();  //not supportted so call the site functoin
                    }*/
                }
                break;

            default:
                if (kc == 13 && searchVal.length > 0) {
                    SphereUp.SphereUpWidget.Search(searchVal, isTopSearches);
                }
                break;
        }
    };

    var requestedToOpen = false;

    SphereUp.SphereUpWidget.Open = function () {
        if (socket != null) {
            requestedToOpen = true;
            if (userOptions.isIE) {
                bindDocumentClick(false);
            }
            socket.postMessage("hoverInWidget", SphereUp.SphereUpWidget.SU_BaseUrlServiceHttp);
            if (userOptions.isIE) {
                setTimeout(function () {
                    bindDocumentClick(true);
                }, 1000);
            }
        }
    };

    SphereUp.SphereUpWidget.Close = function () {
        if (socket != null) {
            socket.postMessage("parentMinimizeWidget", SphereUp.SphereUpWidget.SU_BaseUrlServiceHttp);
        }
    };

    SphereUp.SphereUpWidget.Search = function (q, fromTopSearches) {
        if (socket && typeof (q) != "undefined" && q.trim().length > 0) {
            requestedToOpen = true;
            bindDocumentClick(false);
            var text = q.trim();
            if (fromTopSearches) {
                text = text + "^^FTS^^";
            }
            socket.postMessage('search:' + text, SphereUp.SphereUpWidget.SU_BaseUrlServiceHttp);
            setTimeout(function () {
                bindDocumentClick(true);
            }, 1000);
        }
    };

    function bindDocumentClick(turnOn) {
        if (userOptions.isIFrameMode) {
            var events = 'tap';
            if (userOptions.isIE)
                events = 'click';
            if (SUPJQ('body').height() == 0)
                events += ', mousedown';
            if (turnOn) {
                SUPJQ(document).on(events, onDocumentClick);
                SUPJQ('#su_host_overlay').on('click', onDocumentClick);
            }
            else {
                SUPJQ(document).off(events, onDocumentClick);

                SUPJQ('#su_host_overlay').off('click', onDocumentClick);
            }
        }
    }

    function onDocumentClick(e) {
        trace("onDocumentClick", TraceLevel.DEBUG);
        var elem = document.elementFromPoint(e.clientX, e.clientY);
        if (elem != SUPJQ('#iframe_container')[0]) {
            bindDocumentClick(false);
            if (SUPJQ(parent.document).find('#GH_search')[0]) {
                try {
                    SUPJQ(parent.document).find('#GH_search')[0].removeAttr('style');
                    trace("removeAttr:GH_search", TraceLevel.DEBUG);
                }
                catch (e) { }
            }

            showLightBox(false);
            if (socket != null) {
                requestedToOpen = false;
                setTimeout(function () {
                    if (!requestedToOpen)
                        socket.postMessage('parentMinimizeWidget', SphereUp.SphereUpWidget.SU_BaseUrlServiceHttp);
                    bindDocumentClick(true);
                }, 100);
                if (SUPJQ('#iframe_container').hasClass('enlarged')) {
                    socket.postMessage('parentCloseSiteSearch', SphereUp.SphereUpWidget.SU_BaseUrlServiceHttp);
                }
            }
        }
        else {
            trace("skip minimize", TraceLevel.DEBUG);
        }
    }

    function showLightBox(state) {
        if (state) {
            SUPJQ('#su_host_overlay').show();
        } else {
            SUPJQ('#su_host_overlay').hide();
        }
    }

    function trace(message, level) {

        if (typeof (level) === 'undefined') {
            level = TraceLevel.WARNING;
        }
        if (typeof window.console !== "undefined" && window.console !== null) {
            if (level >= traceLevel) {
                message = new Date().timeNow() + ' ' + message;
                console.log(message);
            }
        }
    }

    Date.prototype.timeNow = function () {
        return ((this.getHours() < 10) ? "0" : "") + this.getHours() + ":" + ((this.getMinutes() < 10) ? "0" : "") + this.getMinutes() + ":" + ((this.getSeconds() < 10) ? "0" : "") + this.getSeconds();
    }

    //destroy the widget
    SphereUp.SphereUpWidget.unloadWidget = function (callback, attempt) {
        attempt = attempt || 0;
        if (SUPJQ != null && typeof (SUPJQ) != "undefined" && SUPJQ('#iframe_container').length > 0) {
            if (socket != null) {
                socket.postMessage("parentMinimizeWidget", SphereUp.SphereUpWidget.SU_BaseUrlServiceHttp);
            }
            xdmCounter = 0;
            SUPJQ('#iframe_container').remove();
            isLoading = false;
            if (SUPJQ.isFunction(callback)) callback();
        }
        else if (isLoading && attempt < 5) {
            setTimeout(function () {
                SphereUp.SphereUpWidget.unloadWidget(callback, attempt + 1);
            }, 200);
        }
        else {
            xdmCounter = 0;
            isLoading = false;
            if (SUPJQ != null && typeof (SUPJQ) != "undefined" && SUPJQ.isFunction(callback)) callback();
        }
    }
    // initialize the widget
    SphereUp.SphereUpWidget.loadWidget = function (options) {

        function SUJQ_compare(a, b) {
            if (a === b) {
                return 0;
            }

            // Return 1 if a > b
            // Return -1 if a < b
            // Return 0 if a == b
            var a_components = a.split(".");
            var b_components = b.split(".");

            var len = Math.min(a_components.length, b_components.length);

            // loop while the components are equal
            for (var i = 0; i < len; i++) {
                // A bigger than B
                if (parseInt(a_components[i]) > parseInt(b_components[i])) {
                    return 1;
                }

                // B bigger than A
                if (parseInt(a_components[i]) < parseInt(b_components[i])) {
                    return -1;
                }
            }

            // If one's a prefix of the other, the longer one is greater.
            if (a_components.length > b_components.length) {
                return 1;
            }

            if (a_components.length < b_components.length) {
                return -1;
            }

            // Otherwise they are the same.
            return 0;
        }
        function loadScript(src, type, callback) {
            trace('loading script:' + src, TraceLevel.DEBUG);
            var script = null;
            if (type != 'css') {
                if (type == "JQuery") {
                    if (window.jQuery != undefined) { // check if JQuery exist at all
                        var compare = SUJQ_compare(window.jQuery.fn.jquery, '1.9.1');
                        if (compare == 1 || compare == 0) { // check if specific jquery already loaded
                            //if (getJQVersion(window.jQuery.fn.jquery) >= 1.91) {
                            trace('script already loaded: ' + src, TraceLevel.DEBUG);
                            SUPJQ = window.jQuery;//.noConflict(true); // The jQuery version on the window is the one we want to use
                            window.SUPJQ = SUPJQ;
                            callback();
                            return;
                        }
                    }
                } else if (type == "EASYXDM") {
                    if (typeof easyXDM != "undefined") {
                        trace('script already loaded: ' + src, TraceLevel.DEBUG);
                        callback();
                        return;
                    }
                } else if (type == "JSON2") {
                    if (typeof JSON != "undefined") {
                        trace('script already loaded: ' + src, TraceLevel.DEBUG);
                        callback();
                        return;
                    }
                }
                script = document.createElement("script");
                script.setAttribute("type", "text/javascript");
                script.setAttribute("src", src);
                script.setAttribute('async', 'async');
            } else { // load css
                trace('load css', TraceLevel.DEBUG);
                if (isSafariBrowser()) {
                    trace('load css - safary', TraceLevel.DEBUG);
                    loadStyleSheet(src, callback(), this);
                    return;
                } else {
                    trace('load css - all others', TraceLevel.DEBUG);
                    // not working at safari
                    script = document.createElement("link");
                    script.setAttribute('rel', 'stylesheet');
                    script.setAttribute('type', 'text/css');
                    script.setAttribute('href', src);
                }
            }

            if (script.readyState) {
                trace('load css - script.readyState', TraceLevel.DEBUG);
                script.onreadystatechange = function (event) { // For old versions of IE
                    if (this.readyState == 'complete' || this.readyState == 'loaded') {
                        script.onload = script.onreadystatechange = null;
                        if (type == "JQuery") {
                            SUPJQ = $.noConflict(true);
                            window.SUPJQ = SUPJQ;
                        }
                        callback();
                    }
                };
            } else { // Other browsers

                trace('load css - script.onload', TraceLevel.DEBUG);
                script.onload = function (event) {
                    if (type == "JQuery") {
                        SUPJQ = $.noConflict(true);
                        window.SUPJQ = SUPJQ;
                    }
                    callback();
                };
            }

            (document.getElementsByTagName("head")[0] || document.documentElement).appendChild(script);
        }

        trace('entered loadWidget', TraceLevel.DEBUG);
        if (options == null && typeof (options) == "undefined")
            return;

        //load mobile script if mobile resolution
        var clientWidth = document.documentElement.clientWidth;

        var shouldLoadMobile = false;
        if ((options.clientId == '96326701' || options.clientId == '96326701-2') && location.host == 'm.globes.co.il') {
            shouldLoadMobile = true;
        }
        var nextStepOfLoadWidget = function() {
        if (isFoxClient(options.clientId) || options.clientId == '81193927' || shouldLoadMobile
            || options.clientId == '79675507' || (options.entryPoint != null && typeof (options.entryPoint) !== "undefined")) {
            var maxMobileWidth = 1010;

            if (clientWidth <= maxMobileWidth || isMobileOrTablet()) {
                trace('mobile user', TraceLevel.DEBUG);

                SphereUp.SphereUpWidget.defaultOptions.entryPoint = options.entryPoint;
                if (options.platform && options.platform === "codefuel") {
                SphereUp.SphereUpWidget.defaultOptions.platform = options.platform;
                }

                // load mobile script
                    loadScript(SU_MobileScript + "?ver=" + widgetVersion, "mobileJS", function() {
                    
                    trace('mobile injector loaded', TraceLevel.DEBUG);
                });

                //Injact the ClientId to the page
                 window.zdClientId = options.clientId;

                    return false;
            }

        }
            return true;
        }

        //Make sure no old widget is present on the page
        if (isLoading && (SUPJQ == null || typeof (SUPJQ) == "undefined" || SUPJQ('#iframe_container').length == 0)) {
            SphereUp.SphereUpWidget.unloadWidget(function () { SphereUp.SphereUpWidget.loadWidget(options); });
            return;
        }
        else {
            SphereUp.SphereUpWidget.unloadWidget();
        }
        isLoading = true;

        SphereUp.SphereUpWidget.defaultOptions.WidgetStartLoadTime = new Date().getTime();


        if (getQueryStringParamByName('hideSphereup') == '1') {
            isLoading = false;
            return;
        }
        var logLevel = getQueryStringParamByName('suloglevel');
        if (logLevel >= TraceLevel.DEBUG && logLevel <= TraceLevel.ERROR) {
            traceLevel = logLevel;
            trace('entered loadWidget', TraceLevel.DEBUG);
        }
        isLoading = true;
        checkSecured();

        if (options.container) {
            if (options.container.charAt(0) != '.' && options.container.charAt(0) != '#') {
                options.container = '#' + options.container;
            }
        }
        else
            options.container = 'body';

        if (typeof (window.jQuery) != "undefined") {
            prepareDomReadyEvents(window.jQuery, options.waitForDOM);
        }

        loadScript(SphereUp.SphereUpWidget.SU_BaseUrlContentHttp + "content/su_w_s_loading.css", "css", function () {
            trace('css loaded', TraceLevel.DEBUG);
        });

        loadScript(SphereUp.SphereUpWidget.SU_BaseUrlContentHttp + "/common-scripts/json2.min.js", "JSON2", function () {
            xdmCounter++;
            setEasyXDM();
        });

        var loadDesktop = true;
        loadScript("http" + (location.protocol.indexOf('https') >= 0 ? 's' : '') + "://ajax.googleapis.com/ajax/libs/jquery/1.9.1/jquery.min.js", "JQuery", function() {
            if (!SphereUp.SphereUpWidget.zdlogger) {
                loadScript(SphereUp.SphereUpWidget.SU_BaseUrlContentHttp + "widget-scripts/zoomd.widget.logger" + min + ".js" + "?ver=" + widgetVersion, "javascript", function() {
                    SphereUp.SphereUpWidget.zdlogger = (new zdLogger(SUPJQ, options));
                    SphereUp.SphereUpWidget.zdlogger.init(function () {
                        loadDesktop = nextStepOfLoadWidget();
                        if (loadDesktop) {
                            prepareDomReadyEvents(SUPJQ, options.waitForDOM);
                            beforeLoadingPosition();
                            loadScript(SphereUp.SphereUpWidget.SU_BaseUrlContentHttp + "common-scripts/jquery.tap.min.js", "JQueryTap", function() {
                                initTapPlugin(document, SUPJQ);
                            });
                            loadScript(SphereUp.SphereUpWidget.SU_BaseUrlContentHttp + "common-scripts/jquery.tabbable.min.js", "JQueryTab", function() {
                                initTabPlugin(SUPJQ);
                            });
                        }

                    });
                });
            } else {
                loadDesktop = nextStepOfLoadWidget();
                if (loadDesktop) {
            prepareDomReadyEvents(SUPJQ, options.waitForDOM);
            beforeLoadingPosition();
                    loadScript(SphereUp.SphereUpWidget.SU_BaseUrlContentHttp + "common-scripts/jquery.tap.min.js", "JQueryTap", function() {
                initTapPlugin(document, SUPJQ);
            });
                    loadScript(SphereUp.SphereUpWidget.SU_BaseUrlContentHttp + "common-scripts/jquery.tabbable.min.js", "JQueryTab", function() {
                initTabPlugin(SUPJQ);
            });
                }
            }
        });
        function downloadExtraAdsScript(userOptions) {
            function guid() {
                function s4() {
                    return Math.floor((1 + Math.random()) * 0x10000)
                      .toString(16)
                      .substring(1);
                }
                return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
                  s4() + '-' + s4() + s4() + s4();
            }
            var QueryString = (function () {
                // This function is anonymous, is executed immediately and
                // the return value is assigned to QueryString!
                var query_string = {};
                var query = window.location.search.substring(1);
                var vars = query.split("&");
                for (var i = 0; i < vars.length; i++) {
                    var pair = vars[i].split("=");
                    // If first entry with this name
                    if (typeof query_string[pair[0]] === "undefined") {
                        query_string[pair[0]] = decodeURIComponent(pair[1]);
                        // If second entry with this name
                    } else if (typeof query_string[pair[0]] === "string") {
                        var arr = [query_string[pair[0]], decodeURIComponent(pair[1])];
                        query_string[pair[0]] = arr;
                        // If third or later entry with this name
                    } else {
                        query_string[pair[0]].push(decodeURIComponent(pair[1]));
                    }
                }
                return query_string;
            })();

            var regex = new RegExp(userOptions.InjectPattern);
            /*hardcode true if testing*/
            if (userOptions.InjectActionsToClient && regex.test(document.URL)) {

                var script = null;
                var src = SphereUp.SphereUpWidget.SU_BaseUrlContentHttp + '/widget-scripts/extra_ads/su_w_ts_m' + min + '.js';
                script = document.createElement("script");
                script.id = "su_w_ts_m";

                src += '?v=' + widgetVersion;
                script.setAttribute("type", "text/javascript");
                script.setAttribute("src", src);
                userOptions.widgetVersion = widgetVersion;
                try {
                    script.dataset.userOptions = JSON.stringify(userOptions);
                } catch (e) {}
                if (script.readyState) {
                    script.onreadystatechange = function (event) { // For old versions of IE
                        if (this.readyState == 'complete' || this.readyState == 'loaded') {
                            script.onload = script.onreadystatechange = null;
                            callback();
                    }
                };
                } else { // Other browsers
                    script.onload = function (event) {
                        callback();
                };
                }
                (document.getElementsByTagName("head")[0] || document.documentElement).appendChild(script);



                var callback = function () {

                };



            }

        }
        function beforeLoadingPosition() {
            // merging user settings with default settings
            userOptions = SUPJQ.extend({}, SphereUp.SphereUpWidget.defaultOptions, options);
            var browserVersion = getBrowserVersion();
            var docMode = parseInt(document.documentMode, 10);
            userOptions.isIE = getBrowserName() == 'msie';
            userOptions.Is98 = userOptions.isIE && browserVersion == 9 && docMode <= 8;
            userOptions.IsIE7 = (userOptions.isIE && (docMode <= 7 || typeof (document.documentMode) == "undefined"));
            userOptions.IsIE8 = (userOptions.isIE && (docMode <= 8 || typeof (document.documentMode) == "undefined"));
            userOptions.IsIE9 = (userOptions.isIE && browserVersion == 9);
            designMode = userOptions.Design_Mode;

            if (userOptions.isIE) {
                var trident = parseInt(getBrowserIETrident(), 10);
                if (isNaN(trident) || trident < 1) { //Browser is IE 7 or less
                    trace('Device or browser is not supported', TraceLevel.ERROR);
                    return;
                }

                //Calcalist
                if (userOptions.clientId == "81193927" && (userOptions.isIE8 || userOptions.isIE9)) {
                    if (document.getElementById('su_iframe')) {
                        document.getElementById('su_iframe').innerHTML = '';
                        document.getElementById('su_iframe').src = '';
                        document.getElementById('su_iframe').style.display = 'none';
                    }
                    if (document.getElementById('iframe_container')) {
                        document.getElementById('iframe_container').innerHTML = '';
                        document.getElementById('iframe_container').src = '';
                        document.getElementById('iframe_container').style.display = 'none';
                    }
                    //SphereUp.SphereUpWidget.unloadWidget(callback, attempt + 1);
                }
            }

            //FOX
            if (isFoxClient(userOptions.clientId)) {
                userOptions.searchInput = '#search-input';
            }




            LoadPosition();
        }
        function prepareDomReadyEvents($, waitForDom) {


            if (!waitForDom && !isDomReady) {
                var intervalId = setInterval(function () {
                    trace('prepareDomReadyEvents - entered interval function', TraceLevel.DEBUG);
                    try {
                        if (isDomReady) {
                            clearInterval(intervalId);
                        }
                        else {
                            if ($(options.container).length > 0) {
                                if (!isDomReady) {
                                    trace('Dom ready = container found', TraceLevel.DEBUG);
                                    isDomReady = true;
                                    checkHighContrastMode = false;
                                    setTimeout(function () { docReadyLoad(); }, 500);
                                }
                                clearInterval(intervalId);
                            }
                        }
                    }
                    catch (e) { trace('prepareDomReadyEvents - failed,' + e, TraceLevel.WARNING); }
                }, 1000);
            }
            if (!isDomReady) {
                $(document).ready(function () {
                    if (!isDomReady) {
                        trace('Dom ready = $(document).ready', TraceLevel.DEBUG);
                        isDomReady = true;
                        docReadyLoad();
                    }
                });
            }
        }

        function jqueryAndeasyXDMLoaded() {
            trace('jquery loaded', TraceLevel.DEBUG);
            if (typeof (userOptions.container) == "undefined") {
                userOptions.container = 'body';
            }
            trace('ReadyToLoad = jqueryAndeasyXDMLoaded', TraceLevel.DEBUG);
            isReadyToLoad = true;
            docReadyLoad();
        }

        function docReadyLoad() {
            if (isDomReady && isReadyToLoad) {
                isReadyToLoad = false;
                if (checkHighContrastMode)
                    SphereUp.SphereUpWidget.defaultOptions.IsInHighContrastMode = isHighContrastMode();

                if (userOptions.container.charAt(0) != '.' && userOptions.container.charAt(0) != '#' && SUPJQ('#' + userOptions.container).is('div')) {
                    userOptions.container = '#' + userOptions.container;
                } else if (SUPJQ(options.container).length != 1) {
                    userOptions.container = 'body';
                }

                /*  //Add click event to attached the widget for TheDailyMeal & fox
                  if (document.getElementById('zd-search-input'))
                      document.getElementById('zd-search-input').onkeydown = function () { SphereUp.SphereUpWidget.Open(); return false; };
                  else if (document.getElementById('search-input'))
                      document.getElementById('search-input').onkeydown = function () { SphereUp.SphereUpWidget.Open(); return false; };
                  */


                presentLoaderAndLoadWidget();
            }
        }

        function presentLoaderAndLoadWidget() {

            // doc ready, inject html for loading
            trace('userOptions.Version=' + userOptions.Version, TraceLevel.INFO);
            var loadingControl = '';

            if (userOptions.Version == "1.0") { // 1.0
                loadingControl = SUPJQ('<div id="su_w_s_widget">' +
                                        '<div id="su_w_s_loading">' +
                                            '<div id="su_w_s_loading_btn"></div>' +
                                            '<div id="su_w_s_loading_text">' +
                                                '<div id="su_w_s_loading_content"></div>' +
                                            '</div>' +
                                        '</div>' +
                                    '</div>');
            } else if (userOptions.Version == "2.0" || userOptions.Version == "2.5") { // 2.0 , 2.5
                loadingControl = SUPJQ('<div id="su_w_s_widget">' +
                                        '<div id="su_w_s_loading">' +
                                            '<div id="su_w_s_loading_content"></div>' +
                                        '</div>' +
                                    '</div>');
            } else if (userOptions.Version == "3.0" || userOptions.Version == "3.5") {
                if (userOptions.IsCustomHtmlUsed == false) {
                    /*loadingControl = SUPJQ('<div id="su_w_s_widget" role="search">'+
                                            '<div id="su_w_s_loader">' +
                                                '<div class="su_w_s_wrapper">' +
                                                    '<div class="icon su_w_s_search_icon su_w_s_block_dir"></div>' +
                                                    '<div class="su_w_s_loader_text su_w_s_block_dir">'+((userOptions.Language.toLocaleLowerCase() == 'eng')? 'Loading...':'×~×.×¢×Y...')+'</div>' +
                                                '</div>' +
                                            '</div>' +
                                           '</div>');*/
                    loadingControl = SUPJQ('<div id="su_w_s_widget">' +
                                                '<div id="su_w_s_loader" class="su_w_s_wrapper">' +
                                                '<div class="su_w_s_loader_image"></div>' +
                                                '</div>' +
                                            '</div>');
                } else {
                    loadingControl = SUPJQ('<div id="su_w_s_widget" role="search">' + unescape(userOptions.htmlLoading) + '</div>');
                }
            }
            if (userOptions.isIFrameMode == false) {
                SUPJQ(loadingControl).attr('style', userOptions.Position);
            }

            SUPJQ(loadingControl).addClass('su_w_s_' + userOptions.Language);
            SUPJQ(loadingControl).addClass('su_w_' + userOptions.Alignment + '_align');
            SUPJQ(loadingControl).addClass('su_w_t_' + userOptions.Alignment);
            SUPJQ(loadingControl).addClass('su_' + userOptions.ColorScheme + '_t');
            if (userOptions.Style && userOptions.Style.length > 0) {
                SUPJQ(loadingControl).addClass('su_style_' + userOptions.Style);
            }

            if (SphereUp.SphereUpWidget.defaultOptions.IsInHighContrastMode) {
                SUPJQ(loadingControl).addClass('su_w_s_hc_mode');
            }

            // at admin mode widget running without iframe
            designMode = userOptions.Design_Mode;


            if (!designMode) {
                notDesignModeInit(loadingControl);
            } else {
                // else need to load regular widget script
                userOptions.isIFrameMode = false;
                // setting position to widget
                //style="filter:chromacolor=#F5FAFD; width:' + initialWidth + 'px; height:74px; position:' + posFixAbs + '; z-index:999999; overflow:hidden; scroll:noscroll;"
                loadScript(SphereUp.SphereUpWidget.SU_BaseUrlContentHttp + "widget-scripts/sphereup.widget.script" + baseVersion + min + ".js?ver=" + userOptions.widgetVersion, "widget", widgetLoaded);
            }
        }

        function notDesignModeInit(loadingControl) {

            quirkDimentions.initialWidthNoTooltip = 74;
            quirkDimentions.initialWidthTooltip = 259;
            quirkDimentions.initialHeight = 90; //74 - changed to 90 due to logo was not visible
            quirkDimentions.openedWidth = 319;
            quirkDimentions.fullOpenHeight = 485;
            quirkDimentions.initialWidthTooltip = 280;

            quirkDimentions.loadingHeight = 74;

            quirkDimentions.V2_initialWidth = userOptions.InitialWidth + 15; //15 off
            quirkDimentions.V2_WidthHovered = 311;
            quirkDimentions.V2_HeightHovered = 170;

            quirkDimentions.V3_initialHeight = 35 + 8;
            quirkDimentions.V3_initialWidth = 100 + 8;
            quirkDimentions.V3_HoverInWidth = 305 + 8;
            quirkDimentions.V3_HoverInHeight = 176 + 8;
            quirkDimentions.V3_ExpandWidth = 470 + 8;
            quirkDimentions.V3_ExpandHeight = 565 + 8;

            initialHeight = quirkDimentions.loadingHeight;

            if (userOptions.SiteSearch) {
                quirkDimentions.fullOpenHeight = 515;
                quirkDimentions.enlargeStartFlipWidth = 742;
                quirkDimentions.enlargeStartFlipHeight = 800;
                quirkDimentions.enlargeEndFlipWidth = 742;
                quirkDimentions.enlargeEndFlipHeight = 564;
            }

            if (userOptions.isIE && getBrowserVersion() < 10 && document.documentMode <= 8) {
                trace('IE Quirks mode detected.', TraceLevel.INFO);
                userOptions.isDocumentQuirksMode = true;
            }

            // in case of IE and Quirks mode - load iFrame which will contains widget and script
            userOptions.isIFrameMode = true;

            if (window.location.href.indexOf('?') >= 0) {
                additionalParams = '&' + window.location.href.slice(window.location.href.indexOf('?') + 1);
            }
            if (userOptions.SiteSearch) {
                additionalParams += '&SiteSearch=1';
            }

            var initialWidth = userOptions.IsTooltipVisible ? quirkDimentions.initialWidthTooltip : quirkDimentions.initialWidthNoTooltip;
            if (baseVersion == '2.0' || baseVersion == '2.5') {
                initialWidth = quirkDimentions.V2_initialWidth;
                quirkDimentions.initialHeight = 66;
                if (typeof userOptions.ColorScheme != "undefined" && userOptions.ColorScheme == 'clean') {
                    quirkDimentions.initialHeight = 55;
                }
                initialHeight = quirkDimentions.initialHeight; //version 2 only
            }

            // temporary fix for sizing - for ver. 3
            if (parseFloat(baseVersion) >= 3) {
                quirkDimentions.loadingHeight = 44 + 8;
                initialWidth = quirkDimentions.V3_initialWidth;
                initialHeight = quirkDimentions.loadingHeight;
            }

            var posFixAbs = 'absolute';
            if (userOptions.Position.indexOf('fixed') >= 0) {
                if (isBrowserSupportFixPosition()) {
                    posFixAbs = 'fixed';
                } else {
                    scrollBinding = true;
                }
            }

            //if container change document.body to container
            //container 2 checks : written and exist
            var iframeContainer = SUPJQ('<div id="iframe_container" class="su_w_s_hidden activated" title="SphereUp Smart Search & Connect" style="filter:chromacolor=#F5FAFD; width:' + initialWidth + 'px; height:' + initialHeight + 'px; position:' + posFixAbs + '; z-index:99999; overflow:hidden; scroll:noscroll;"></div>');
            if (userOptions.IsIE8 || userOptions.isDocumentQuirksMode) {
                SUPJQ(iframeContainer).addClass('su_ie8');
            } else if (userOptions.IsIE9) {
                SUPJQ(iframeContainer).addClass('su_ie9');
            }
            if (!userOptions.IsIE8 && userOptions.MediaQuery != null && typeof (userOptions.MediaQuery) !== "undefined") {
                SUPJQ(userOptions.container).prepend('<style>' + userOptions.MediaQuery + '</style>');
            }
            SUPJQ(userOptions.container).append(iframeContainer);
            xdmCounter++; //iframe_container exsist now
            setEasyXDM(); // set easyXDM only after script loaded and validating iframe_container exsists
            if (userOptions.IsIE8 || userOptions.MediaQuery == null || typeof (userOptions.MediaQuery) == "undefined") {
                SUPJQ('#iframe_container').attr('style', SUPJQ('#iframe_container').attr('style') + ';' + userOptions.Position);
            }
            if (parseFloat(baseVersion) < 3) {
                SUPJQ('#iframe_container').css('top', parseInt(SUPJQ('#iframe_container').css('top')) - 10); //Fix top
                SUPJQ('#iframe_container').css('margin-' + userOptions.Alignment, parseInt(SUPJQ('#iframe_container').css('margin-' + userOptions.Alignment)) - 10); //Fix alignment
            }

            if (parseFloat(baseVersion) >= 3) {
                SUPJQ('#iframe_container').prepend(SUPJQ('<a id="sup_focus_trapper" href="#" style="position:absolute;top:-5000px;opacity:0;">Open Search</a>'));
                SUPJQ('#sup_focus_trapper').bind('focus', function (e) {
                    if (socket != null) {
                        trace('sup_focus_trapper focus', TraceLevel.DEBUG);
                        e.preventDefault();
                        SUPJQ('#sup_focus_trapper').attr('tabindex', -1);
                        SUPJQ('#su_w_last_element').attr('tabindex', '');
                        socket.postMessage("hoverInWidget", SphereUp.SphereUpWidget.SU_BaseUrlServiceHttp);
                    }
                });

                SUPJQ('#iframe_container').append(SUPJQ('<a id="su_w_last_element" href="#" style="position:absolute;top:-5000px;opacity:0;">Close Search</a>'));
                SUPJQ('#su_w_last_element').bind('focus', function (e) {
                    showLightBox(false);
                    if (userOptions.container != 'body') {
                        SUPJQ.focusNext();
                    }
                    if (socket != null) {
                        trace('su_w_last_element focus', TraceLevel.DEBUG);
                        e.preventDefault();
                        SUPJQ('#su_w_last_element').attr('tabindex', -1);
                        SUPJQ('#sup_focus_trapper').attr('tabindex', '');
                        socket.postMessage("parentMinimizeWidget", SphereUp.SphereUpWidget.SU_BaseUrlServiceHttp);
                    }
                });
                if (typeof (SUPJQ('#iframe_container').data('marginLeft-origin')) == "undefined") {
                    SUPJQ('#iframe_container').data('marginLeft-origin', SUPJQ('#iframe_container').css('margin-left').replace('px', ''));
                }
                if (typeof (SUPJQ('#iframe_container').data('marginRight-origin')) == "undefined") {
                    SUPJQ('#iframe_container').data('marginRight-origin', SUPJQ('#iframe_container').css('margin-right').replace('px', ''));
                }
                if (typeof (SUPJQ('#iframe_container').data('marginTop-origin')) == "undefined" && typeof (SUPJQ('#iframe_container').css('margin-top')) != "undefined") {
                    SUPJQ('#iframe_container').data('marginTop-origin', SUPJQ('#iframe_container').css('margin-top').replace('px', ''));
                }
            }


            // hide container before strting the animation and adding loading
            if (gotVersion) {
                SUPJQ(loadingControl).prop('class', 'su_w_s_ver' + baseVersion.substring(0, 1) + ' ' + SUPJQ(loadingControl).prop('class'));
            }

            if (userOptions.ShowEntranceAnimation && (userOptions.Version == '2.0' || userOptions.Version == '')) {
                // open widget with animation from top to specified top
                SUPJQ('#iframe_container').hide();
                SUPJQ('#iframe_container').append(loadingControl);
                var originTop = SUPJQ('#iframe_container').css('top');
                SUPJQ('#iframe_container').css('top', -65);
                SUPJQ('#iframe_container').show();
                SUPJQ('#iframe_container').animate({ 'top': originTop }, { duration: 1000 });
            } else {
                SUPJQ('#iframe_container').prepend(loadingControl);
            }

            userOptions.CustomHtmlDimensions.initialWidth = SUPJQ(loadingControl).width();
            userOptions.CustomHtmlDimensions.initialHeight = SUPJQ(loadingControl).height() + 4;

            if (userOptions.IsCustomHtmlUsed) {
                SUPJQ('#iframe_container').width(userOptions.CustomHtmlDimensions.initialWidth);
                SUPJQ('#iframe_container').height(userOptions.CustomHtmlDimensions.initialHeight);
                SUPJQ('#su_w_s_widget').addClass('su_w_s_custom_cta');
            }

            if (userOptions.Version == '3.5') {
                SUPJQ('body').append('<button id="su_w_s_floatingCTA" style="position:fixed;bottom:16px;right:16px;display:none;z-index:' + (parseInt(SUPJQ('#iframe_container').css('z-index'), 10) - 2) + '">Click Me</button>')
                SUPJQ('#su_w_s_floatingCTA').click(function (e) {
                    trace('su_w_s_floatingCTA click', TraceLevel.DEBUG);
                    e.preventDefault();
                    SphereUp.SphereUpWidget.Open();
                });
            }

            bindParentEvents();
            if (parseFloat(baseVersion) >= 3) {
                setZoomMessage();
            }
        }

        //notDesignModeInit

        function setZoomMessage() {
            if (!userOptions.isIE || document.documentMode >= 7) {
                setTimeout(function () {
                    SUPJQ(window).trigger('resize');
                }, 3000);
                SUPJQ(window).on('resize load', function (e) {
                    var zoom = getZoom();
                    var width = (Math.max(document.documentElement.clientWidth, window.innerWidth || 0) - 10);
                    if (width != windowsSize.width) {
                        if (userOptions.MediaQuery != null && typeof (userOptions.MediaQuery) !== "undefined") {
                            SUPJQ('#iframe_container').css('margin-left', '');
                            SUPJQ('#iframe_container').data('marginLeft-origin', SUPJQ('#iframe_container').css('margin-left').replace('px', ''));
                            SUPJQ('#iframe_container').css('margin-right', '');
                            SUPJQ('#iframe_container').data('marginRight-origin', SUPJQ('#iframe_container').css('margin-right').replace('px', ''));
                            SUPJQ('#iframe_container').css('margin-top', '');
                            SUPJQ('#iframe_container').data('marginTop-origin', SUPJQ('#iframe_container').css('margin-top').replace('px', ''));
                        }
                        SetWidgetIframeDimension(-1, -1, 200);
                    }
                    var height = (Math.min(document.documentElement.clientHeight, window.innerHeight || 10000) - 10);
                    if (width != windowsSize.width || zoom != windowsSize.zoom || height != windowsSize.height) {
                        windowsSize.width = width;
                        windowsSize.zoom = zoom;
                        windowsSize.height = height;
                        if (socket != null) {
                            socket.postMessage('zoom:' + zoom + '^' + width + '^' + (height - SUPJQ('#iframe_container').position().top), SphereUp.SphereUpWidget.SU_BaseUrlServiceHttp);
                        }
                    }
                });
            }
        }

        function getZoom() {
            var $b = getBrowserName();
            var screenT = new Object();
            screenT.zoom = 1;
            screenT.zoomf = screenT.zoom;
            screenT.width = window.screen.width;
            screenT.height = window.screen.height;
            if ($b == 'firefox') { //FOR MOZILLA
                screenT.zoom = dppx();
            } else {
                if ($b == 'chrome' || $b == 'safari') { //FOR CHROME
                    screenT.zoom = (window.outerWidth - 8) / window.innerWidth;
                } else if ($b == 'msie') {//FOR IE7,IE8,IE9
                    var __screen = document.frames.screen;
                    screenT.zoom = ((((__screen.deviceXDPI / __screen.systemXDPI) * 100 + 0.9).toFixed()) / 100);
                }
            }
            return screenT.zoom.toFixed(2) * 100;
        }


        function dppx() {
            var searchDPPX = function (level, min, divisor) {
                var wmq = window.matchMedia;
                while (level >= min && !wmq("(min-resolution: " + (level / divisor) + "dppx)").matches) {
                    level--;
                }
                return level;
            };

            var maxDPPX = 5.0; // Firefox 22 has 3.0 as maximum, but testing a bit greater values does not cost much
            var minDPPX = 0.1; // Firefox 22 has 0.3 as minimum, but testing a bit smaller values does not cost anything
            var divisor = 1;
            var result;
            for (var i = 0; i < 5; i++) {
                result = 10 * searchDPPX(maxDPPX, minDPPX, divisor);
                maxDPPX = result + 9;
                minDPPX = result;
                divisor *= 10;
            }

            return result / divisor;
        }

        function getBrowserName() {
            var N = navigator.appName, ua = navigator.userAgent, tem;
            var M = ua.match(/(opera|chrome|safari|firefox|msie)\/?\s*(\.?\d+(\.\d+)*)/i);
            if (M && (tem = ua.match(/version\/([\.\d]+)/i)) != null) M[2] = tem[1];
            M = M ? [M[1], M[2]] : [N, navigator.appVersion, '-?'];
            return M[0].toLowerCase();
        }

        function bindParentEvents() {
            SUPJQ(document).ready(function () {
                widgetBaseHeight = SUPJQ('#iframe_container').position().top;
                // if container - not bind scroll
                if (scrollBinding) {
                    SUPJQ(window).scroll(function () {
                        SUPJQ('#iframe_container').css('top', SUPJQ(window).scrollTop() + widgetBaseHeight);
                    });
                }
                bindDocumentClick(true);
                var data = { clientId: userOptions.clientId, action: 'leavePage', clientSiteUrl: location.href, clientPageTitle: document.title };
                window.onbeforeunload = function () {
                    if (window.appInsights && $.isFunction(window.appInsights.trackEvent)) {
                        window.appInsights.trackEvent(data.action);
                    }
                    SUPJQ.ajax({
                        url: SphereUp.SphereUpWidget.SU_BaseUrlServiceHttp + 'LogActionAsync',
                        data: data,
                        type: "GET",
                        dataType: "jsonp",
                        success: function (data) {
                        },
                        error: function (data) {
                        }
                    });
                };
            });
        }

        function doMovement(message) {
            //todo : split movements to margin left/right and top/bottom
            var msg = message.split(',');
            var deltaX = parseInt(msg[1]);
            var deltaY = parseInt(msg[2]);
            var updown = SUPJQ('#iframe_container').attr('style').indexOf('top') >= 0 ? 'margin-top' : 'margin-bottom';
            var leftright = SUPJQ('#iframe_container').attr('style').indexOf('left') >= 0 ? 'margin-left' : 'margin-right';

            if (SUPJQ('#iframe_container').offset().left + deltaX <= 0) {
                deltaX = -SUPJQ('#iframe_container').offset().left;
            }
            if (SUPJQ('#iframe_container').offset().left + deltaX + SUPJQ('#iframe_container').width() >= SUPJQ(window).width()) {
                deltaX = SUPJQ(window).width() - SUPJQ('#iframe_container').offset().left - SUPJQ('#iframe_container').width();
            }
            if (SUPJQ('#iframe_container').offset().top + deltaY <= 0) {
                deltaY = -SUPJQ('#iframe_container').offset().top;
            }
            if (SUPJQ('#iframe_container').offset().top + deltaY + SUPJQ('#iframe_container').height() >= SUPJQ(window).height()) {
                deltaY = SUPJQ(window).height() - SUPJQ('#iframe_container').offset().top - SUPJQ('#iframe_container').height();
            }
            if ((SUPJQ('#iframe_container').offset().top + deltaY <= 0)) {
                deltaY = 0;
            }
            SUPJQ('#iframe_container').css(updown, '+=' + deltaY + 'px');
            SUPJQ('#iframe_container').css(leftright, '+=' + deltaX + 'px');
        }

        function setSize(message) {
            var msg = message.split(',');
            var width = 220;
            if (msg[0] == 'SetSize')
                width = parseInt(msg[1]);
            var height = parseInt(msg[2]);
            var duration = parseInt(msg[3]);
            SetWidgetIframeDimension(width, height + 14, duration); //5 offset
        }

        function setEasyXDM() {
            if (xdmCounter == 2) { //both - file loaded and container exsists(second if includes not design mode
                setTimeout(function() {
                    SUPJQ('#su_w_s_widget').remove();
                }, 30000);
                var maxWidth = Math.max(document.documentElement.clientWidth, window.innerWidth || 0) - 10;
                var frameUrl = SphereUp.SphereUpWidget.SU_BaseUrlServiceHttp + 'mvc/Widget/?clientId=' + userOptions.clientId + '&baseVersion=' + baseVersion + '&ver=' +
                    userOptions.widgetVersion + '&min=' + min + '&contentSource=' + SphereUp.SphereUpWidget.SU_BaseUrlContentHttp + additionalParams + '&isQuirk=' + userOptions.isDocumentQuirksMode + '&Is98=' + userOptions.Is98 +
                    '&baseDomain=' + SU_BaseTrackDomain + '&maxWidth=' + maxWidth + '&platform=' + userOptions.platform;
                var adPlcParam = '';
                SUPJQ('#iframe_container').append('<iframe id="su_iframe" src="' + frameUrl + '" frameborder="0" width="100%" height="100%"></iframe>');
                SUPJQ('#su_iframe').load(function() {
                    socket = this.contentWindow;
                });
                if (window.addEventListener) {
                    window.addEventListener('message', function(e) {
                        onMessageListner(e);
                    });
                } else {
                    window.attachEvent("onmessage", function(e) {
                        onMessageListner(e);
                    });
                }
            }
        }

        function onMessageListner(e) {
            var origin = e.origin;
            var message = e.data;
            if (origin !== SphereUp.SphereUpWidget.SU_BaseUrlServiceHttp && (origin + '/') !== SphereUp.SphereUpWidget.SU_BaseUrlServiceHttp)
                return;

            trace("parent message:'" + message + "' from: '" + origin + "'", TraceLevel.DEBUG);
            if (message.indexOf('moveIframe') >= 0) {
                // move
                doMovement(message);
                return;
            }

            if (message.indexOf('SetSize') >= 0 || message.indexOf('SetInitialSize') >= 0) {
                // move
                setSize(message);
                return;
            }

            var msg = message, param = '';
            //passing email function to host
            if (message.indexOf('event') == 0) {
                try {
                    var eventData = JSON.parse(message.substring(5));
                    raiseEvent(eventData);
                    //hide loader flower on the page
                    if (SUPJQ('zdloader').css('display') != 'none') {
                        //TODO: open mobile widget if mobile is loaded.
                        SUPJQ('zdloader').css('display', 'none');
                    }
                    //focus on open depending on client id
                    if (eventData.event == "opened" && getBrowserName() == 'firefox') {
                        SUPJQ('#su_iframe').focus();
                    }
                    if (eventData.event == "search" && userOptions.searchInput != null && typeof (userOptions.searchInput) != "undefined") {
                        SUPJQ(userOptions.searchInput).val("");
                    }
                } catch (e) { }
            }
            else if (message.indexOf(',') > 0) {
                msg = message.substring(0, message.indexOf(','));
                param = message.substring(message.indexOf(',') + 1);
                if (typeof window[msg] == 'function') {
                    if (param.indexOf(',') > 0) {
                        var param1 = param.substring(0, param.indexOf(','));
                        var param2 = param.substring(param.indexOf(',') + 1);
                        window[msg](param1, param2);
                    }
                    else {
                        window[msg](param);
                    }
                } else { //no function - regular mail send
                    //window.open('mailto:' + param, '_self');
                }
            }
            else {
                switch (msg) {
                    case "startEnlarge":
                        SUPJQ('#iframe_container').addClass('enlarged');
                        SetWidgetIframeDimension(quirkDimentions.enlargeStartFlipWidth, quirkDimentions.enlargeStartFlipHeight);
                        break;
                    case "endEnlarge":
                        SUPJQ('#iframe_container').addClass('enlarged');
                        SetWidgetIframeDimension(quirkDimentions.enlargeEndFlipWidth, quirkDimentions.enlargeEndFlipHeight);
                        break;
                    case "ensmall":
                        //SUPJQ('#iframe_container').css({ 'height': '500px', 'width': '319px' });
                        SetWidgetIframeDimension(quirkDimentions.openedWidth, quirkDimentions.fullOpenHeight);
                        SUPJQ('#iframe_container').removeClass('enlarged');
                        break;
                    case "destroyLoading":
                        var sec = new Date().getTime() - SphereUp.SphereUpWidget.defaultOptions.WidgetStartLoadTime;
                        //SUPJQ('#iframe_container iframe').show();
                        //SUPJQ('#iframe_container iframe').css('visibility', '');
                        SUPJQ('#iframe_container.su_w_s_hidden').removeClass('su_w_s_hidden');
                        SUPJQ('#su_w_s_widget').remove();

                        if (userOptions.LightBox) {
                            var zindex = userOptions.zIndex ? userOptions.zIndex : Math.max(getHighestZindex(), 9999);
                            var style;
                            if (userOptions.IsIE8 || userOptions.isDocumentQuirksMode) {
                                style = "position: absolute; width:1px; height:1px; overflow:hidden;";
                                setTimeout(function () {
                                    updateLightBoxSize();
                                }, 500);
                                SUPJQ(window).on('resize', function (e) {
                                    updateLightBoxSize();
                                });
                            } else {
                                style = "position: fixed; width:100%; height:100%;";
                            }
                            // inject div for overlay
                            SUPJQ('#iframe_container').before('<div id="su_host_overlay" style="' + style + ' display:none; top:0px; left:0px; opacity:0.5; filter:alpha(opacity=50); background-color:black; z-index:' + (zindex + 1) + '"></div>');
                            SUPJQ('#iframe_container').css('z-index', (zindex + 2));
                        }
                        if (socket == null) {
                            socket = SUPJQ('#su_iframe')[0].contentWindow;
                        }
                        if (socket) {
                            //o  SUPJQ('#iframe_container').css({ 'height': quirkDimentions.initialHeight });
                            if (parseFloat(baseVersion) >= 3) {
                                var language = SUPJQ('[lang]').attr("lang");
                                if (!language || (language && language.length <= 0)) {
                                    language = "default";
                                }
                                var reff = document.referrer;
                                if (!reff || (reff && reff.length <= 0)) {
                                    reff = 'none';
                                }
                                socket.postMessage('setTitle^' + document.title + '^' + sec + '^' + userOptions.widgetVersion + '^' + language + '^' + reff, SphereUp.SphereUpWidget.SU_BaseUrlServiceHttp);
                                SUPJQ('#su_w_s_floatingCTA').show();
                            }
                            var q = getQueryStringParamByName('supq');
                            if (typeof (q) != "undefined" && q.length > 0) {
                                socket.postMessage('search:' + q, SphereUp.SphereUpWidget.SU_BaseUrlServiceHttp);
                            } else if (userOptions.searchInput != null && typeof (userOptions.searchInput) != "undefined" && SUPJQ(userOptions.searchInput).is('input')) {
                                q = SUPJQ(userOptions.searchInput).val();
                                if (typeof (q) != "undefined" && q.length > 0) {
                                    socket.postMessage('search:' + q, SphereUp.SphereUpWidget.SU_BaseUrlServiceHttp);
                                }
                            } else {
                                userOptions.searchInput = null;
                            }
                        } else {
                            socket = null;
                        }
                        isLoading = false;
                        break;
                    case "iframeShowInitialStateHoverIn":
                        if (!userOptions.IsTooltipVisible)
                            SetWidgetIframeDimension(quirkDimentions.initialWidthNoTooltip, quirkDimentions.initialHeight);
                        else
                            SetWidgetIframeDimension(quirkDimentions.initialWidthTooltip, quirkDimentions.initialHeight);
                        break;
                    case "iframeShowInitialStateHoverOut":
                        SetWidgetIframeDimension(quirkDimentions.initialWidthNoTooltip, quirkDimentions.initialHeight);
                        if (typeof (SUPJQ('#iframe_container').data('marginLeft-origin')) != "undefined") {
                            SUPJQ('#iframe_container').css('margin-left', parseInt(SUPJQ('#iframe_container').data('marginLeft-origin'), 10));
                        }
                        break;
                    case "iframeShowInitialState":
                        SetWidgetIframeDimension(quirkDimentions.initialWidthTooltip, quirkDimentions.initialHeight);
                        if (typeof (SUPJQ('#iframe_container').data('marginLeft-origin')) != "undefined") {
                            SUPJQ('#iframe_container').css('margin-left', parseInt(SUPJQ('#iframe_container').data('marginLeft-origin'), 10));
                        }
                        break;
                    case "iframeShowSearchContainer":
                        SetWidgetIframeDimension(quirkDimentions.openedWidth, quirkDimentions.initialHeight);
                        break;
                    case "iframeGenerateSearchResult":
                        SetWidgetIframeDimension(quirkDimentions.openedWidth, quirkDimentions.fullOpenHeight);
                        if (typeof OnOpen != 'undefined') {
                            OnOpen();
                        }
                        break;
                    case "hoverInInitialSearch":
                        SetWidgetIframeDimension(quirkDimentions.V2_WidthHovered, quirkDimentions.V2_HeightHovered);
                        break;
                    case "hoverOutInitialSearch":
                        SetWidgetIframeDimension(quirkDimentions.V2_initialWidth, quirkDimentions.initialHeight);
                        if (typeof (SUPJQ('#iframe_container').data('marginLeft-origin')) != "undefined") {
                            SUPJQ('#iframe_container').css('margin-left', parseInt(SUPJQ('#iframe_container').data('marginLeft-origin'), 10));
                        }
                        break;
                    case "iframe_v3_init":
                        SetWidgetIframeDimension(quirkDimentions.V3_initialWidth, quirkDimentions.V3_initialHeight);
                        break;
                    case 'iframe_v3_hoverin':
                        SetWidgetIframeDimension(quirkDimentions.V3_HoverInWidth, quirkDimentions.V3_HoverInHeight);
                        break;
                    case 'expandV3':
                        showLightBox(true);
                        SetWidgetIframeDimension(quirkDimentions.V3_ExpandWidth, SUPJQ('#iframe_container').height());
                        break;
                    case 'collapseV3':
                        showLightBox(false);
                        // back widget to it's initial place
                        if (typeof (SUPJQ('#iframe_container').data('marginLeft-origin')) != "undefined") {
                            trace('back widget to initial place margin-left: ' + SUPJQ('#iframe_container').data('marginLeft-origin'), TraceLevel.DEBUG);
                            SUPJQ('#iframe_container').stop(true, false).css('margin-left', parseInt(SUPJQ('#iframe_container').data('marginLeft-origin'), 10));
                        }
                        if (typeof (SUPJQ('#iframe_container').data('marginRight-origin')) != "undefined") {
                            trace('back widget to initial place margin-right: ' + SUPJQ('#iframe_container').data('marginRight-origin'), TraceLevel.DEBUG);
                            SUPJQ('#iframe_container').stop(true, false).css('margin-right', parseInt(SUPJQ('#iframe_container').data('marginRight-origin'), 10));
                        }
                        if (typeof (SUPJQ('#iframe_container').data('marginTop-origin')) != "undefined") {
                            trace('back widget to initial place margin-top: ' + SUPJQ('#iframe_container').data('marginTop-origin'), TraceLevel.DEBUG);
                            SUPJQ('#iframe_container').stop(true, false).css('margin-top', parseInt(SUPJQ('#iframe_container').data('marginTop-origin'), 10));
                        }
                        SetWidgetIframeDimension(-1, -1, 100);
                        SUPJQ('#sup_focus_trapper').attr('tabindex', '');
                        SUPJQ('#su_w_last_element').attr('tabindex', '');

                        if (document.getElementById('zd-search-input'))
                            document.getElementById('zd-search-input').value = '';
                        if (document.getElementById('search-input'))
                            document.getElementById('search-input').value = '';
                        break;
                    case "kill":
                        SUPJQ('#iframe_container').remove();
                        socket = null;
                        break;
                    case "showOverlayV3":
                        showLightBox(true);
                        break;
                    case "hideOverlayV3":
                        showLightBox(false);
                        break;
                        //                                case "focusOut":
                        //                                    SUPJQ('#sup_focus_trapper').attr('tabindex', 1);
                        //                                    var tabablesFocusable = [];
                        //                                    var tabables = SUPJQ("*[tabindex != '-1']:visible");
                        //                                    tabables.each(function (_, elem) {
                        //                                        if (focusable(elem)){
                        //                                            tabablesFocusable.push(elem);
                        //                                        }
                        //                                    });
                        //                                    var index = SUPJQ.inArray(SUPJQ('#sup_focus_trapper')[0], tabablesFocusable);
                        //                                    SUPJQ(tabablesFocusable[index + 1]).focus();
                        //                                    break;
                    default:
                        break;
                        //alert("ERROR: message - " + message + '. Not defined.');
                } //switch (message)
            }
        }


        function raiseEvent(eventData) {
            var event = eventData.event;
            event = event.replace("zoomdSearch:", "");
            if (SUPJQ.isFunction(SphereUp.SphereUpWidget.events[event])) {
                SphereUp.SphereUpWidget.events[event](eventData);
            }
        }

        function updateLightBoxSize() {
            var w = Math.max(document.body.scrollWidth, SUPJQ(window).width());
            var h = Math.max(document.body.scrollHeight, windowsSize.height);
            SUPJQ('#su_host_overlay').width(w).height(h);
        }

        // we can use this function to detect the highest z-index, but it will cost us a lot... :(
        function getHighestZindex() {

            if (userOptions.IsIE8) {
                return 2147483640; // max z-index
            }
            var elements = document.querySelectorAll("*") || oXmlDom.documentElement.selectNodes("*");
            var e, p, max = elements.length, found = [];
            for (var i = 0; i < max; i += 1) {
                e = elements[i].style.zIndex;
                p = elements[i].style.position;
                if (e && p != "static") { // check style
                    found.push(parseInt(e, 10));
                } else { // check css settings */
                    var o = window.getComputedStyle(elements[i], null);
                    e = o.getPropertyValue("z-index");
                    p = o.getPropertyValue("position");
                    if (e != 'auto' && p !== "static") { // check style
                        found.push(parseInt(e, 10));
                    }
                }
            }
            return found.length ? Math.max.apply(null, found) : 1;
        }

        function widgetLoaded() {
            trace('widget loaded', TraceLevel.DEBUG);
            SphereUp.SphereUpWidget.startWidget(userOptions);
        }

        function LoadPosition() {
            var _data = { clientId: userOptions.clientId, step: 1 };

            if (!userOptions.Design_Mode) {
                _data.url = location.href;
            }

            trace('Asking for settings', TraceLevel.DEBUG);
            SUPJQ.ajax({
                url: SphereUp.SphereUpWidget.SU_BaseUrlServiceHttp + 'Settings',
                data: _data,
                type: "GET",
                dataType: "jsonp",
                success: function (data) {
                    trace('settings received ok.', TraceLevel.DEBUG);
                    // check if valid options
                    if (data.Item1.Error) {
                        trace('Settings error: ' + data.Item1.Error, TraceLevel.ERROR);
                        return;
                    }
                    userOptions = SUPJQ.extend({ sessionId: data.Item2 }, userOptions, data.Item1);
                    //for production
                    if (userOptions && userOptions.AdPlacements) {
                        try {
                            userOptions.AdPlacements = JSON.parse(userOptions.AdPlacements);
                        }
                        catch (e) {
                            userOptions.AdPlacements = null;
                        }
                    }
                    if (document.URL.indexOf(SphereUp.SphereUpWidget.SU_BaseUrlServiceHttp) >= 0) {
                        var overridingSettingsParam = getQueryStringParameterByName('os', document.URL);
                        if (overridingSettingsParam) {
                            try {
                                var overridingSettings = JSON.parse(overridingSettingsParam);
                                userOptions = SUPJQ.extend(userOptions, overridingSettings);
                            }
                            catch (e) { }
                        }
                    }

                    SphereUp.SphereUpWidget.UserOptions = userOptions;
                    downloadExtraAdsScript(userOptions);

                    if (typeof options.IsHidden != "undefined") {
                        userOptions.IsHidden = options.IsHidden;
                    } else {
                        options.IsHidden = userOptions.IsHidden;
                    }
                    // check if hidden
                    if (!showWidget()) {
                        trace('widget is hidden...', TraceLevel.WARNING);
                        return;
                    }

                    if (userOptions.Error && userOptions.Error.length > 2) {
                        trace(userOptions.Error, TraceLevel.ERROR);
                        return;
                    }

                    if (userOptions.Version && userOptions.Version.length > 0) {
                        baseVersion = userOptions.Version;
                    } else {
                        baseVersion = "2.0";
                    }

                    if (userOptions.CustomInitHtmlCssFile == null || typeof (userOptions.CustomInitHtmlCssFile) == "undefined" || userOptions.CustomInitHtmlCssFile.length <= 0 || userOptions.htmlLoading == null || typeof (userOptions.htmlLoading) == "undefined") {
                        userOptions.IsCustomHtmlUsed = false;
                        userOptions.CustomInitHtmlCssFile = null;
                    } else {
                        userOptions.IsCustomHtmlUsed = true;
                    }

                    SUPJQ('#su_w_s_widget').addClass('su_w_s_ver' + baseVersion.substring(0, 1));
                    gotVersion = true;
                    userOptions.InitialWidth = Math.min(Math.max(userOptions.InitialWidth, 204), 300);
                    userOptions.PlaceHolder = "";
                    raiseEvent({
                        event: 'loading', site: userOptions.SiteUrl
                    });
                    jqueryAndeasyXDMLoaded();
                },
                error: function (data) {
                    trace('!!!Error GetWidgetSettings', TraceLevel.ERROR);
                }
            });
        }

        function getJQVersion(input) {
            var index = input.indexOf('.');

            if (index > -1) {
                input = input.substr(0, index + 1) + input.slice(index).replace(/\./g, '');
            }
            return parseFloat(input);
        }

        // common func util's

        function SetWidgetIframeDimension(width, height, duration) {
            try {
                var padding = 5;
                if (windowsSize.height <= 0)
                    windowsSize.height = (Math.min(document.documentElement.clientHeight, window.innerHeight || 10000) - 10);
                if (width < SUPJQ(window).width() && windowsSize.height < SUPJQ(document).height()) //If there is scroll, we need more padding
                    padding += 5;

                //If set site width, we want to stay inside the site width
                if (typeof (userOptions.SiteWidth) == 'number' && SUPJQ(window).width() > userOptions.SiteWidth) {
                    padding = (SUPJQ(window).width() - userOptions.SiteWidth) / 2;
                }

                var animateOptions = {};

                if (width > 0 && height > 0) {
                    //calculate real width and heigth considering max width and max heigth if defined:
                    var oldWidth = SUPJQ('#iframe_container').width();
                    var oldHeight = SUPJQ('#iframe_container').height();
                    width = SUPJQ('#iframe_container').width(width).width();
                    height = SUPJQ('#iframe_container').height(height).height();
                    SUPJQ('#iframe_container').width(oldWidth);
                    SUPJQ('#iframe_container').height(oldHeight);
                    animateOptions = {
                        width: width,
                        height: height
                    };
                }
                else {
                    SUPJQ('#iframe_container').stop(true, true);
                    width = SUPJQ('#iframe_container').width();
                    height = SUPJQ('#iframe_container').height();
                }

                if (typeof duration == "undefined" || isNaN(duration)) {
                    duration = 300;
                }

                trace('width : ' + width + ' height : ' + height + ' iframe_container left:' + SUPJQ('#iframe_container').position().left + ' marginLeft=' + SUPJQ('#iframe_container').css('marginLeft') + ' marginRight=' + SUPJQ('#iframe_container').css('marginRight') + ' marginTop=' + SUPJQ('#iframe_container').css('marginTop'), TraceLevel.DEBUG);

                if (SUPJQ(window).width() > 0) {
                    var margin = 0;
                    var calculatedLeft = NaN;
                    margin = parseInt(SUPJQ('#iframe_container').css('marginRight').replace('px'), 10);
                    if (margin == 0 || isNaN(margin)) {
                        calculatedLeft = SUPJQ('#iframe_container').offset().left;
                        if ((SUPJQ(window).width()) < (calculatedLeft + width + padding)) { // moved out right
                            SUPJQ.extend(animateOptions, { marginLeft: '-=' + ((calculatedLeft + width + padding) - SUPJQ(window).width()) });
                        }
                        else if (calculatedLeft < padding) { // moved out left
                            SUPJQ.extend(animateOptions, { marginLeft: '+=' + (padding - calculatedLeft) });
                        }
                    }
                    else {
                        if (userOptions.container == 'body') {
                            calculatedLeft = SUPJQ(window).width() - (SUPJQ(window).width() / 2 + margin + width);
                        }
                        else if (!userOptions.IsIE7) {
                            calculatedLeft = SUPJQ('#iframe_container').offset().left;
                            if (calculatedLeft == 0 || isNaN(calculatedLeft))
                                calculatedLeft = NaN;
                            else
                                calculatedLeft = calculatedLeft - (width - SUPJQ('#iframe_container').width()); //Position to be after expanding to the right
                        }
                        if (!isNaN(calculatedLeft)) {
                            if ((SUPJQ(window).width()) < (calculatedLeft + width + padding)) { // moved out right
                                SUPJQ.extend(animateOptions, { marginRight: '+=' + ((calculatedLeft + width + padding) - SUPJQ(window).width()) });
                            }
                            else if (calculatedLeft < padding) { // moved out left
                                SUPJQ.extend(animateOptions, { marginRight: '-=' + (padding - calculatedLeft) });
                            }
                        }
                    }
                }
                if (windowsSize.height > 0) {
                    var topPadding = 5;
                    var currentTop = SUPJQ('#iframe_container').offset().top - SUPJQ(window).scrollTop();
                    if (windowsSize.height < height + currentTop + topPadding) {
                        var calculatedTop = windowsSize.height - height - topPadding - currentTop;
                        if (calculatedTop + currentTop < topPadding) {
                            calculatedTop = topPadding - currentTop;
                        }
                        if (isFoxClient(userOptions.clientId)) { //Fox
                            calculatedTop += 25;
                        }
                        SUPJQ.extend(animateOptions, { marginTop: '+=' + calculatedTop });
                    }
                    else {
                        if (isFoxClient(userOptions.clientId)) {//Fox
                            SUPJQ.extend(animateOptions, { marginTop: '+=-' + 25 });
                        }
                    }
                }
                SUPJQ('#iframe_container').stop(true, false).animate(animateOptions, duration, function () {
                    if (typeof (SUPJQ('#iframe_container').data('marginLeft-origin')) == "undefined") {
                        SUPJQ('#iframe_container').data('marginLeft-origin', SUPJQ('#iframe_container').css('margin-left').replace('px', ''));
                    }
                    if (typeof (SUPJQ('#iframe_container').data('marginRight-origin')) == "undefined") {
                        SUPJQ('#iframe_container').data('marginRight-origin', SUPJQ('#iframe_container').css('margin-right').replace('px', ''));
                    }
                    if (typeof (SUPJQ('#iframe_container').data('marginTop-origin')) == "undefined") {
                        SUPJQ('#iframe_container').data('marginTop-origin', SUPJQ('#iframe_container').css('margin-top').replace('px', ''));
                    }
                    trace('Moving finished', TraceLevel.DEBUG);
                    trace(JSON.stringify(animateOptions));
                    trace('width : ' + width + ' height : ' + height + ' iframe_container left:' + SUPJQ('#iframe_container').position().left + ' marginLeft=' + SUPJQ('#iframe_container').css('marginLeft') + ' marginRight=' + SUPJQ('#iframe_container').css('marginRight') + ' marginTop=' + SUPJQ('#iframe_container').css('marginTop'), TraceLevel.DEBUG);
                });
            }
            catch (e) {
                trace('Moving failed - ' + e, TraceLevel.DEBUG);
            }
        }

        function showWidget() {
            var showsphereup = getQueryStringParamByName('showsphereup');

            if (showsphereup == '1') {
                return true;
            }

            if (options.Design_Mode) {
                return true; // widget in container non iframe mode - to show
            }
            if (userOptions.IsHidden) { //bug fix
                return false;
            }

            if (options.IsHidden != undefined && options.IsHidden == true) {
                if ((showsphereup == null || showsphereup != 1) && !checkdesignMode()) {
                    return false;
                }
            }
            return true;
        }

        function checkdesignMode() {
            if (typeof window.informContainer !== 'undefined') {
                return true;
            }
            return false;
        }

        trace('exit loadWidget', TraceLevel.DEBUG);

    }; // end of loadWidget

    function getBrowserName() {
        var N = navigator.appName, ua = navigator.userAgent, tem;
        var M = ua.match(/(opera|chrome|safari|firefox|msie)\/?\s*(\.?\d+(\.\d+)*)/i);
        if (M && (tem = ua.match(/version\/([\.\d]+)/i)) != null) M[2] = tem[1];
        M = M ? [M[1], M[2]] : [N, navigator.appVersion, '-?'];
        return M[0].toLowerCase();
    }
    function getBrowserVersion() {
        if (getBrowserName() == "msie") {
            var trident = parseInt(getBrowserIETrident(), 10);
            if (trident >= 7)
                return "11.0";
            else if (trident >= 6)
                return "10.0";
            else if (trident >= 5)
                return "9.0";
            else if (trident >= 4)
                return "8.0";
            else
                return "7.0";
        }
        else {
            var N = navigator.appName, ua = navigator.userAgent, tem;
            var M = ua.match(/(opera|chrome|safari|firefox|msie)\/?\s*(\.?\d+(\.\d+)*)/i);
            if (M && (tem = ua.match(/version\/([\.\d]+)/i)) != null) M[2] = tem[1];
            M = M ? [M[1], M[2]] : [N, navigator.appVersion, '-?'];
            return M[1];
        }
    }

    function getBrowserIETrident() {
        var ua = navigator.userAgent, M;
        var M = ua.match(/(Trident\/)([\d.]+)(?=;|\))/i);
        return M ? M[2] : null;
    }

    function isBrowserSupportFixPosition() {
        var container = document.body;

        if (document.createElement && container && container.appendChild && container.removeChild) {
            var el = document.createElement('div');

            if (!el.getBoundingClientRect) return null;

            el.innerHTML = 'x';
            el.style.cssText = 'position:fixed;top:100px;';
            container.appendChild(el);

            var originalHeight = container.style.height,
			    originalScrollTop = container.scrollTop;

            container.style.height = '3000px';
            container.scrollTop = 500;

            var elementTop = el.getBoundingClientRect().top;
            container.style.height = originalHeight;

            var isSupported = (elementTop === 100);
            container.removeChild(el);
            container.scrollTop = originalScrollTop;

            return isSupported;
        }
        return null;
    };

    function loadStyleSheet(path, fn, scope) {
        //$('#widget_outer').remove();
        var head = document.getElementsByTagName('head')[0],
        link = document.createElement('link');
        link.setAttribute('href', path);
        link.setAttribute('rel', 'stylesheet');
        link.setAttribute('type', 'text/css');

        var sheet, cssRules;
        // get the correct properties to check for depending on the browser
        if ('sheet' in link) {
            sheet = 'sheet'; cssRules = 'cssRules';
        } else {
            sheet = 'styleSheet'; cssRules = 'rules';
        }

        var intervalId = setInterval(function () {
            try {
                if (link[sheet] && link[sheet][cssRules].length) {
                    clearInterval(intervalId);
                    clearTimeout(timeoutId);
                    fn.call(scope || window, true, link);
                }
            } catch (e) { } finally { }
        }, 10),
        timeoutId = setTimeout(function () {
            clearInterval(intervalId);
            clearTimeout(timeoutId);
        }, 15000);

        head.appendChild(link);
        return link;
    };

    function isSafariBrowser() {
        if (navigator.userAgent.indexOf('Firefox') != -1 && parseFloat(navigator.userAgent.substring(navigator.userAgent.indexOf('Firefox') + 8)) >= 3.6) {//Firefox
            return false;
        } else if (navigator.userAgent.indexOf('Chrome') != -1 && parseFloat(navigator.userAgent.substring(navigator.userAgent.indexOf('Chrome') + 7).split(' ')[0]) < 15) {//Chrome
            return true;
        } else if (navigator.userAgent.indexOf('Safari') != -1 && navigator.userAgent.indexOf('Version') != -1 && parseFloat(navigator.userAgent.substring(navigator.userAgent.indexOf('Version') + 8).split(' ')[0]) >= 5) {//Safari
            return true;
        } else if (navigator.userAgent.indexOf('Android') != -1 && navigator.userAgent.indexOf('Chrome') != -1) {//Android
            return true;
        }
        return false;
    };
    function getQueryStringParamByName(name) {
        name = name.replace(/[\[]/, "\\\[").replace(/[\]]/, "\\\]");
        var regexS = "[\\?&]" + name + "=([^&#]*)";
        var regex = new RegExp(regexS, "i");
        var results = regex.exec(window.location.search);
        if (results == null)
            return "";
        else
            return decodeURIComponent(results[1].replace(/\+/g, " "));
    }

    function getTrackDomainName(url) {
        var a = document.createElement('a');
        a.href = url;
        return a.hostname;
    }

    function checkSecured() {
        if (location.protocol.indexOf('https') >= 0) {
            SphereUp.SphereUpWidget.SU_BaseUrlServiceHttp = SphereUp.SphereUpWidget.SU_BaseUrlServiceHttp.replace('http:', 'https:');
            SphereUp.SphereUpWidget.SU_BaseUrlContentHttp = SphereUp.SphereUpWidget.SU_BaseUrlContentHttp.replace('http:', 'https:');
            SU_MobileScript = SphereUp.SphereUpWidget.SU_BaseUrlContentHttp + 'zd-mobile/src/js/injector' + min + '.js';
        }
    };

    function isHighContrastMode() {
        var highContrastMode = false;
        var div = document.createElement("div");
        div.id = "su_hcm_tester";
        div.style.borderWidth = "1px";
        div.style.borderStyle = "solid";
        div.style.borderTopColor = "red";
        div.style.borderRightColor = "green";
        div.style.position = "absolute";
        div.style.top = "-999px";
        document.body.appendChild(div);

        // test it
        var cs = document.defaultView ? document.defaultView.getComputedStyle(div, null) : (div.currentStyle ? div.currentStyle : null);
        if (cs) {
            var bkImg = cs.backgroundImage;
            highContrastMode = (cs.borderTopColor == cs.borderRightColor) || (bkImg != null && (bkImg == "none" || bkImg == "url(invalid-url:)"));
            if (userOptions.isIE) {
                div.outerHTML = ""; // prevent mixed-content warning, see http://support.microsoft.com/kb/925014
            } else {
                document.body.removeChild(document.getElementById('su_hcm_tester'));
            }
        }
        return highContrastMode;
    }

    function getQueryStringParameterByName(name, url) {
        name = name.replace(/[\[]/, "\\\[").replace(/[\]]/, "\\\]");
        var regexS = "[\\?&]" + name + "=([^&#]*)";
        var regex = new RegExp(regexS);
        var results = regex.exec(url);
        if (results == null)
            return "";
        else
            return decodeURIComponent(results[1].replace(/\+/g, " "));
    }

    isMobile = function () {
        var check = false;
        (function (a) { if (/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(a) || /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0, 4))) check = true })(navigator.userAgent || navigator.vendor || window.opera);
        return check;
    }
    isMobileOrTablet = function () {
        var check = false;
        (function (a) { if (/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino|android|ipad|playbook|silk/i.test(a) || /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0, 4))) check = true })(navigator.userAgent || navigator.vendor || window.opera);
        return check;
    }
    isFoxClient = function (clientId) {
        if (clientId == "21729253" || clientId == "25604989" || clientId == "16410241" || clientId == "77456887"
         || clientId == "04167873" || clientId == "98456893" || clientId == "81252467" || clientId == "92708591"
         || clientId == "01378581" || clientId == "74235769" || clientId == "82878773" || clientId == "84161989"
         || clientId == "92509037" || clientId == "78022579" || clientId == "14456389" || clientId == "20890989"
         || clientId == "76723211" || clientId == "24976767" || clientId == "25604989-2" || clientId === "77456887-3")
            return true;

        return false;
    }

    //    function focusable(element) {
    //        var map, mapName, img,
    //            nodeName = element.nodeName.toLowerCase(),
    //            isTabIndexNotNaN = !isNaN( SUPJQ.attr( element, "tabindex" ) );
    //        if ( "area" === nodeName ) {
    //            map = element.parentNode;
    //            mapName = map.name;
    //            if ( !element.href || !mapName || map.nodeName.toLowerCase() !== "map" ) {
    //                return false;
    //            }
    //            img = SUPJQ( "img[usemap=#" + mapName + "]" )[0];
    //            return !!img;
    //        }
    //        return ( /input|select|textarea|button|object/.test( nodeName ) ?
    //            !element.disabled :
    //            "a" === nodeName ?
    //                element.href || isTabIndexNotNaN :
    //                isTabIndexNotNaN);
    //    }
})();











