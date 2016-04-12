
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

    var jQuery;
    var shouldTrack = true;

    if (SphereUp.SphereUpWidget.ServerInit && SphereUp.SphereUpWidget.ServerInit.baseUrlServiceHttp) {
        SU_BaseUrlServiceHttp = SphereUp.SphereUpWidget.ServerInit.baseUrlServiceHttp;
    }
    else if (SphereUp.SphereUpWidget.SU_BaseUrlServiceHttp) {
        SU_BaseUrlServiceHttp = SphereUp.SphereUpWidget.SU_BaseUrlServiceHttp;
    }
    if (SU_BaseUrlServiceHttp.slice(-1) != '/') {
        SU_BaseUrlServiceHttp = SU_BaseUrlServiceHttp + '/';
    }
    var SU_BaseUrlContentHttp = getQueryStringParameterByName("contentSource");
    if (SphereUp.SphereUpWidget.ServerInit && SphereUp.SphereUpWidget.ServerInit.baseContentHttp) {
        SU_BaseUrlContentHttp = SphereUp.SphereUpWidget.ServerInit.baseContentHttp;
    }
    SU_BaseUrlContentHttp = SU_BaseUrlContentHttp || SU_BaseUrlServiceHttp;
    if (SU_BaseUrlContentHttp.slice(-1) !== '/') {
        SU_BaseUrlContentHttp = SU_BaseUrlContentHttp + '/';
    }
    SphereUp.SphereUpWidget.hidePlacement = function (contType) {
        $('[containerType="' + contType + '"] ').remove();
    }

    var cssSourcePath = SU_BaseUrlContentHttp + "content/^VER^/widget-css/";
    var adsSourcePath = SU_BaseUrlContentHttp + "content/3.0/widget-ads/";

    var TraceLevel = { "DEBUG": 1, "INFO": 2, "WARNING": 3, "ERROR": 4 };
    var FilterType = { "DefaultCategory": 1, "Category": 2, "Suggestion": 3 };
    var WidgetState = { "LOADING": 0, "INITIAL": 1, "HOVER": 2, "DISCOVERY": 2.5, "SEARCHRESULTS": 3, "EXPANDED": 4 };
    var ResultType = { "Contact": 1, "SiteSearch": 2 };
    var openAnimationRunning = 'openAnimationRunning';
    var closeAnimationRunning = 'closeAnimationRunning';
    var CWS = {
        baseVersion: '3.0',
        widgetVersion: '',
        traceLevel: TraceLevel.WARNING,
        mapAddressUrl: "https://maps.google.com/?q=^ADDRESS^",
        mapParkingUrl: "https://maps.google.com/?q=parking near ^ADDRESS^",
        mapImageUrl: "https://maps.googleapis.com/maps/api/staticmap?markers=size:mid%7Ccolor:red%7C^ADDRESS^&zoom=14&size=195x124&sensor=false&key=AIzaSyCO7szMqw5LVAevtcp5QU3XkrlnRBANJZM",
        mapImageUrl1: "https://maps.googleapis.com/maps/api/staticmap?markers=size:mid%7Ccolor:red%7C^ADDRESS^&zoom=14&size=245x124&sensor=false&key=AIzaSyCO7szMqw5LVAevtcp5QU3XkrlnRBANJZM",
        mapImageUrl2: "https://maps.googleapis.com/maps/api/staticmap?markers=size:mid%7Ccolor:red%7C^ADDRESS^&zoom=14&size=195x124&sensor=false&key=AIzaSyCO7szMqw5LVAevtcp5QU3XkrlnRBANJZM",
        widgetReady: false,
        scrollerObject: null,
        options: null,
        isIFrameMode: false,
        sessionId: null,
        flags: null,
        curState: WidgetState.ERROR,
        scrollPercentageExtraLoader: 0.8,
        maxHeight: 565,
        maxExpandedHeight: 710,
        moreContactsAvailable: false,
        moreSiteSearchAvailable: false,
        siteSearchPage: 0,
        hostSiteTitle: '',
        iFrameMargin: 8,
        widgetMinorVersion: '3.0.10.8.bs.4',
        lastIndexLogged: 0,
        oldWidth: 0,
        availHeight: 10000,
        asyncFixForCloseWidget: false,
        language: "default",
        reff: "none",
        loadedDiscovery: false,
        reverseTransition: false
    };
    //stop expanded result video on collapse
    CWS.pauseVideo = function (li) {
        var vid = $(li).find("video").get(0);
        if (vid)
            vid.pause();
    };
    // all files to include
    var sources = [
        { name: "JQuery", link: "http://ajax.googleapis.com/ajax/libs/jquery/1.9.1/jquery.min.js", type: "js" },
        { name: "Rx", link: cssSourcePath + "../../../common-scripts/RX2.js", type: "js" },
        { name: "drag", link: cssSourcePath + "../../../common-scripts/jquery.keynavigation.js", type: "js" },
        { name: "grid", link: cssSourcePath + "../../../widget-scripts/masonry.pkgd.min.js", type: "js" },
        { name: "tel-css", link: cssSourcePath + "intlTelInput.css", type: "css" },
        { name: "tel-js", link: cssSourcePath + "../../../widget-scripts/intlTelInput.js", type: "js" }
    ];
    var ie98PlaceHolder = { name: "placeholder_js", link: cssSourcePath + "../../../common-scripts/jquery.placeholder.min.js", type: "js" };
    var ie7Css = { name: "ie7_css", link: cssSourcePath + "su_w_s_widget_ie7.css", type: "css" };

    var cssSource = { name: "maincss", link: cssSourcePath + "su_w_s_widget_main.css", type: "css" };
    var signalR = [
        { name: "signalR", link: SU_BaseUrlContentHttp + "scripts/jquery.signalR-2.1.0.min.js", type: "js" },
        { name: "signalR", link: SU_BaseUrlContentHttp + "signalr/hubs", type: "js" }
    ];

    // widget default options
    CWS.originalSettings = {
        IsHidden: false,
        IsTooltipVisible: false,
        InitialWidth: 208,
        Alignment: '',
        Position: '',
        ColorScheme: '',
        Language: 'eng',
        Company: '',
        Style: '',
        PlaceHolder: '',
        DefaultCategories: null,
        CustomDisclaimer: '',
        ExpandedClass: '',
        ExpandedWidth: 2,
        EnableCall: false,
        DisableEmail: false,
        maxWidth: 10000,
        RequiredExpandedWidth: 2
    };
    CWS.flags = {
        htmlLoaded: false,
        scriptsLoaded: false,
        lastTerm: '',
        forceDisplay: false,
        lastCategories: [],
        suffix: {
            index: 0,
            keys: ['\t', '  ']
        },
        scrollBinded: false,
        ie9: null,
        ie8: null,
        ie7: null,
        isIE: false,
        IsInHighContrastMode: false
    };
    CWS.templates = {
        defaultCategoryTemplate: null,
        searchResultCategoriesTemplate: null,
        searchResultSuggestionTemplate: null,
        siteSearchRowTemplate: null
    };
    CWS.times = {
        loadedTime: null,
        hoverIn: null
    }
    CWS.statistics = {
        resolution: screen.availWidth + 'X' + screen.availHeight,
        hoverParamMs: 1000,
        zoom: '100',
        currentPageNumber: 0
    };
    CWS.isExternalContentPlaceholderCard = function (html) {
        return (/^<li class=['"]?su_external_content_placeholder['"]?/i).test(html);
    }

    function getExternalContentCardPosition(li, position) {
        position = position || (CWS.originalSettings.ExternalContentPosition != null && typeof (CWS.originalSettings.ExternalContentPosition) != "undefined" ? CWS.originalSettings.ExternalContentPosition : 2);
        if ($('li.su_external_content_placeholder', li).length > 0) {
            position = $('li.su_external_content_placeholder', li).closest('li.su_w_s_contact_item_data_card').index();
        }
        return position;
    }
    SphereUp.SphereUpWidget.getWidgetSettings = function () {
        return CWS.originalSettings;
    };

    SphereUp.SphereUpWidget.search = function (text) {
        if (text.indexOf("^^FTS^^") > -1) {
            text = text.replace("^^FTS^^", "");
            CWS.EntryPoint = "TopSearches";
        }
        CWS.flags.lastTerm = '';
        v3HoverIn(null, true, function () {
            if (CWS.flags.isIE)
                $('#su_w_s_search_input').removeClass('placeholder');
            $('#su_w_s_search_input').val(text);
            $('#su_w_s_search_input').trigger('keyup', [text, 0, 0]);
        }, true);
    };

    SphereUp.SphereUpWidget.setColorScheme = function (color) {
        var colorCss = { name: "colorcss", link: cssSourcePath + 'su_w_s_' + color + "_t.css", type: "css" };
        loadScript(colorCss, function () {
            CWS.originalSettings.ColorScheme = color;
            trace("Color CSS loaded Ok", TraceLevel.DEBUG);
            $("#su_w_s_widget").removeClass(function (index, css) {
                return (css.match(/su_[A-z]*_t/g) || []).join(' ');
            });
            $("#su_w_s_widget").addClass('su_' + color + '_t');
        });
    };
    SphereUp.SphereUpWidget.getActionSearchUrl = function (containerType) {
        var buildedData = buildLogData();
        var url = '/ActionSearch2?clientId=' +
        encodeURIComponent(buildedData.clientId) + '&sessionId=' +
        encodeURIComponent(buildedData.sessionId) + '&query=' +
        encodeURIComponent(buildedData.query) + '&title=' +//query
        encodeURIComponent(buildedData.itemTitle ? buildedData.itemTitle : '') + '&targetUrl=' +
        encodeURIComponent(buildedData.targetUrl ? buildedData.targetUrl : '') + '&url=' +
        encodeURIComponent(buildedData.SiteUrl ? buildedData.SiteUrl : '') + '&clientSiteUrl=' +
        encodeURIComponent(buildedData.clientSiteUrl ? buildedData.clientSiteUrl : '') + '&itemType=' +
        encodeURIComponent(buildedData.itemType ? buildedData.itemType : '') +
        '&containerType=' + containerType +
        '&entryPoint=' + encodeURIComponent(CWS.EntryPoint) +
        (CWS.originalSettings.platform ? '&platform=' + encodeURIComponent(CWS.originalSettings.platform) : '') +
        '&widgetMinorVersion=' + encodeURIComponent(CWS.widgetMinorVersion);
        if (SphereUp.SphereUpWidget.ServerInit && SphereUp.SphereUpWidget.ServerInit.abTesting) {
            url += '&abTesting=' + encodeURIComponent(SphereUp.SphereUpWidget.ServerInit.abTesting);
        }
        return url;
    }
    SphereUp.SphereUpWidget.minimizeWidget = function () {
        $('#su_ads_under_footer').detach();
        $("#su_w_s_widget #su_w_s_results_wrapper").toggleClass("allow_sorting", false);
        var parent = $('#su_w_s_search_input').parent();
        var el = $('#su_w_s_search_input').detach();
        $('.su_wcag', parent).after(el);
        hideElement($('#su_w_s_logo_wrapper'));
        //reset the widget
        if ($('#su_w_s_search_input').val() && $('#su_w_s_search_input').val().length > 0) {
            $('#su_w_s_search_input').val('').trigger('keyup');
            CWS.asyncFixForCloseWidget = true;
        }
        CWS.EntryPoint = null;
        CWS.flags.lastTerm = '';
        clearSelectedCategory();
        CWS.flags.lastCategories = [];
        bindHoverEvents(true);

        $('#su_w_s_results_wrapper').stop(true, true);
        $('#su_w_s_cta').stop(true, true);
        $('#su_w_s_widget').stop(true, true);
        if ($('#su_w_s_results_wrapper:visible').length == 1) {
            logAction('closeWidget', '', (CWS.curState == WidgetState.EXPANDED ? 'widgetExpanded' : 'widgetCollapsed'), '', '', '', '', 0, (new Date().getTime() - CWS.times.hoverIn) / 1000);
            $('#initialStateAdWrapper, .su_w_s_search_content_item.widget_zoomd_ads, #su_ads_under_footer').detach();
            $("#su_w_s_widget #su_w_s_results_wrapper").toggleClass("allow_sorting", false);
        }

        showReadyState(true);

        setTimeout(function () { sendMessageToParent('collapseV3'); }, 200);
    };

    SphereUp.SphereUpWidget.setPageTitle = function (message) {
        var parameters = message.split('^');
        var title = parameters[1];
        var timeLoad = parameters[2];
        CWS.widgetMinorVersion = parameters[3];
        CWS.language = parameters[4];
        CWS.reff = parameters[5];
        CWS.hostSiteTitle = title;
        try { timeLoad = timeLoad / 1000; }
        catch (e) { timeLoad = 0; }
        CWS.times.loadedTime = new Date().getTime();
        logAction('widgetLoaded', '', '', '', '', '', '', 0, timeLoad);
        trace('set page title:' + title, TraceLevel.DEBUG);
    };


    SphereUp.SphereUpWidget.dataGenerated = 'SphereUp.SphereUpWidget.dataGenerated';


    SphereUp.SphereUpWidget.hoverInWidget = function (doNotFocus) {
        CWS.EntryPoint = "OpenFunction";
        v3HoverIn(null, !doNotFocus);
    };

    SphereUp.SphereUpWidget.hoverOutWidget = function () {
        v3HoverOut();
    };

    function widget_ads() {
        var self = this;
        this.ads = {
            initialState_ad: false,
            initialState_ad_height: "101px",
            footer_ad: false,
            footer_ad_height: '93px',
            search_content_ad_arr: [],
            discovery_content_ad_arr: [],
            search_content_ad_1: false,
            search_content_ad_2: false,
            search_content_iframe: false,
            exp_res_ad: false,
            search_ad_noresult_height:[],
            exp_res_ads: []
        }
        this.isInitAdOn = function () {
            return self.ads.initialState_ad;
        }
        this.isContentAdsOn = function () {
            return (self.ads.footer_ad || self.ads.search_content_ad_arr.length > 0);
        }
        this.isExtraContentOn = function () {
            return self.ads.search_content_iframe;
        }
        this.expandedStateAddHeight = function () {
            return self.ads.footer_ad;
        }
        this.init = function (options) {
            var AdPlacements = CWS.originalSettings.AdPlacements;
            if (AdPlacements) {
                var arrOfAdpl = AdPlacements;
                for (var i = 0; i < arrOfAdpl.length; i++) {
                    switch (arrOfAdpl[i].name) {
                        case 'SR':
                            if (arrOfAdpl[i].hasOwnProperty("settings") && arrOfAdpl[i].settings.hasOwnProperty("position") && !isNaN(arrOfAdpl[i].settings.position)) {
                                self.ads.search_content_ad_arr.push(arrOfAdpl[i].settings);
                            }
                            break;
                        case 'DD-SR':
                            if (arrOfAdpl[i].hasOwnProperty("settings") && arrOfAdpl[i].settings.hasOwnProperty("position") && !isNaN(arrOfAdpl[i].settings.position)) {
                                self.ads.discovery_content_ad_arr.push(arrOfAdpl[i].settings);
                            }
                            break;
                        case 'BB':
                            self.ads['footer_ad'] = true;
                            if (arrOfAdpl[i].hasOwnProperty("settings") && arrOfAdpl[i].settings.hasOwnProperty("height")) {
                                if (!isNaN(arrOfAdpl[i].settings.height)) {
                                    arrOfAdpl[i].settings.height = arrOfAdpl[i].settings.height + "px";
                                }
                                if (self.check_height_regex(arrOfAdpl[i].settings)) {
                                    self.ads['footer_ad_height'] = arrOfAdpl[i].settings.height;
                                }
                            }
                            break;
                        case 'MD':
                            self.ads['initialState_ad'] = true;
                            if (arrOfAdpl[i].hasOwnProperty("settings") && arrOfAdpl[i].settings.hasOwnProperty("height")) {
                                if (!isNaN(arrOfAdpl[i].settings.height)) {
                                    arrOfAdpl[i].settings.height = arrOfAdpl[i].settings.height + "px";
                                }
                                if (self.check_height_regex(arrOfAdpl[i].settings)) {
                                    self.ads['initialState_ad_height'] = arrOfAdpl[i].settings.height;
                                }
                            }
                            break;
                        case 'ER':
                            if (arrOfAdpl[i].hasOwnProperty("settings")) {
                                if (arrOfAdpl[i].settings.hasOwnProperty("position") && isNaN(arrOfAdpl[i].settings.position)) {
                                    delete arrOfAdpl[i].settings.position;
                                }
                                if (arrOfAdpl[i].settings.hasOwnProperty("cardSpan") && isNaN(arrOfAdpl[i].settings.cardSpan)) {
                                    delete arrOfAdpl[i].settings.cardSpan;
                                }
                                if (arrOfAdpl[i].settings.hasOwnProperty("height")) {
                                    if (!isNaN(arrOfAdpl[i].settings.height)) {
                                        arrOfAdpl[i].settings.height = arrOfAdpl[i].settings.height + "px";
                                    }
                                    if (!self.check_height_regex(arrOfAdpl[i].settings)) {
                                        arrOfAdpl[i].settings.height = null;
                                    }
                                }
                                self.ads['exp_res_ads'].push(arrOfAdpl[i]);
                            } else {
                                self.ads['exp_res_ads'].push(null);
                            }
                            self.ads['exp_res_ad'] = true;
                            break;
                        default:
                            break;
                    }
                }
                self.ads.search_content_ad_arr.sort(this.sortByPosition);
                self.ads.discovery_content_ad_arr.sort(this.sortByPosition);
                return this;
            }
            return this;
        }
        this.sortByPosition = function (a, b) {
            if (a.position > b.position) {
                return 1;
            }
            if (a.position < b.position) {
                return -1;
            }
            // a must be equal to b
            return 0;
        }
        this.addAdsToResponse = function (li) {
            var currObj = null,
                styles = '',
                attributes = '',
                url = null,
                position = null,
                template = $('.su_expand_html_data_list', CWS.templates.searchResultContactRowTemplate).parent(),
                card = template.clone();
            for (var i = 0; i < self.ads.exp_res_ads.length; i++) {
                if (self.ads.exp_res_ads[i]) {
                    if (self.ads.exp_res_ads[i].hasOwnProperty("settings")) {
                        currObj = self.ads.exp_res_ads[i].settings;
                    } else {
                        currObj = null;
                    }
                    position = getExternalContentCardPosition(li, currObj ? currObj.position : null);

                    url = SphereUp.SphereUpWidget.getActionSearchUrl('ER' + position);
                    if (currObj && currObj.height) {
                        styles += 'height:' + currObj.height;
                    }
                    if (currObj && currObj.cardSpan) {
                        if (currObj.cardSpan > 1) {
                            $(card).addClass('su_card_span_' + currObj.cardSpan);
                        }
                        attributes += 'card_span="' + currObj.cardSpan + '"';
                    }

                    $('.su_expand_html_data_list', card).html('<li ' + attributes + '><iframe frameborder="0" scrolling="no" src="' + url + '" style="width:100%;' + styles + '" ' + attributes + '></iframe></li>');
                    if (position <= 0) {
                        $('.contact_item_list_expanded_data', li).prepend(card);
                    }
                    else {
                        var targetCard = $('.contact_item_list_expanded_data li.su_w_s_contact_item_data_card:nth-child(' + position + ')', li);
                        if (targetCard.length != 0)
                            $(targetCard).after(card);
                        else
                            $('.contact_item_list_expanded_data', li).append(card);
                    }

                    currObj = null;
                    styles = '';
                    attributes = '';
                    position = null;
                    url = null;

                    $(card).find('iframe').one('load', function () {
                        $('.contact_item_list_expanded_data.masonryApplied', li).masonry('destroy').removeClass('masonryApplied');
                        $('.contact_item_list_expanded_data', li).addClass('masonryApplied').masonry(masonrySettings);
                    });
                    card = template.clone();
                };
            };

        }
        this.check_height_regex = function (settings) {
            return (/[0-9]+px$/).test(settings.height);
        }

    };

    // initialize the widget
    SphereUp.SphereUpWidget.startWidget = function (options) {
        //Perion
        if (options.platform && options.platform === "codefuel" || (SphereUp.SphereUpWidget.ServerInit && SphereUp.SphereUpWidget.ServerInit.Platform === "codefuel")) {
            CWS.originalSettings.platform = options.platform || SphereUp.SphereUpWidget.ServerInit.Platform;
            if (SphereUp.SphereUpWidget.ServerInit)
                SphereUp.SphereUpWidget.ServerInit.abTesting = 'perion';
        }

        CWS.flags.isIE = getBrowserName() == 'msie';
        var browserVersion = getBrowserVersion();
        var docVersion = parseInt(document.documentMode, 10);
        if ((CWS.flags.isIE && (parseInt(browserVersion) <= 7)) || (docVersion < 7)) { // || isAndroidNative
            trace('Device or browser is not supported', TraceLevel.ERROR);
            sendMessageToParent('kill');
            return;
        }

        trace('startWidget', TraceLevel.INFO);
        checkSecured();

        CWS.flags.ie9 = CWS.flags.isIE && (browserVersion == '9.0' || docVersion == 9);
        CWS.flags.ie8 = CWS.flags.isIE && (browserVersion == '8.0' || docVersion == 8);
        CWS.originalSettings = $.extend({}, CWS.originalSettings, options);
        CWS.widgetVersion = CWS.originalSettings.widgetVersion;
        CWS.isIFrameMode = CWS.originalSettings.isIFrameMode;
        CWS.originalSettings.isDocumentQuirksMode = getQueryStringParameterByName('isQuirk') == "true";
        CWS.flags.ie8 = CWS.flags.ie8 || CWS.originalSettings.isDocumentQuirksMode;
        CWS.flags.ie7 = CWS.flags.isIE && docVersion <= 7;

        var url = getCurrentLocationUrl();
        if (CWS.flags.ie9 || CWS.flags.ie8 || CWS.flags.ie7) {
            loadScript(ie98PlaceHolder, function () {
            });
        }
        if (CWS.flags.ie7) {
            loadScript(ie7Css, function () {
            });
        }
        loadScript(cssSource, function () { //css
            loadScript(sources[0], function () { //json2
                loadScript(sources[1], function () { //jquery
                    getDirectTextPlugin();
                    loadScript(sources[2], function () { //jquery
                        loadScript(sources[3], function () { //jquery
                            loadRestOfFiles(); // all non jquery & html files
                            getWidgetSettings(); //settings and categories -> then generate page
                        });
                    });
                });
            });
        });

        function loadRestOfFiles() {
            var needed = sources.length - 4;
            var current = 0;
            for (var i = 4; i < sources.length; i++) {
                if (current >= 0) {
                    loadScript(sources[i], function (e) {
                        if (typeof e != 'number' || e >= 0) {
                            current++;
                            if (current == needed) {
                                allScriptsLoaded();
                            }
                        } else {
                            current = e;
                        }
                    });
                }
            }
        }
    }; // Start widget

    SphereUp.SphereUpWidget.setZoom = function (message) {
        var parameters = message.split('^');
        var zoom = parameters[0];
        var maxWidth = parameters[1];
        if (parameters.length > 2) {
            var maxHeight = parameters[2];
            if (CWS.availHeight != maxHeight) {
                CWS.availHeight = maxHeight;
            }
        }
        if (CWS.originalSettings.maxWidth != maxWidth || CWS.statistics.zoom != zoom) {
            CWS.statistics.zoom = zoom;
            CWS.originalSettings.maxWidth = maxWidth;
            setExpandSize();
        }
    };
    function getDirectTextPlugin() {
        window.jQuery.fn.justtext = function () {
            return $(this).clone()
                .children()
                .remove()
                .end()
                .text();
        };
    }

    function getWidgetSettings() {
        var url = getCurrentLocationUrl();
        if (SphereUp.SphereUpWidget.ServerInit && SphereUp.SphereUpWidget.ServerInit.settings) {
            processSettings({ m_Item1: SphereUp.SphereUpWidget.ServerInit.settings, m_Item2: SphereUp.SphereUpWidget.ServerInit.sessionId }, url);
        }
        else {
            var data = { clientId: CWS.originalSettings.clientId };
            var pageUrl = getCurrentLocationUrl();
            if (!CWS.originalSettings.Design_Mode) {
                data.url = pageUrl;
            }

            trace('getting settings ver: 3.0', TraceLevel.INFO);
            $.ajax({
                url: SU_BaseUrlServiceHttp + 'Settings',
                data: data,
                type: "GET",
                dataType: "jsonp",
                success: function (data) {
                    trace('getting settings ver: 3.0 - OK', TraceLevel.INFO);

                    // check if valid settings
                    if (data.m_Item1.Error) {
                        trace('Settings error: ' + data.m_Item1.Error, TraceLevel.ERROR);
                        return;
                    }

                    processSettings(data, pageUrl);
                },
                error: function (data) {
                    trace('!!!Error GetWidgetSettings', TraceLevel.ERROR);
                }
            });

            // check if hidden
            var showsphereup = getQueryStringParameterByName('showsphereup');
            if (CWS.originalSettings.IsHidden != undefined && CWS.originalSettings.IsHidden == true) {
                if (showsphereup == null || showsphereup != 1) {
                    trace('widget is hidden...', TraceLevel.WARNING);
                    return;
                }
            }
        }
    } //getWidgetSettings

    function processOverrideSettings(url) {
        var overridingSettingsParam = getQueryStringParameterByName('os', url);
        if (overridingSettingsParam) {
            try {
                var overridingSettings = JSON.parse(overridingSettingsParam);
                CWS.originalSettings = $.extend(CWS.originalSettings, overridingSettings);
                if (overridingSettings.CustomInitHtmlCssFile && SphereUp.SphereUpWidget.ServerInit && SphereUp.SphereUpWidget.ServerInit.cisHtml) {
                    SphereUp.SphereUpWidget.ServerInit.cisHtml = null;
                }
            }
            catch (e) { }
        }
    }

    function processSettings(data, url) {
        CWS.originalSettings = $.extend({ sessionId: data.m_Item2 }, CWS.originalSettings, data.m_Item1);
        //If we are on testing widget mode - try take overriding settings from query string
        if (url.indexOf(SU_BaseUrlServiceHttp) >= 0) {
            processOverrideSettings(url);
        }
        if (CWS.isIFrameMode) {
            processOverrideSettings(document.location.search);
        }
        if (CWS.originalSettings.AdPlacements) {
            try {
                CWS.originalSettings.AdPlacements = JSON.parse(CWS.originalSettings.AdPlacements);
            }
            catch (e) {
                CWS.originalSettings.AdPlacements = null;
            }
        }
        widget_ads = (new widget_ads()).init(CWS.originalSettings);

        if (CWS.originalSettings.ExpandedWidth == null || typeof (CWS.originalSettings.ExpandedWidth) == "undefined") {
            CWS.originalSettings.ExpandedWidth = 2;
        } else if (CWS.originalSettings.ExpandedWidth < 1 || CWS.originalSettings.ExpandedWidth > 4) {
            CWS.originalSettings.ExpandedWidth = 2;
        }
        CWS.originalSettings.RequiredExpandedWidth = CWS.originalSettings.ExpandedWidth;
        setExpandSize();

        // load ccs by color scheme
        var colorCss = { name: "colorcss", link: cssSourcePath + 'su_w_s_' + CWS.originalSettings.ColorScheme + "_t.css", type: "css" };
        loadScript(colorCss, function () {
            trace("Color CSS loaded Ok", TraceLevel.DEBUG);
        });

        // parse banners strings
        if (typeof (CWS.originalSettings.SmallBanner) != "undefined" && typeof (CWS.originalSettings.LargeBanner) !== "undefined") {
            var objSmall = parseBanner(CWS.originalSettings.SmallBanner);
            var objLarge = parseBanner(CWS.originalSettings.LargeBanner);
            if (objSmall != null && objLarge != null) {
                CWS.originalSettings.Banners = {
                    PicUrlBig: objLarge.img,
                    PicUrlSmall: objSmall.img,
                    TextLong: objLarge.alt,
                    TextShort: objSmall.alt,
                    DestUrl: objSmall.action
                };
            }
        }

        if (CWS.originalSettings.Language == "heb") {
            CWS.mapImageUrl = CWS.mapImageUrl + "&language=he";
            CWS.mapImageUrl1 = CWS.mapImageUrl1 + "&language=he";
            CWS.mapImageUrl2 = CWS.mapImageUrl2 + "&language=he";
        }

        processCustomCTA(url);

        if (typeof CWS.originalSettings.InitialWidth != 'number') {
            CWS.originalSettings.InitialWidth = 208; // default width of the widget at initial state
        } else {
            CWS.originalSettings.InitialWidth = Math.min(Math.max(CWS.originalSettings.InitialWidth, 48), 300);
        }

        if (typeof CWS.originalSettings.MaxHeight == 'number') {
            CWS.maxHeight = Math.max(CWS.originalSettings.MaxHeight, 400);
        }

        if (typeof CWS.originalSettings.MaxExpandedHeight == 'number') {
            CWS.maxExpandedHeight = Math.max(CWS.originalSettings.MaxExpandedHeight, 565);
        }

        if (typeof (CWS.originalSettings.SkipStates) != 'undefined' && CWS.originalSettings.SkipStates != null) {
            try {
                CWS.originalSettings.SkipStates = JSON.parse(CWS.originalSettings.SkipStates);
            }
            catch (e) {
                CWS.originalSettings.SkipStates = null;
            }
        }

        // if phone calls available - get the settings for counry code
        if (typeof (CWS.originalSettings.EnableCall) != 'undefined' && CWS.originalSettings.EnableCall != null && CWS.originalSettings.EnableCall) {
            CWS.originalSettings.clientData = null;
            $.ajax({
                url: 'https://freegeoip.net/json/',
                type: "GET",
                dataType: "jsonp",
                success: function (data) {
                    CWS.originalSettings.clientData = data;
                },
                error: function (data) {
                }
            });
        }

        masonrySettings = {
            columnWidth: 225,
            transitionDuration: 0,
            isOriginLeft: (CWS.originalSettings.Alignment.toLowerCase() != 'right')
        };

        discoveryMasonrySettings = {
            columnWidth: 225,
            transitionDuration: 0,
            isOriginLeft: (CWS.originalSettings.Alignment.toLowerCase() != 'right')
        };

        if (CWS.originalSettings.EnableDiscovery) {
            getDiscoveryResults();
        }

        if (!CWS.originalSettings.IsCustomHtmlUsed) {
            getWidgetMostCommonCategories(CWS.originalSettings.clientId, url, CWS.originalSettings.sessionId);
        }
    }

    function processCustomCTA(url){
        if (CWS.originalSettings.CustomInitHtmlCssFile == null || typeof (CWS.originalSettings.CustomInitHtmlCssFile) == 'undefined' || CWS.originalSettings.CustomInitHtmlCssFile.length <= 0) {
            CWS.originalSettings.IsCustomHtmlUsed = false;
            CWS.originalSettings.CustomInitHtmlCssFile = null;
        } else {
            CWS.originalSettings.IsCustomHtmlUsed = true;
        }

        if (CWS.originalSettings.IsCustomHtmlUsed == true) {
            // in case custom loading and initial - load html and css for it.
            CWS.originalSettings.IsCustomHtmlUsed = true;
            var customCss = { name: "customcss", link: cssSourcePath.replace(SU_BaseUrlContentHttp, SU_BaseUrlServiceHttp) + CWS.originalSettings.CustomInitHtmlCssFile + ".css", type: "css" };
            loadScript(customCss, function () { //css
                trace("Custom CSS loaded Ok", TraceLevel.DEBUG);
            });

            if (SphereUp.SphereUpWidget.ServerInit && SphereUp.SphereUpWidget.ServerInit.cisHtml) {
                processCustomHtml(SphereUp.SphereUpWidget.ServerInit.cisHtml, url);
            }
            else {
                $.ajax({
                    url: SU_BaseUrlServiceHttp + 'WidgetContentService.ashx?type=custom&name=' + CWS.originalSettings.CustomInitHtmlCssFile + '&lang=' + CWS.originalSettings.Language + '&baseVersion=' + CWS.baseVersion,
                    type: "GET",
                    dataType: "jsonp",
                    success: function (data) {
                        trace('custom html loaded.', TraceLevel.DEBUG);
                        processCustomHtml(data, url);
                    },
                    error: function (data) {
                        trace('!!!Error loading custom HTML!!! from ' + SU_BaseUrlServiceHttp + 'WidgetContentService.ashx name=' + CWS.originalSettings.CustomInitHtmlCssFile, TraceLevel.ERROR);
                    }
                });
            }
        }
    }

    function processCustomHtml(data, url) {
        CWS.originalSettings.CustomInitHtmlCssFile = data.Data;
        if (!CWS.isIFrameMode) { // in case of no iframe show loading
            if (CWS.originalSettings.IsCustomHtmlUsed) {
                $('#su_w_s_widget').attr('style', CWS.originalSettings.Position);
                $('#su_w_s_widget').html(CWS.originalSettings.htmlLoading);
                $('#su_w_s_loader', $('#su_w_s_widget')).show();
            } else {
                $('#su_w_s_widget').attr('style', CWS.originalSettings.Position + ';width:138px;');
                $('#su_w_s_widget').html('<div id="su_w_s_loader" class="su_w_s_wrapper">' +
                                            '<div class="su_w_s_loader_image"></div>' +
                                        '</div>');
            }
        }
        if (url)
            getWidgetMostCommonCategories(CWS.originalSettings.clientId, url, CWS.originalSettings.sessionId);
    }

    function setExpandSize() {
        var oldWidth = CWS.originalSettings.ExpandedWidth;
        var maxWidth = CWS.originalSettings.maxWidth || screen.availWidth;
        if (maxWidth > 0 && maxWidth < 505) {
            CWS.originalSettings.ExpandedWidth = 1;
        }
        else if (maxWidth > 0 && maxWidth < 730 && (CWS.originalSettings.ExpandedWidth > 2 || CWS.originalSettings.RequiredExpandedWidth >= 2)) {
            CWS.originalSettings.ExpandedWidth = 2;
        }
        else if (maxWidth > 0 && maxWidth < 960 && (CWS.originalSettings.ExpandedWidth > 3 || CWS.originalSettings.RequiredExpandedWidth >= 3)) {
            CWS.originalSettings.ExpandedWidth = 3;
        }
        else {
            CWS.originalSettings.ExpandedWidth = CWS.originalSettings.RequiredExpandedWidth;
        }
        if ((oldWidth != CWS.originalSettings.ExpandedWidth && CWS.curState == WidgetState.EXPANDED) || (CWS.oldWidth > 0 && CWS.oldWidth != maxWidth && CWS.curState == WidgetState.INITIAL)) {
            SphereUp.SphereUpWidget.minimizeWidget();
            fixSearchResultTitle();
        }
        CWS.oldWidth = maxWidth;
        // prepare expand class
        if (CWS.originalSettings.ExpandedWidth == 1) {
            CWS.originalSettings.ExpandedClass = 'su_expand_col1';
        } else {
            CWS.originalSettings.ExpandedClass = 'su_w_s_expanded_view su_expand_col' + CWS.originalSettings.ExpandedWidth;
        }
        if (oldWidth != CWS.originalSettings.ExpandedWidth && (oldWidth == 1 || CWS.originalSettings.ExpandedWidth == 1)) {
            if (CWS.originalSettings.ExpandedWidth == 1)
                CWS.mapImageUrl = CWS.mapImageUrl1;
            else
                CWS.mapImageUrl = CWS.mapImageUrl2;
            $('.su_expand_address_data_list').each(function (_, elem) {
                var address = $('li.su_address h4', elem).text();
                var encodedAddress = encodeURIComponent(address);
                var imageUrl = CWS.mapImageUrl.replace('^ADDRESS^', encodedAddress);
                $('li.su_address_map_img img', elem).attr('src', imageUrl);
            });
        }
    }

    function parseBanner(bannerText) {
        var objBanner = null;
        if (bannerText != null && bannerText.length > 0) {
            try {
                objBanner = JSON.parse(bannerText);
            }
            catch (e) {
                objBanner = null;
            }
        }
        return objBanner;
    }

    function getDiscoveryResults() {
        if (!CWS.loadedDiscovery && CWS.originalSettings.EnableDiscovery) {
            trace('getting discovery results', TraceLevel.DEBUG);
            if (SphereUp.SphereUpWidget.ServerInit && SphereUp.SphereUpWidget.ServerInit.discoveryResults && SphereUp.SphereUpWidget.ServerInit.discoveryResults.Results) {
                CWS.originalSettings.discoveryResults = SphereUp.SphereUpWidget.ServerInit.discoveryResults.Results;
                CWS.loadedDiscovery = true;
                processDiscoveryResults();
            }
            else {
                var data = { clientId: CWS.originalSettings.clientId, sessionId: CWS.originalSettings.sessionId };
                if (!CWS.originalSettings.Design_Mode) {
                    data.url = getCurrentLocationUrl();
                }
                $.ajax({
                    url: SU_BaseUrlServiceHttp + 'GetDiscoveryResults',
                    data: data,
                    type: "GET",
                    dataType: "jsonp",
                    success: function (data) {
                        trace('getting discovery results - OK', TraceLevel.DEBUG);
                        if (data && data.Results) {
                            CWS.originalSettings.discoveryResults = data.Results;
                        }
                        CWS.loadedDiscovery = true;
                        processDiscoveryResults();
                    },
                    error: function (data) {
                        trace('Error on GetDiscoveryResults ' + data.message, TraceLevel.ERROR);
                    }
                });
            }
        }
    }

    function processDiscoveryResults() {
        if (CWS.loadedDiscovery && CWS.originalSettings.EnableDiscovery) {
            if (CWS.originalSettings.discoveryResults && CWS.originalSettings.discoveryResults.length > 0) {
                if (CWS.templates.discoveryResultTemplate) {
                    $('#su_w_s_discovery_content_list').empty();
                    for (var i = 0; i < CWS.originalSettings.discoveryResults.length; ++i) {
                        var result = CWS.originalSettings.discoveryResults[i];
                        var card = $(CWS.templates.discoveryResultTemplate).clone(false);
                        $(card).data('discoveryResult', result);
                        $(card).attr('resultType', ResultType.Contact);
                        $(card).attr('resultid', result.Id);
                        $('.su_w_s_discovery_content_item_picture_img', card).attr('style', 'background:url(' + result.ImageUrl + ') center center no-repeat; background-size: cover;');
                        $('.su_discovery_title :first-child', card).text(result.Title);
                        $('a', card).attr('href', result.Url);
                        $(card).click(function (e) {
                            var curResult = $(this).data('discoveryResult');
                            logAction('clickOnLink', 'Contact', 'widgetCollapsed', curResult.Title, curResult.Subtitle, curResult.Title, curResult.Url, $(this).index(), (new Date().getTime() - CWS.times.hoverIn) / 1000);
                        });
                        $('#su_w_s_discovery_content_list').append(card);
                    }
                }
                fixCustomEllipsis($('.su_discovery_title', $('#su_w_s_discovery_content_list')), $('.su_discovery_title:first :first-child', $('#su_w_s_discovery_content_list')).prop("tagName"));
                $('#su_w_s_discovery_content_list').addClass('masonryApplied');
                $('#su_w_s_discovery_content_list').masonry(discoveryMasonrySettings);
            }
            else {
                //No results for discovery, don't show discovery state
                CWS.originalSettings.EnableDiscovery = false;
                if (CWS.originalSettings.SkipStates) {
                    var index = CWS.originalSettings.SkipStates.indexOf(WidgetState.HOVER);
                    if (index >= 0) {
                        CWS.originalSettings.SkipStates.splice(index, 1);
                    }
                }
            }
        }
    }

    function generateDicoveryAds() {
        $('#su_w_s_discovery_content_list .widget_zoomd_ads').remove();
        for (var i = 0; i < widget_ads.ads.discovery_content_ad_arr.length; i++) {
            currPosition = widget_ads.ads.discovery_content_ad_arr[i].position;
            var card = $(CWS.templates.discoveryAdResultTemplate).clone(false);
            $('iframe', card).attr('src', SphereUp.SphereUpWidget.getActionSearchUrl('DD-SR' + currPosition));
            if (currPosition <= 0) {
                $('#su_w_s_discovery_content_list').prepend(card);
            } else if ($('#su_w_s_discovery_content_list > li').length >= currPosition) {
                $('#su_w_s_discovery_content_list > li:eq(' + (currPosition - 1) + ')').after(card);
            }
            else {
                $('#su_w_s_discovery_content_list').append(card);
            }
        };
        if ($('#su_w_s_discovery_content_list > li').length % CWS.originalSettings.ExpandedWidth != 0) {
            var countToRemove = $('#su_w_s_discovery_content_list > li').length % CWS.originalSettings.ExpandedWidth;
            $('#su_w_s_discovery_content_list > li').slice(-1 * countToRemove).remove();
        }
        try { $('#su_w_s_discovery_content_list.masonryApplied').masonry('destroy').removeClass('masonryApplied'); }
        catch (e) { }
        $('#su_w_s_discovery_content_list').addClass('masonryApplied').masonry(discoveryMasonrySettings);
        if (widget_ads.ads.footer_ad) {
            if ($('#su_ads_under_footer')[0]) {
                $('#su_ads_under_footer').remove();
            }
            $('#su_w_s_widget').append($('<ul id="su_ads_under_footer"  containerType="BB"></ul>').append(makeAd('BB', widget_ads.ads.footer_ad_height)));
        }
    }

    function fixCustomEllipsis(elements, textTag) {
        $(elements).each(function (index, elem) {
            var p = $(textTag, elem);
            var height = $(elem).height();
            if ($(p).outerHeight() > height) {
                $(elem).attr('title', $(p).text());
            }
            while ($(p).outerHeight() > height) {
                $(p).text(function (index, text) {
                    return text.replace(/\s*(\S)+\s*(...)?$/, '...');
                });
            }
        });
    }

    function getWidgetMostCommonCategories(clientId, url, session) {
        trace('getting categories', TraceLevel.DEBUG);
        if (SphereUp.SphereUpWidget.ServerInit && SphereUp.SphereUpWidget.ServerInit.categories) {
            CWS.originalSettings.DefaultCategories = SphereUp.SphereUpWidget.ServerInit.categories;
            defaultCategoriesLoaded(); //execute only after categories were loaded
        }
        else {
            var data = { clientId: clientId, sessionId: session };
            if (!CWS.originalSettings.Design_Mode) {
                data.url = url;
            }
            $.ajax({
                url: SU_BaseUrlServiceHttp + 'GetCategories',
                data: data,
                type: "GET",
                dataType: "jsonp",
                success: function (data) {
                    trace('getting categories - OK', TraceLevel.DEBUG);
                    CWS.originalSettings.DefaultCategories = data;
                    defaultCategoriesLoaded(); //execute only after categories were loaded
                },
                error: function (data) {
                    trace('Error on GetCategories ' + data.message, TraceLevel.ERROR);
                }
            });
        }
    } //getWidgetMostCommonCategories



    function defaultCategoriesLoaded() {
        trace('jquery loaded, getting html', TraceLevel.INFO);

        $(document).ready(function () {

            trace('widget v3.0 - doc ready', TraceLevel.DEBUG);

            CWS.flags.IsInHighContrastMode = isHighContrastMode();

            //logic for SharePoint based sites - hide SphereUp in design mode.
            try {
                if (typeof MSOWebPartPageFormName != 'undefined' && document.forms[MSOWebPartPageFormName] && document.forms[MSOWebPartPageFormName].MSOLayout_InDesignMode && document.forms[MSOWebPartPageFormName].MSOLayout_InDesignMode.value == '1') {
                    return;
                }
            }
            catch (e) {
            }


            // moved to loader script
            var myDiv = document.createElement('div');
            myDiv.setAttribute('id', 'su_w_s_widget');

            if (CWS.flags.isIE) {
                $(myDiv).addClass('su_ie');
            }

            if (CWS.originalSettings.IsCustomHtmlUsed) {
                $(myDiv).addClass('su_w_s_custom_cta');
            }

            if (typeof CWS.originalSettings.container != 'undefined' && CWS.originalSettings.container != null && CWS.originalSettings.container != 'body') {
                trace('widgetOptions.container=' + CWS.originalSettings.container, TraceLevel.DEBUG);
                document.getElementById(CWS.originalSettings.container.substr(1)).appendChild(myDiv);
            } else {
                document.body.appendChild(myDiv);
            }

            $('#su_w_s_widget').attr('role', 'search');
            $('#su_w_s_widget').addClass('su_w_s_' + CWS.originalSettings.Language);
            $('#su_w_s_widget').addClass('su_w_' + CWS.originalSettings.Alignment + '_align');
            $('#su_w_s_widget').addClass('su_w_t_' + CWS.originalSettings.Alignment);
            $('#su_w_s_widget').addClass('su_' + CWS.originalSettings.ColorScheme + '_t');

            if (CWS.originalSettings.Style && CWS.originalSettings.Style.length > 0) {
                $('#su_w_s_widget').addClass('su_style_' + CWS.originalSettings.Style);
            }

            if (CWS.flags.IsInHighContrastMode) {
                $('#su_w_s_widget').addClass('su_w_s_hc_mode');
            }

            // start to load HTML
            trace('start to load HTML', TraceLevel.DEBUG);
            if (SphereUp.SphereUpWidget.ServerInit && SphereUp.SphereUpWidget.ServerInit.html) {
                processHtml(SphereUp.SphereUpWidget.ServerInit.html);
            }
            else {
                $.ajax({
                    url: SU_BaseUrlServiceHttp + 'WidgetContentService.ashx?lang=' + CWS.originalSettings.Language + '&baseVersion=' + CWS.baseVersion,
                    type: "GET",
                    dataType: "jsonp",
                    success: function (data) {
                        trace('html loaded...', TraceLevel.INFO);
                        processHtml(data);
                    },
                    error: function (data) {
                        trace('!!!Error loading HTML!!! from ' + SU_BaseUrlServiceHttp + 'WidgetContentService.ashx', TraceLevel.ERROR);
                    }
                });
            }
        });
    }

    function processHtml(data) {
        var html = $('<span>').attr("id", "su_w_temp").html(data.Data);

        if (CWS.originalSettings.IsCustomHtmlUsed) { // need to replace the loading and initial state with custom html
            var newHtml = $(CWS.originalSettings.CustomInitHtmlCssFile);
            $('#su_w_s_loader', html).remove();
            $('#su_w_s_cta', html).remove();
            $(html).prepend(newHtml);
            if ($('#su_w_s_cta_search_input', $(html)).length > 0) {
                $('#su_w_s_cta_search_input', $(html)).attr('tab-index', '-1');
            }
        }

        $('#su_w_s_loader').remove();
        $('#su_w_s_widget').html($('#su_w_s_widget').html() + $(html).html());
        $('#su_w_s_loader').show();

        if ($('#su_w_s_cta_search_input').length > 0) {
            $('#su_w_s_cta_search_input').bind('focus touchstart', function (e) {
                v3HoverIn(e, true);
            });
        }

        if (typeof (informContainer) !== 'undefined') {
            informContainer();
        }

        // html processing, prepare template for each row
        CWS.templates.defaultCategoryTemplate = $('#su_w_s_filter_list li:first').remove();
        CWS.templates.searchResultCategoriesTemplate = $('#su_w_s_suggestion_list_popular_filter li:first').clone(false);
        CWS.templates.searchResultContactRowTemplate = $('#su_w_s_search_content_list li:first').clone(false);
        CWS.templates.searchResultSuggestionTemplate = $('#su_w_s_suggestion_list_spell_filter li:first').clone(false);
        CWS.templates.siteSearchRowTemplate = $('#su_w_s_site_search_content_list li:first').clone().removeClass('su_even su_odd');
        CWS.templates.searchResultSendMail = $('.su_action_message', CWS.templates.searchResultContactRowTemplate).remove();
        CWS.templates.searchResultPhoneCall = $('.su_action_call', CWS.templates.searchResultContactRowTemplate).remove();
        CWS.templates.discoveryAdResultTemplate = $('#su_w_s_discovery_content_list li.su_w_s_discovery_item_data_card.widget_zoomd_ads').remove();
        CWS.templates.discoveryResultTemplate = $('#su_w_s_discovery_content_list li:first').remove();

        if (typeof CWS.originalSettings.LinksTargetTop == 'undefined' || CWS.originalSettings.LinksTargetTop == null) {
            CWS.originalSettings.LinksTargetTop = false;
        }
        $(CWS.templates.searchResultContactRowTemplate).find('a').attr('target', CWS.originalSettings.LinksTargetTop ? "_top" : "_blank");
        $(CWS.templates.siteSearchRowTemplate).find('a').attr('target', CWS.originalSettings.LinksTargetTop ? "_top" : "_blank");
        $(CWS.templates.discoveryResultTemplate).find('a').attr('target', CWS.originalSettings.LinksTargetTop ? "_top" : "_blank");
        CWS.flags.htmlLoaded = true;

        // set banners
        hideElement($('#su_w_s_banner_wrapper'));
        hideElement($('#su_w_s_small_banner'));
        hideElement($('#su_w_s_big_banner'));

        if (CWS.originalSettings.Banners != null && typeof (CWS.originalSettings.Banners) != 'undefined') {
            setBanners(CWS.originalSettings.Banners, true);
            showElement($('#su_w_s_small_banner'));
        } else {
            setBanners(null, true);
        }

        processDiscoveryResults();

        if (CWS.flags.scriptsLoaded) allWidgetStuffLoaded();
    }

    function scrollToSelectedResult(animationDuration) {
        var selectedLi = $('#su_w_s_search_content_wrapper .su_selected');
        if (selectedLi.length > 0) {
            scrollToSearchResultNumber($(selectedLi).attr('row'), $(selectedLi).attr('resulttype'), animationDuration, null);
        }
    }
    function scrollToSearchResultNumber(resultId, resultType, animationDuration, callback) {
        var scrollTo = $("#search_result_id_" + resultId).offset().top - $('#su_w_s_search_content_list').offset().top;

        $('#su_w_s_widget').stop(false, true);
        $('#su_w_s_search_content_wrapper').stop(false, false).animate({
            scrollTop: scrollTo
        }, animationDuration, function () {
            trace('scrolled to item:' + resultId, TraceLevel.DEBUG);
            if (typeof (callback) == "function") callback();
        });
    }
    function scrollToTop(animationDuration, callback) {
        var scrollTo = 0;

        $('#su_w_s_widget').stop(false, true);
        $('#su_w_s_search_content_wrapper').stop(false, false).animate({
            scrollTop: scrollTo
        }, animationDuration, function () {
            trace('scrolled to top', TraceLevel.DEBUG);
            if (typeof (callback) == "function") callback();
        });
    }
    /*-------end of loadWidget-----*/
    function disableSelection(target, bind) {
        var txt = $('#su_w_s_search_input').val();
        if (bind) {
            target.addClass('drag');
            $('#su_w_s_search_input').val(txt);
        } else {
            target.removeClass('drag');
        }
    }

    // event listener for all script loaded
    function allScriptsLoaded() {
        trace('allScriptsLoaded', TraceLevel.DEBUG);
        CWS.curState = WidgetState.INITIAL;
        CWS.flags.scriptsLoaded = true;
        if (CWS.flags.htmlLoaded) allWidgetStuffLoaded();
    }

    function allWidgetStuffLoaded() {

        trace('allWidgetStuffLoaded', TraceLevel.INFO);

        if (CWS.flags.ie8) {
            $(document.documentElement).addClass('su_ie8');
        }
        if (CWS.flags.ie7) {
            $(document.documentElement).addClass('su_ie7');
        }

        if (CWS.originalSettings.PlaceHolder && CWS.originalSettings.PlaceHolder != '') {
            $('#su_w_s_search_input').attr('placeholder', CWS.originalSettings.PlaceHolder);
            $('#su_w_s_cta_content .su_w_s_cta_text, #su_top_title_text').text(CWS.originalSettings.PlaceHolder);
        } else {
            CWS.originalSettings.PlaceHolder = $('#su_w_s_search_input').attr('placeholder');
        }
        if (CWS.originalSettings.DiscoveryCaption && CWS.originalSettings.DiscoveryCaption != ''){
            $('#su_w_s_sub_title_discovery').text(CWS.originalSettings.DiscoveryCaption);
        }

        if (CWS.flags.ie9 || CWS.flags.ie8 || CWS.flags.ie7) {
            $('#su_w_s_widget [placeholder]').placeholder();
        }

        bindHoverEvents(true);
        bindCloseButtonEvents();
        bindBannerEvents();

        $('#su_w_s_widget').width(CWS.originalSettings.InitialWidth);
        if (CWS.originalSettings.IsCustomHtmlUsed) {
            sendMessageToParent('SetSize,' + ($('#su_w_s_cta').outerWidth(true) + CWS.iFrameMargin) + ',' + ($('#su_w_s_cta').outerHeight(true) + CWS.iFrameMargin) + ',' + 0);
            $('#su_w_s_widget').width($('#su_w_s_cta').outerWidth(true));
        }
        else {
            sendMessageToParent('SetSize,' + (CWS.originalSettings.InitialWidth + CWS.iFrameMargin) + ',' + ($('#su_w_s_cta').outerHeight(true) + CWS.iFrameMargin) + ',' + 50);
        }

        // kill parent loading
        sendMessageToParent('destroyLoading');

        $('#su_w_s_widget').removeClass('su_w_s_loading');
        hideElement($('#su_w_s_loader'));
        //Check that images were loaded before setting size
        var images = $('#su_w_s_cta').find('img');
        if (images.length > 0) {
            images.one('load', function () {
                sendMessageToParent('SetSize,' + ($('#su_w_s_cta').outerWidth(true) + CWS.iFrameMargin) + ',' + ($('#su_w_s_cta').outerHeight(true) + CWS.iFrameMargin) + ',' + 0);
            });
        }

        $('#su_w_s_search_input').focus(function () {
            $('#su_w_s_search_input_wrapper').addClass('su_w_s_focus');
            sendMessageToParent('Focused');
            if (!CWS.flags.ie7 && !CWS.flags.ie8 && !CWS.flags.ie9) {
                $('#su_w_s_search_input').attr('placeholder', '');
            } else {
                if ($('#su_w_s_search_input').val() == CWS.originalSettings.PlaceHolder) {
                    $('#su_w_s_search_input').val('').removeClass('placeholder');
                }
            }
        });
        $('#su_w_s_search_input').blur(function () {
            sendMessageToParent('Blured');
            $('#su_w_s_search_input_wrapper').removeClass('su_w_s_focus');
            if (!CWS.flags.ie7 && !CWS.flags.ie8 && !CWS.flags.ie9) {
                $('#su_w_s_search_input').attr('placeholder', CWS.originalSettings.PlaceHolder);
            }
            else {
                if ($('#su_w_s_search_input').val() == '') {
                    $('#su_w_s_search_input').val(CWS.originalSettings.PlaceHolder).addClass('placeholder');
                }
            }
        });

        $('#logo_bottom a').click(function (ev) {
            var a = $(ev.target).closest('a');
            var itemType = $.trim($(a).text());
            logAction('clickOnLogo', itemType, '', '', '', itemType, $(a).attr('href'), 0, 0);
        });

        bindKeyBoardNavigation();
        widgetReady = true;
        showReadyState(true);
        addBindingsToSearchField();

        // bind close button event
        $('#su_w_s_close_btn').click(function () {
            SphereUp.SphereUpWidget.minimizeWidget();
        });
        if (CWS.originalSettings.AllowSorting) {
            $("#su_w_s_widget").addClass("allowSorting");
            if (!CWS.originalSettings.SortOn || CWS.originalSettings.SortOn.length < 1) {
                CWS.originalSettings.SortOn = "date";
            }
            var sortLiItem = $(".su_w_s_sorting_box .su_w_s_hint_item.sort_label[data-sort-label='" + CWS.originalSettings.SortOn + "']").addClass("active");
            sortLiItem.parent().prepend(sortLiItem);

            
            addSortEvents();
        }
    }

    function bindBannerEvents() {
        // log banners clicks
        $('#su_w_s_small_banner_contnet, #su_w_s_big_banner_contnet').click(function () {
            var ban = $('#su_w_s_big_banner_contnet');
            logAction('clickOnBanner', 'Banner', '', $(ban).data('AdGroupId'), $(ban).data('BannerName'), $('img', ban).attr('src'), $(ban).attr('href'), 0, 0);
        });
    }

    //////// V3 - functions //////
    function v3HoverIn(e, shouldSetFocus, callback, skipDiscovery) {
        //most probebly this is fixing the double opener because the footer is not showed befor expand of the widget
        showElement($('#su_w_s_logo_wrapper'));
        trace('v3HoverIn', TraceLevel.DEBUG);
        if (typeof ($('#su_w_s_cta').data('original-height')) == "undefined") { // save original height
            $('#su_w_s_cta').data('original-height', $('#su_w_s_cta').height());
        }

        if (CWS.curState !== WidgetState.EXPANDED || CWS.reverseTransition) {
            CWS.reverseTransition = false;
            if (CWS.curState == WidgetState.INITIAL && !CWS.originalSettings.IsCustomHtmlUsed) {
                hideElement($('#su_w_s_logo_wrapper'));
                $('#su_w_s_cta_content').hide();

                var width = 300;
                sendMessageToParent('SetSize,' + (width + CWS.iFrameMargin) + ',' + Math.max($('#su_w_s_widget').height(), $('#su_w_s_cta').height()) + ',' + 200);
                $('#su_w_s_widget').stop(true, true).animate({
                    width: width
                }, 200, function () { //$('#su_w_s_widget').width('');
                });

                //temporary fix widget height
                $('#su_w_s_widget').height($('#su_w_s_widget').height());
                $('#su_w_s_cta').addClass(openAnimationRunning);
                $('#su_w_s_cta').stop(true, false).animate({
                    height: 24
                }, 200, function () {
                    $('#su_w_s_widget').height('');
                    v3HoverInContinue(e, shouldSetFocus, callback, skipDiscovery);
                });
            }
            else {
                v3HoverInContinue(e, shouldSetFocus, callback, skipDiscovery);
            }
        }
        else {
            if (shouldSetFocus == true) {
                $('#su_w_s_search_input').focus();
            }
            if ($.isFunction(callback)) callback();
        }
    }
    function addInitialStateIframe() {
        if ($('#initialStateAdWrapper')[0]) {
            $('#initialStateAdWrapper').remove();
        }
        $('#su_w_s_search_content_wrapper').show();
        $('#su_w_s_site_search_content_list, #su_w_s_search_content_list, #su_w_s_discovery_content_list').hide();
        var divParent = $('<div class="" id="initialStateAdWrapper" style="height: ' + widget_ads.ads.initialState_ad_height + '"></div>');
        var url = SphereUp.SphereUpWidget.getActionSearchUrl('MD');
        $('<iframe class="su_w_s_search_content_item widget_zoomd_ads" width="100%" height="100%" src="' + url + '" style="width:100%;height: 100%;" frameborder="0" scrolling="no" ></iframe>').prependTo(divParent);

        $('#su_w_s_results_wrapper').append(divParent);
    }
    function v3HoverInContinue(e, shouldSetFocus, callback, skipDiscovery) {
        var newState = CWS.curState;
        var newHeight = 0;
        var sendHeight = 0;
        var sendWidth = 0;
        var showBanner = false;
        hideElement($('#su_w_s_cta'));
        $('#su_w_s_cta').height($('#su_w_s_cta').data('original-height'));

        // hide for animation
        if (CWS.curState == WidgetState.INITIAL) {
            /*we could not use the hideElement here (this could prevent a bug )!*/
            //hideElement($('#su_w_s_logo_wrapper'));
            /*end*/
            $('#su_w_s_results_wrapper').show().css('opacity', 0);
            CWS.times.hoverIn = new Date().getTime();
            logAction('hoverIn', '', '', '', '', '', '', 0, (CWS.times.hoverIn - CWS.times.loadedTime) / 1000);
            sendMessageToParent('event{"event": "zoomdSearch:opened"}');
        }

        $('#su_w_s_widget').removeClass('su_w_s_ready').removeClass('su_w_s_loading').removeClass('su_w_s_custom_cta').addClass('su_w_s_active');
        if (!hasQueryDefined()) {
            hideElement($('#su_w_s_results_indication_text'));
        }
        $('#su_w_s_widget').width('');
        $('#su_w_s_widget').css('max-width', 'none');

        if (!CWS.flags.forceDisplay && !hasQueryDefined()) {
            if (CWS.loadedDiscovery && CWS.originalSettings.EnableDiscovery) {
                if (!skipDiscovery) {//If we came from search command, do not show discovery
                    $('#su_w_s_results_wrapper').removeClass('su_w_s_results').removeClass('su_w_s_categories_hint').removeClass('su_w_s_spell_hint').addClass('su_w_s_discovery');
                    if (CWS.curState < WidgetState.DISCOVERY) {
                        //temporary hide discovery until animation completes
                        hideElement($('#su_w_s_discovery_content_list'));
                    }
                }
                else {
                    $('#su_w_s_results_wrapper').removeClass('su_w_s_results').removeClass('su_w_s_discovery');
                }
                newState = WidgetState.DISCOVERY;

                // save original height for animation
                if (typeof ($('#su_w_s_results_wrapper').data('original-height-init')) == "undefined") {
                    $('#su_w_s_results_wrapper').data('original-height-init', $('#su_w_s_results_wrapper').height());
                }

            }
            else {
                generateDefaultCategories(CWS.originalSettings.DefaultCategories, FilterType.DefaultCategory);
                hideElement($('#su_w_s_banner_wrapper'));

                // save original height for animation
                if (typeof ($('#su_w_s_results_wrapper').data('original-height-init')) == "undefined") {
                    $('#su_w_s_results_wrapper').data('original-height-init', $('#su_w_s_results_wrapper').height());
                }

                $('#su_w_s_widget').removeClass(CWS.originalSettings.ExpandedClass)
                newHeight = $('#su_w_s_results_wrapper').data('original-height-init');
                sendWidth = $('#su_w_s_results_wrapper').outerWidth(true) + CWS.iFrameMargin;
                $('#su_w_s_widget').css('max-width', '');
                sendHeight = $('#su_w_s_results_wrapper').data('original-height-init') + $('#su_w_s_logo_wrapper').height() + CWS.iFrameMargin;
                //for initial state Ad
                if (CWS.curState == WidgetState.INITIAL && widget_ads.isInitAdOn()) {
                    addInitialStateIframe();
                    var addHeight = parseInt($('#initialStateAdWrapper').outerHeight(true));
                    sendHeight += isNaN(addHeight) ? 0 : addHeight;
                }
                sendMessageToParent('SetSize,' + sendWidth + ',' + sendHeight + ',' + 200);

                newState = WidgetState.HOVER;
            }
        }
        else {
            showBanner = true;

            // save original height for animation
            if (typeof ($('#su_w_s_results_wrapper').data('original-height-init')) == "undefined") {
                $('#su_w_s_results_wrapper').data('original-height-init', $('#su_w_s_results_wrapper').height());
            }

            $('#su_w_s_results_wrapper').removeClass('su_w_s_discovery').addClass('su_w_s_results');
            if (!$('#su_w_s_search_content_box_no_results_msg')) {
                showElement($('#su_w_s_results_indication_text'));
            }
            if (CWS.curState != WidgetState.SEARCHRESULTS) {
                if ($('#su_w_s_banner_wrapper').attr('hasBanner') == '1') {
                    hideElement($('#su_w_s_big_banner'));
                    showElement($('#su_w_s_small_banner'));
                    showElement($('#su_w_s_banner_wrapper'));
                }
            }
            newState = canEnterState(WidgetState.SEARCHRESULTS) ? WidgetState.SEARCHRESULTS : WidgetState.EXPANDED;
        }
        if (newState != WidgetState.HOVER) {
            sendMessageToParent('showOverlayV3');
            var hintingBoxHeight = $('#su_w_s_hinting_box').is(':visible') && $('.category_hint').length > 0 ? $('#su_w_s_hinting_box').outerHeight(true) : 0;
            newHeight = calcMaxHeight(newState) - $('#su_w_s_top_bar').outerHeight(true) - $('#su_w_s_search_input_flexi_width').outerHeight(true) - $('#su_w_s_indication_row').outerHeight(true) - hintingBoxHeight - $('#su_w_s_logo_wrapper').outerHeight(true) - $('#su_w_s_banner_wrapper').outerHeight(true);
            $('#su_w_s_search_content_wrapper').height(newHeight);
            newHeight = calcMaxHeight(newState) - $('#su_w_s_logo_wrapper').outerHeight(true) - $('#su_w_s_banner_wrapper').outerHeight(true);

            sendWidth = $('#su_w_s_results_wrapper').outerWidth(true) + CWS.iFrameMargin;
            $('#su_w_s_widget').css('max-width', '');
            sendHeight = calcMaxHeight(newState) + CWS.iFrameMargin;
            if (!$('#su_w_s_banner_wrapper').is(":visible")) {
                sendHeight -= 88;// this banner's height is hardcoded by default
            }
            if (widget_ads.ads.footer_ad) {
                sendHeight += parseInt(widget_ads.ads.footer_ad_height);
            }
            sendMessageToParent('SetSize,' + sendWidth + ',' + sendHeight + ',' + 200);
        }

        if (CWS.curState == WidgetState.INITIAL) {
            $('#su_w_s_top_bar_title').hide();
        }
        if (CWS.curState != newState || $('#su_w_s_widget').hasClass(closeAnimationRunning)) {
            $('#su_w_s_widget').removeClass(closeAnimationRunning);
            if (CWS.flags.isIE) $('#su_w_s_widget').css('box-shadow', '0px 0px 0px 0px');
            $('#su_w_s_cta').removeClass(openAnimationRunning);
            if (CWS.curState == WidgetState.INITIAL && newState > WidgetState.HOVER) {
                $('#su_w_s_results_wrapper').height(24);
            }

            //onOpen widget add initialState ad
            if (CWS.curState == WidgetState.INITIAL && widget_ads.isInitAdOn()) {
                var addedHeight = parseInt($('#initialStateAdWrapper').outerHeight(true));
                newHeight = (parseInt(newHeight) + (isNaN(addedHeight) ? 0 : addedHeight)) + 'px';
            }
            $('#su_w_s_results_wrapper').show().css('opacity', 1).addClass(openAnimationRunning);
            if (showBanner) {
                $('#su_w_s_banner_wrapper').css('opacity', 0);
            }

            if (newState == WidgetState.EXPANDED || newState == WidgetState.DISCOVERY) {
                transitionToExpandedState(newState, function () {
                    HoverInComplete(showBanner, sendHeight, newState, shouldSetFocus, callback);
                });
            }
            else {
                if ((CWS.curState == WidgetState.SEARCHRESULTS || CWS.curState == WidgetState.EXPANDED) && newState == WidgetState.HOVER && widget_ads.isInitAdOn()) {
                    addInitialStateIframe();
                    var adHeight = parseInt($('#initialStateAdWrapper').outerHeight(true));
                    newHeight = (parseInt(newHeight) + (isNaN(adHeight) ? 0 : adHeight)) + 'px';
                }
                $('#su_w_s_results_wrapper').stop(false, false).animate({
                    height: newHeight
                }, 200, function () {
                    showLoading(false);
                    HoverInComplete(showBanner, sendHeight, newState, shouldSetFocus, callback);
                });
            }
        }
        else {
            if (shouldSetFocus == true) {
                $('#su_w_s_search_input').focus();
            }
            trace('v3HoverIn animation skipped - same state ' + CWS.curState, TraceLevel.DEBUG);
            if ($.isFunction(callback)) callback();
        }
    }

    function HoverInComplete(showBanner, sendHeight, newState, shouldSetFocus, callback) {
        trace('v3HoverIn animation completed', TraceLevel.DEBUG);

        $('#su_w_s_widget').css('box-shadow', '');
        $('#su_w_s_widget').width('');
        $('#su_w_s_top_bar_title').show();
        showElement($('#su_w_s_logo_wrapper'));
        if (showBanner) {
            $('#su_w_s_banner_wrapper').css('opacity', 1);
        }
        var sendWidth = $('#su_w_s_results_wrapper').outerWidth(true) + CWS.iFrameMargin;
        if (CWS.curState != WidgetState.INITIAL && newState == WidgetState.HOVER) {
            var height = ($('#su_w_s_results_wrapper').data('original-height-init') + $('#su_w_s_logo_wrapper').height() + CWS.iFrameMargin);
            if (widget_ads.isInitAdOn()) {
                addInitialStateIframe();
                var adHeight = parseInt($('#initialStateAdWrapper').outerHeight(true));
                height += isNaN(adHeight) ? 0 : adHeight;
            }
            sendMessageToParent('SetSize,' + sendWidth + ',' + height + ',' + 0);
        }
        else if (newState == WidgetState.HOVER) {
            sendMessageToParent('SetSize,' + sendWidth + ',' + sendHeight + ',' + 0);
        }
        else if (newState == WidgetState.DISCOVERY) {
            $('#su_w_s_discovery_content_list').attr('aria-hidden', false).css('display', '').css('visibility', 'hidden');
            generateDicoveryAds();
            fixCustomEllipsis($('.su_discovery_title', $('#su_w_s_discovery_content_list')), $('.su_discovery_title:first :first-child', $('#su_w_s_discovery_content_list')).prop("tagName"));
            $('#su_w_s_discovery_content_list').css('visibility', '');
            logAction('firstPageSearchAndRendered', '', 'widgetCollapsed', '', '', '', '', 0, (new Date().getTime() - CWS.times.hoverIn) / 1000);
        }
        CWS.curState = newState;
        fixSearchResultTitle();
        $('#su_w_s_results_wrapper').removeClass(openAnimationRunning);
        if (shouldSetFocus == true) {
            $('#su_w_s_search_input').focus();
        }
        if ($.isFunction(callback)) callback();
    }

    function calcMaxHeight(newState) {
        return (CWS.curState == WidgetState.EXPANDED || newState == WidgetState.EXPANDED || newState == WidgetState.DISCOVERY ? CWS.maxExpandedHeight : CWS.maxHeight);
    }

    function v3HoverOut(e) {
        trace('v3HoverOut', TraceLevel.DEBUG);
        if (!ON && CWS.curState != WidgetState.INITIAL && (typeof ($('#su_w_s_results_wrapper').data('original-height-init')) !== "undefined") && $('#su_w_s_search_input:focus').length == 0 && $('#su_w_s_results_wrapper.su_w_s_results').length == 0 && $('#su_w_s_results_wrapper.su_w_s_discovery').length == 0 && !hasQueryDefined()) {

            hideElement($('#su_w_s_logo_wrapper'));
            hideElement($('#su_w_s_banner_wrapper'));

            if (CWS.flags.isIE) $('#su_w_s_widget').css('box-shadow', '0px 0px 0px 0px');
            $('#su_w_s_widget').addClass(closeAnimationRunning);
            $('#su_w_s_results_wrapper').stop(true, false).animate({
                height: 24
            }, 200, function () {
                if (CWS.originalSettings.IsCustomHtmlUsed) {
                    $('#su_w_s_widget').addClass('su_w_s_custom_cta');
                }
                $('#su_w_s_widget').removeClass('su_w_s_active').addClass('su_w_s_ready');
                $('#su_w_s_results_wrapper').removeClass('su_w_s_results').removeClass('su_w_s_discovery');
                $('#su_w_s_results_wrapper').hide();
                if (!CWS.originalSettings.IsCustomHtmlUsed) {
                    showElement($('#su_w_s_cta').height(24));
                    $('#su_w_s_cta').stop(true, false).animate({
                        height: $('#su_w_s_cta').data('original-height')
                    }, 200, function () {
                        trace('v3HoverOut animation completed', TraceLevel.DEBUG);
                        $('#su_w_s_widget').css('box-shadow', '');
                        $('#su_w_s_cta_content').show();
                        sendMessageToParent('SetSize,' + ($('#su_w_s_cta').outerWidth(true) + CWS.iFrameMargin) + ',' + ($('#su_w_s_cta').outerHeight(true) + CWS.iFrameMargin));
                        $('#su_w_s_widget').removeClass(closeAnimationRunning);
                        CWS.curState = WidgetState.INITIAL;
                    });
                } else {
                    showElement($('#su_w_s_cta').height($('#su_w_s_cta').data('original-height')));
                    $('#su_w_s_widget').css('box-shadow', '');
                    $('#su_w_s_cta_content').show();
                    sendMessageToParent('SetSize,' + ($('#su_w_s_cta').outerWidth(true) + CWS.iFrameMargin) + ',' + ($('#su_w_s_cta').outerHeight(true) + CWS.iFrameMargin) + ',' + 0);
                    $('#su_w_s_widget').removeClass(closeAnimationRunning);
                    CWS.curState = WidgetState.INITIAL;
                }

                $('#su_w_s_widget').stop(true, false).animate({
                    width: CWS.originalSettings.InitialWidth
                }, 200);
                sendMessageToParent('collapseV3');
                sendMessageToParent('event{"event": "zoomdSearch:closed"}');
            });
            logAction('hoverOut', '', '', '', '', '', '', 0, 0);
        } else {
            trace('input focused no hover out', TraceLevel.DEBUG);
        }
    }

    function showReadyState(ind) {
        trace('showReadyState', TraceLevel.DEBUG);
        hideElement($('#su_w_s_logo_wrapper'));
        hideElement($('#su_w_s_banner_wrapper'));
        $('#su_w_s_widget').removeClass(CWS.originalSettings.ExpandedClass);
        if ($('#su_w_s_search_content_wrapper .su_w_s_expand').length > 0)
            sendMessageToParent('event{"event": "zoomdSearch:resultCollapsed"}');
        $('#su_w_s_search_content_wrapper .su_w_s_expand').removeClass('su_w_s_expand');
        closeSendMail(-1);
        closePhoneCall(-1);
        var text = $('#su_w_s_search_content_wrapper .contact_expand_btn .su_hc:first').attr('expand');
        $('#su_w_s_search_content_wrapper .contact_expand_btn .su_hc').text(text);
        $('#su_w_s_cta_content').show();

        if (CWS.originalSettings.IsCustomHtmlUsed) {
            $('#su_w_s_widget').addClass('su_w_s_custom_cta');
        }
        if (CWS.curState > WidgetState.INITIAL) {
            $('#su_w_s_results_wrapper').hide();
            showElement($('#su_w_s_cta'));
            $('#su_w_s_widget').width(CWS.originalSettings.InitialWidth);
            if (CWS.originalSettings.IsCustomHtmlUsed) {
                sendMessageToParent('SetSize,' + ($('#su_w_s_cta').outerWidth(true) + CWS.iFrameMargin) + ',' + ($('#su_w_s_cta').outerHeight(true) + CWS.iFrameMargin) + ',' + 0);
                $('#su_w_s_widget').width($('#su_w_s_cta').outerWidth(true));
            }
            else {
                sendMessageToParent('SetSize,' + (CWS.originalSettings.InitialWidth + CWS.iFrameMargin) + ',' + ($('#su_w_s_cta').outerHeight(true) + CWS.iFrameMargin) + ',' + 50);
            }
            CWS.curState = WidgetState.INITIAL;
            sendMessageToParent('event{"event": "zoomdSearch:closed"}');
        }
        $('#su_w_s_widget').removeClass('su_w_s_active').addClass('su_w_s_ready');
    }

    function bindHoverEvents(bind) {
        trace('bindHoverEvents=' + bind, TraceLevel.DEBUG);
        if (bind) {

            $('#su_w_s_cta').unbind('mouseenter touchstart click');
            $('#su_w_s_cta').bind('mouseenter touchstart click', function (e) {
                CWS.EntryPoint = e.originalEvent.type;
                v3HoverIn(e);
            });
            $('#su_w_s_widget').unbind('mouseenter touchstart');
            $('#su_w_s_widget').bind('mouseenter touchstart', function (e) {
                if (typeof $('#su_w_s_widget').data('timeoutId') !== 'undefined')
                    clearTimeout($('#su_w_s_widget').data('timeoutId'));
            });
            $('#su_w_s_widget').unbind('mouseleave');
            $('#su_w_s_widget').bind('mouseleave', function (e) {
                var timeoutId = setTimeout(function () {

                    v3HoverOut(e);

                }, CWS.flags.ie7 ? 2000 : 600);
                $('#su_w_s_widget').data('timeoutId', timeoutId);
            });
        } else {

            $('#su_w_s_cta').unbind('mouseenter touchstart');
            $('#su_w_s_widget').unbind('mouseleave');
        }
    }
    function bindCloseButtonEvents() {
        $('#su_w_s_close_btn').bind('mouseenter touchstart', function (e) {
            // Need to unbind hover out for 1-2 sec (so user will be able to leave the area) and close the results
            bindHoverEvents(false);
        });
        $('#su_w_s_close_btn').bind('mouseleave', function (e) {
            setTimeout(function () {
                bindHoverEvents(true);
            }, 2000);
        });
    }

    function addSortEvents() {
        $(document).on("click", ".su_w_s_sorting_box .sort_label", function (e) {
            $(".sort_label.active").removeClass("active");
            $(this).addClass("active");
            CWS.originalSettings.SortOn = $(this).data("sort-label");
            //var input = $('#su_w_s_search_input');
            //input.trigger("");
            //$('#su_w_s_search_input').keyup();

            var searchText = $('#su_w_s_search_input').val();
            //$('#su_w_s_search_input').val(searchText);
            $('#su_w_s_search_input').trigger('keyup', [searchText, 0, 0]);
        });
    };
    //////////////////// V3 - BINDINGS /////////////////
    var ON = false;
    var startx, starty;
    $(document).on('keyup', document, function (e) {
        var code = e.keyCode || e.which;
        if (code == 27) { //escape keycode

            CWS.EntryPoint = null;
            SphereUp.SphereUpWidget.minimizeWidget();
            return;
        }
    });

    $(document).on('mouseup', document, function (e) {
        ON = false;
        disableSelection($('#su_w_s_results_wrapper,#su_w_s_title_bar'), false);
    });

    $(document).on('click', '.su_w_s_gen_wrapper > *', function (e) {
        e.preventDefault();
    });
    $(document).on('mouseenter', 'body', function (e) {
        //if (CWS.curState == WidgetState.SEARCHRESULTS || CWS.curState == WidgetState.EXPANDED) {
        //sendMessageToParent('showOverlayV3');
        //}
        $(this).data('timerStart', new Date().getTime());
        checkLogExposure();
    });
    $(document).on('mouseleave', 'body', function (e) {
        if (typeof $(this).data('timerStart') != 'undefined' && $(this).data('timerStart') != null) {
            var t = new Date().getTime() - $(this).data('timerStart');
            var sec = 0;
            try { sec = t / 1000; }
            catch (e) { sec = 0; }
            logAction('widgetMouseOver', '', (CWS.curState == WidgetState.EXPANDED ? 'widgetExpanded' : 'widgetCollapsed'), '', '', '', '', 0, sec);
            //sendMessageToParent('hideOverlayV3');
            $(this).data('timerStart', null);
        }
        checkLogExposure();
    });

    $(document).on('click', '#su_w_s_search_input', function (e) {
        var widgetState = ($('#su_w_s_widget').hasClass(CWS.originalSettings.ExpandedClass) ? 'widgetExpanded' : 'widgetCollapsed');
        logAction('clickOnSearchBox', '', widgetState, '', '', '', '', 0, 0);
    });

    function clearSelectedCategory() {
        $('#su_w_s_filter_list li.active').removeClass('active');
    }

    function addBindingsToSearchField() {
        trace('addBindingsToSearchField', TraceLevel.DEBUG);
        var input = $('#su_w_s_search_input');
        input.unbind('keyup');
        var keyup = input.keyupAsObservable()
            .map(function (ev) {
                //if($('#su_ads_under_footer')[0]){
                //    $('#su_ads_under_footer').remove();
                //}
                var suffix = ev.additionalArguments.length > 1 ? getNextSuffix() : '';
                var searchTerm = ev.target.value.length > 0 ? ev.target.value : ">*";
                if (ev.additionalArguments.length == 2) { //category
                    if ($('#su_w_s_filter_list .su_w_s_hint_item.active').length > 0) {
                        var cat = (ev.additionalArguments[0].indexOf('(') < 0) ? ev.additionalArguments[0] : ev.additionalArguments[0].substring(0, ev.additionalArguments[0].indexOf('('));
                        var idx = ev.additionalArguments[1];
                        logAction('searchBy', 'Category', (CWS.curState == WidgetState.EXPANDED ? 'widgetExpanded' : 'widgetCollapsed'), cat, cat, '', '', idx, 0);
                    }
                    else if (ev.target.value.length == 0) {
                        searchTerm = '';
                        suffix = '';
                    }
                }
                else if (ev.additionalArguments.length == 3) { // search from admin
                    CWS.flags.lastTerm = ''; // to raize the search anyway
                    if (ev.target.value.length <= 0) { // maybe default or empty keyword
                        //TODO: Change if need indication search from Admin - default/empty keywords
                        //logAction('searchBy', 'Text', (CWS.curState == WidgetState.EXPANDED ? 'widgetExpanded' : 'widgetCollapsed'), ev.target.value, ev.target.value, '', '', 0, 0);
                        CWS.flags.forceDisplay = true;
                    }
                }
                else if (ev.target.value.length > 0) { //text, clear categories
                    logAction('searchBy', 'Text', (CWS.curState == WidgetState.EXPANDED ? 'widgetExpanded' : 'widgetCollapsed'), ev.target.value, ev.target.value, '', '', 0, 0);
                }
                else {
                    return '';
                }
                return searchTerm + suffix;
            }).filter(function (text) {
                var actualTerm = $.trim(text);
                var categoryArr = [];

                if ($('#su_w_s_cta_search_input').length > 0 && actualTerm != ">*") {
                    $('#su_w_s_cta_search_input').val(actualTerm); // adding mirroring for search box
                }

                // check if changed search criteria
                if (((CWS.flags.lastTerm.indexOf(actualTerm) == -1 && actualTerm.indexOf(CWS.flags.lastTerm) == -1) || actualTerm.length <= 0 && CWS.flags.lastTerm.length > 0) && actualTerm != CWS.originalSettings.PlaceHolder) {
                    clearSelectedCategory();
                }
                if (CWS.flags.lastTerm.length == 0 && actualTerm.length >= 1 && actualTerm != CWS.originalSettings.PlaceHolder && actualTerm != ">*") {
                    clearSelectedCategory();
                }
                categoryArr = getSelectedCategories();
                if (CWS.flags.lastTerm == actualTerm && ($(CWS.flags.lastCategories).not(categoryArr).length == 0 && $(categoryArr).not(CWS.flags.lastCategories).length == 0)) { // check for double search
                    if (CWS.originalSettings.AllowSorting && (CWS.flags.lastSortOn != CWS.originalSettings.SortOn)) {
                        return false;
                    }
                    return false;
                }
                return true;
            }).throttle(500).distinctUntilChanged();

        var searcher = keyup.map(function (text) {
            // fix for placeholder
            if ($.trim(text) == $.trim(CWS.originalSettings.PlaceHolder)) {
                text = '';
            }
            if (($.trim(text) == '' || text == '\t') && $('#su_w_s_filter_list .su_w_s_hint_item.active').length == 0) {
                sendMessageToParent('event{"event": "zoomdSearch:search", "searchTerm": ""}');
                var emptyData = getEmptyResult();
                $("#su_w_s_search_content_wrapper").height("0px");
                generateSearchResult(emptyData);
                CWS.flags.lastTerm = '';
                CWS.flags.lastCategories = [];
                setTimeout(addBindingsToSearchField, 10);
                $('#su_ads_under_footer').remove();
                $("#su_w_s_widget #su_w_s_results_wrapper").toggleClass("allow_sorting",false);
                return searcher;
            } else {
                if ($('#initialStateAdWrapper')[0]) {
                    $('#initialStateAdWrapper').remove();
                }
                $('#su_w_s_site_search_content_list, #su_w_s_search_content_list').show();
            }
            if (text != ">*") {// adding mirroring for search box
                sendMessageToParent('event{"event": "zoomdSearch:search", "searchTerm": "' + text + '"}');
            }

            return searchWebContacts(text.substring(0, 1000), null);
        }).switchLatest();

        var subscription = searcher.subscribe(
            function (data) {
                page = 1;
                newSearch = true;
                generateSearchResult(data.data);
                CWS.lastIndexLogged = -1;
            },
            function (error) {
                showErrorMessage(true);
                CWS.lastIndexLogged = -1;
            }
        );

        $('#su_w_s_search_input').unbind('paste').on('paste', function (e) {
            setTimeout(function () {
                $('#su_w_s_search_input').keyup();
            }, 0);
        });
    }

    function searchWebContacts(term, page) {
        var data = {};
        var categoryArr = getSelectedCategories();
        //ONLY FOR Geektime TO DELETE AFTER THE RELEASE 
        // if (CWS.originalSettings.clientId == '82907983' && term.indexOf('"') == -1 && term.length > 1) {
        //     term = '"' + term + '"';
        // }

        CWS.statistics.currentPageNumber = page;
        if (!CWS.originalSettings.Design_Mode) {
            data.url = getCurrentLocationUrl();
        }
        if (CWS.originalSettings.AllowSorting) {
            data.SortOn = CWS.originalSettings.SortOn;
        }
        data = $.extend(data, { accountId: CWS.originalSettings.clientId, query: term, Categories: JSON.stringify(categoryArr), sessionId: CWS.originalSettings.sessionId});

        if (categoryArr.length > 0 && term.length <= 0) term = '>*';

        if (page != null) { // next page
            showLoading(true, true);
            data = $.extend(data, { page: page, moreContactsAvailable: CWS.moreContactsAvailable });
        } else { // first page
            var actualTerm = $.trim(term);
            CWS.siteSearchPage = 0;
            CWS.flags.lastTerm = actualTerm;
            CWS.flags.lastCategories = categoryArr;
            if(CWS.originalSettings.AllowSorting){
                CWS.flags.lastSortOn = CWS.originalSettings.SortOn;
            }
            showLoading(true);
            $('body').data('page_process', new Date().getTime());
        }

        return $.ajaxAsObservable(buildDataObservable(data));
    }

    // common func util's
    function loadMoreContacts(callback) {
        var observe = null;

        if (!CWS.moreContactsAvailable) {
            if (CWS.moreSiteSearchAvailable) {
                CWS.siteSearchPage++;
                page = CWS.siteSearchPage;
            } else {
                return;
            }
        } else {
            CWS.siteSearchPage = 0;
        }

        observe = searchWebContacts(getQueryText(), page++);

        if (observe != null) {
            observe.subscribe(
                    function (data) {
                        if (data.data.Error == null && data.textStatus == "success") { // no exceptions
                            generateSearchResult(data.data, true, callback);
                        } else if (data.data.Error != "Search string is empty") { // error
                            showErrorMessage(true);
                        }
                    }, function (e) {
                        trace(e, TraceLevel.ERROR);
                        showErrorMessage(true);
                    }
                );
        }
        else {
            showLoading(false);
        }
    }

    function getQueryText() {
        var query = $('#su_w_s_search_input').val();
        if ($.trim(query) == $.trim(CWS.originalSettings.PlaceHolder)) {
            query = '';
        }
        return query.substring(0, 1000);
    }

    function buildDataObservable(data) {
        return {
            url: SU_BaseUrlServiceHttp + 'Search',
            data: data,
            contentType: 'application/x-www-form-urlencoded; charset=UTF-8',
            dataType: 'jsonp'
        };
    }

    function showLoading(ind, onlyDown) {
        showNoResultsMsg(false);
        if (ind) {
            //hideElement($('#initialStateAdWrapper'));
            //hideElement($('#su_w_s_search_content_list ul.contact_item_list'));
            //setTimeout(function () {
            $('[aria-live]').attr('aria-busy', true);
            if (!onlyDown) {
                hideElement($('#su_w_s_results_indication_text'));
                $('#initialStateAdWrapper, #su_w_s_sub_title_wrapper, #su_w_s_hinting_box ul, #su_w_s_search_content_wrapper ul, #su_w_s_search_content_list ul.contact_item_list').css('visibility', 'hidden');
                $('#su_w_s_search_input_wrapper .icon').addClass('loading');
                $('#su_w_s_search_input_wrapper .icon img').hide();
                showElement($('#su_w_s_search_content_box_suggestion_loading,#su_w_s_search_content_box_contacts_loading,#su_w_s_search_input_loading'));
            } else {
                showElement($('#su_w_s_search_content_scroll_loading'));
            }
            // }, 100);

        } else {
            $('[aria-live]').attr('aria-busy', false);
            $('#su_w_s_search_input_wrapper .icon').removeClass('loading');
            hideElement($('#su_w_s_search_content_box_suggestion_loading,#su_w_s_search_content_box_contacts_loading,#su_w_s_search_content_scroll_loading,#su_w_s_search_input_loading'));
            $('#su_w_s_search_input_wrapper .icon img').show();
            $('#initialStateAdWrapper, #su_w_s_sub_title_wrapper, #su_w_s_hinting_box ul, #su_w_s_search_content_wrapper ul, #su_w_s_search_content_list ul.contact_item_list').css('visibility', '');
        }
    }

    function makeAd(containerType, currHeight) {
        var url = SphereUp.SphereUpWidget.getActionSearchUrl(containerType);
        var containerTypeAttr = "";
        if (containerType != 'BB') {
            containerTypeAttr = 'containerType="' + containerType + '"';
        }
        var liParent = $('<li class="su_w_s_search_content_item widget_zoomd_ads" ' + containerTypeAttr + ' ></li>');
        $('<iframe class="su_w_s_search_content_item widget_zoomd_ads" src="' + url + '" style="width:100%;height:' + currHeight + ';" frameborder="0" scrolling="no" ></iframe>').prependTo(liParent);

        return liParent;
    };

    //for showing top 2 Ads (SR and footad)
    function generateAdsResult() {
        var currPosition = null,
        newCurrPos = null,
        currHeight = null;
        for (var i = 0; i < widget_ads.ads.search_content_ad_arr.length; i++) {
            currPosition = widget_ads.ads.search_content_ad_arr[i].position;
            currHeight = widget_ads.ads.search_content_ad_arr[i].height ? widget_ads.ads.search_content_ad_arr[i].height : '90px';
            widget_ads.ads.search_ad_noresult_height = [];
            if (currPosition == 0 || currPosition == 1) {
                widget_ads.ads.search_ad_noresult_height.push(currHeight);
            }
            if (currPosition == 0) {
                    $('#su_w_s_search_content_list').prepend(makeAd('SR' + currPosition, currHeight));
            } else {
                if ($('#su_w_s_site_search_content_list > li.su_w_s_site_search_content_item').is(":visible") && $('#su_w_s_search_content_list > li').length < currPosition) {
                    newCurrPos = currPosition - $('#su_w_s_search_content_list > li').length;
                    if ($('#su_w_s_site_search_content_list > li').length >= newCurrPos) {
                        
                        $('#su_w_s_site_search_content_list > li.su_w_s_site_search_content_item:eq(' + (newCurrPos - 1) + ')').after(makeAd('SR' + currPosition, currHeight));

                    } else {
                        $('#su_w_s_search_content_list > li.su_w_s_search_content_item:eq(' + (currPosition - 1) + ')').after(makeAd('SR' + currPosition, currHeight));
                    }
                } else {
                    $('#su_w_s_search_content_list > li.su_w_s_search_content_item:eq(' + (currPosition - 1) + ')').after(makeAd('SR' + currPosition, currHeight));
                }
            }
        };
        if (widget_ads.ads.footer_ad) {
            if ($('#su_ads_under_footer')[0]) {
                $('#su_ads_under_footer').remove();
            }
            $('#su_w_s_widget').append($('<ul id="su_ads_under_footer" containerType="BB"></ul>').append(makeAd('BB', widget_ads.ads.footer_ad_height)));
        }
    }


    var searchContactsIndex = 0;
    function generateSearchResult(data, append, callback) {
        var siteSearchResults = GetSiteSearchObj(data.SiteSearch);
        var siteSearchObj = null;

        if (siteSearchResults != null) {
            siteSearchObj = siteSearchResults.Results;
        }

        showLoading(false);

        // if got results and no search criteria - delete result
        if (!CWS.flags.forceDisplay && !hasQueryTextDefined() && (data.Categories == null || data.Categories.length == 0 || $.grep(data.Categories, function (item, index) { return item.Selected == true; }).length == 0)) {
            try { $('.contact_item_list_expanded_data.masonryApplied').masonry('destroy').removeClass('masonryApplied'); }
            catch (e) { }
            $('#su_w_s_search_content_list li,#su_w_s_site_search_content_list li').remove();

            $('#su_w_s_results_wrapper').removeClass('su_w_s_results').removeClass('su_w_s_discovery');
            data = getEmptyResult();
            if (CWS.curState == WidgetState.EXPANDED) {
                CWS.reverseTransition = true;
                if (!CWS.loadedDiscovery) {
                    $('#su_w_s_widget').removeClass(CWS.originalSettings.ExpandedClass);
                }
                $('#su_w_s_search_content_wrapper .su_w_s_expand').removeClass('su_w_s_expand');
                $('#su_w_s_search_content_wrapper .contact_expand_btn .su_hc').text($('#su_w_s_search_content_wrapper .contact_expand_btn .su_hc:first').attr('expand'));
            }
            if (!CWS.loadedDiscovery) {
                generateDefaultCategories(CWS.originalSettings.DefaultCategories, FilterType.DefaultCategory);
            }
            showLoading(false, false);
            //render on reopen after search
            if (!CWS.asyncFixForCloseWidget) {
                v3HoverIn();
            }
            else {
                CWS.asyncFixForCloseWidget = false;
            }
            if ($.isFunction(callback)) callback();
            return; //todo check for remove
        }

        sendMessageToParent('showOverlayV3');


        if (!append) {
            searchContactsIndex = 0;
            CWS.lastIndexLogged = -1;
            totalContactsShown = (data.Contacts == null) ? 0 : data.Contacts.length;
            // set total results
            var resultsCount = data.TotalContacts;
            if (siteSearchResults != null) {
                resultsCount += Math.min(siteSearchResults.TotalCount, 100);
            }
            else if (data.TotalContacts > 20) {
                resultsCount += '+';
            }
            $('#su_w_s_total_searched_contacts').text(resultsCount);
        } else {
            totalContactsShown += ((data.Contacts == null) ? 0 : data.Contacts.length);
            if ($('#su_w_s_total_searched_contacts').text().indexOf('+') >= 0 && siteSearchResults != null) {
                resultsCount = totalContactsShown + Math.min(siteSearchResults.TotalCount, 100);
                $('#su_w_s_total_searched_contacts').text(resultsCount);
            }
        }

        CWS.moreContactsAvailable = (data.TotalContacts > totalContactsShown);
        CWS.moreSiteSearchAvailable = (CWS.moreContactsAvailable || ((data.Contacts == null || data.Contacts.length < 20) && siteSearchResults != null) && ((typeof (siteSearchResults.NextPageStartIndex) != "undefined") && siteSearchResults.NextPageStartIndex > 0));

        if (!CWS.moreSiteSearchAvailable && $('#su_w_s_total_searched_contacts').text().indexOf('+') >= 0) {
            $('#su_w_s_total_searched_contacts').text($('#su_w_s_total_searched_contacts').text().replace('+', ''));
        }

        // generate hints/suggestions and categories
        if (!append) {
            if (data.Suggestions != null && data.Suggestions.length > 0) {
                generateDefaultCategories(data.Suggestions, FilterType.Suggestion);
            } else if (data.Categories != null && data.Categories.length > 0) {
                generateDefaultCategories(data.Categories, FilterType.Category);
            } else {
                $('#su_w_s_filter_list').empty();
                hideElement($('#su_w_s_filter_list'));
                $('#su_w_s_results_wrapper').removeClass('su_w_s_spell_hint').removeClass('su_w_s_categories_hint');
                $('#su_w_s_sub_title_spell_check').attr('aria-hidden', true);
                $('#su_w_s_sub_title_categories').attr('aria-hidden', true);
            }
        }

        // generate contacts search results
        if (!append) {
            try { $('.contact_item_list_expanded_data.masonryApplied').masonry('destroy').removeClass('masonryApplied'); }
            catch (e) { }
            $('#su_w_s_search_content_list > li,#su_w_s_site_search_content_list > li').remove(); // clear contact list
        }
        if (data.Contacts != null && data.Contacts.length > 0) {
            // hide/show no results msg
            if (!append) { // have data to show
                showElement($('#su_w_s_search_content_wrapper,#su_w_s_results_indication_text'));
                $('#su_w_s_results_wrapper').removeClass('su_w_s_discovery').addClass('su_w_s_results');
                showNoResultsMsg(false);
                showErrorMessage(false);
            }

            //Show Stocks for Globes
            // else if (widget_ads.isExtraContentOn() && searchContactsIndex == 0) {
            //     var query = getQueryText();
            //     if (query.length > 2) {
            //         var frmSrc = widget_ads.ads_urls.search_content_iframe.replace('<query>', escape(query));
            //         //generateIframeResult(frmSrc);
            //         generateAdsResult();
            //     }
            // }
            for (var j = 0; j < data.Contacts.length; j++) {
                generateContactResult(data.Contacts[j], j);
            }
        } else {
            if (!append) {
                if (siteSearchObj == null) {
                    showNoResultsMsg(true);
                    hideElement($('#su_w_s_results_indication_text'));
                    sendMessageToParent('event{"event": "zoomdSearch:noResultsShown"}');
                } else {
                    showElement($('#su_w_s_results_indication_text'));
                }
            }
        }

        if (siteSearchObj != null) {
            showNoResultsMsg(false);
            $('#su_w_s_results_wrapper').removeClass('su_w_s_discovery').addClass('su_w_s_results');
            var li = CWS.templates.siteSearchRowTemplate.clone(false);
            if (CWS.siteSearchPage == 0) {
                $('#su_w_s_site_search_content_list>li:first').remove();
            }

            for (var i = 0; i < siteSearchObj.length; i++) {
                var currSiteSearchRow = li.clone(false);
                currSiteSearchRow.addClass((totalContactsShown + i) % 2 == 0 ? 'su_even' : 'su_odd');
                if (siteSearchObj[i].ImageUrl != null) {
                    $('.su_w_s_site_search_content_item_picture img, .su_expand_image_data_list img', currSiteSearchRow).attr('src', siteSearchObj[i].ImageUrl);
                }
                else {
                    $('.su_expand_image_data_list', currSiteSearchRow).parent().remove();
                }
                $(currSiteSearchRow).find('.site_search_su_results_t_name h3').html(siteSearchObj[i].Title);
                $(currSiteSearchRow).find('.site_search_results_t_description h4').html(siteSearchObj[i].Summary);
                assignNamedLabel($(currSiteSearchRow), siteSearchObj[i].Title);
                addToolTip($(currSiteSearchRow).find('.site_search_su_results_t_name h3'));
                $(currSiteSearchRow).attr('ssid', (((page - 1) * 10) + i));
                $(currSiteSearchRow).attr('row', searchContactsIndex);
                $(currSiteSearchRow).attr('resultType', ResultType.SiteSearch);
                $(currSiteSearchRow).attr('id', 'search_result_id_' + searchContactsIndex++);
                $(currSiteSearchRow).data('json', siteSearchObj[i]);
                $(currSiteSearchRow).find('.su_summary_text h4').html(siteSearchObj[i].Summary != null ? siteSearchObj[i].Summary : '');
                $(currSiteSearchRow).find('.su_expand_button_data_list a, .su_expand_summary_data_list a').attr('href', siteSearchObj[i].Link);
                assignNamedLabelAtAttribute($('.su_expand_share_data_list a', currSiteSearchRow), siteSearchObj[i].Title, '^NAME^', 'href');
                assignNamedLabelAtAttribute($('.su_expand_share_data_list a', currSiteSearchRow), siteSearchObj[i].Link, '^URL^', 'href');
                assignNamedLabel($(currSiteSearchRow).find('a'), siteSearchObj[i].Title);
                assignNamedLabel($(currSiteSearchRow).find('.contact_expand_btn button'), siteSearchObj[i].Title, true);
                if (!CWS.originalSettings.ShowContentPlaceholderCard) {
                    $('.su_expand_external_content_placeholder_list', currSiteSearchRow).parent().remove();
                }
                $('#su_w_s_site_search_content_list').append($(currSiteSearchRow));
            }
        }

        $('.su_w_s_search_content_item, .su_w_s_site_search_content_item').unbind('mouseenter mouseleave');
        $('.su_w_s_search_content_item, .su_w_s_site_search_content_item').hover(function (ev) {
            $(this).data('timerStart', new Date().getTime());
        }, function (ev) {
            var t = new Date().getTime() - $(this).data('timerStart');
            if (t > CWS.statistics.hoverParamMs) {
                logHoverDelay($(this), t / 1000);
            }
        });
        if (CWS.originalSettings.AllowSorting) { 
            $("#su_w_s_widget #su_w_s_results_wrapper").toggleClass("allow_sorting", true);
        }
        //attach click event on li - click on list
        $('.contact_item_list, .site_search_item_list, .su_w_s_actions_list').unbind('click');
        $('.contact_item_list, .site_search_item_list, .su_w_s_actions_list').bind('click', function (ev) { // contact and site search click
            var li = $(ev.target).closest('.su_w_s_search_content_item, .su_w_s_site_search_content_item');
            expandSearchResult(li, ev.target);
        });

        $('body').unbind('click');
        $('body').bind('click', '.contact_item_list_expanded_data, .site_search_item_list a', function (ev) { // contact and site search link click
            if ($(ev.target).is('img') && $(ev.target).parent().is('a')) {
                ev.target = $(ev.target).parent();
            }
            if ($(ev.target).is('a')) {
                var itemType = $.trim($(ev.target).text());
                var li = $(ev.target).closest('.su_w_s_search_content_item, .su_w_s_site_search_content_item');
                var _li = getTitleDescriptionIndex($(li));
                var itype = ($(li).attr('resulttype') == ResultType.Contact ? 'Contact' : 'SiteSearch');
                logAction('clickOnLink', itype, '', _li.name, _li.description, $.trim($(ev.target).text()), $(ev.target).attr('href'), _li.index, 0);
            }
        });

        showElement($('#su_w_s_logo_wrapper'));
        hideElement($('.su_action_cards_messages_list'));

        bindScroll();

        if (!append) { // add remove banners
            if (data.Banner != null && data.Banner != "undefined") { // set new banners
                setBanners(data.Banner, false);
                var ban = $('#su_w_s_big_banner_contnet');
                logAction('bannerShown', '', '', '', '', $('img', ban).attr('src'), $(ban).attr('href'), 0, 0);
            } else { // no new banner from search
                if (CWS.originalSettings.Banners != null && typeof (CWS.originalSettings.Banners) != 'undefined') { // check if static banners exist
                    setBanners(CWS.originalSettings.Banners, true);
                } else { // no banners at all, hide
                    setBanners(null, true);
                }
            }
            if (widget_ads.isContentAdsOn()) {
                generateAdsResult();
            }
        }

        if (!append) {
            scrollToTop(100);
        }

        if (CWS.curState < WidgetState.SEARCHRESULTS) {
            v3HoverIn();
        } else {
            var hintingBoxHeight = $('#su_w_s_hinting_box').is(':visible') && $('.category_hint').length > 0 ? $('#su_w_s_hinting_box').outerHeight(true) : 0;
            var newHeight = calcMaxHeight(CWS.curState) - $('#su_w_s_top_bar').outerHeight(true) - $('#su_w_s_search_input_flexi_width').outerHeight(true) - $('#su_w_s_indication_row').outerHeight(true) - hintingBoxHeight - $('#su_w_s_logo_wrapper').outerHeight(true) - $('#su_w_s_banner_wrapper').outerHeight(true);

            // if (widget_ads.isInitAdOn()) {
            //     newHeight += parseInt(widget_ads.ads.initialState_ad_height);
            // }
            $('#su_w_s_search_content_wrapper').height(newHeight);
        }

        if (!append) {
            if (typeof $('body').data('page_process') != 'undefined') {
                var t = new Date().getTime() - $('body').data('page_process');
                var sec = 0;
                try { sec = t / 1000; }
                catch (e) { sec = 0; }
                logAction('firstPageSearchAndRendered', '', '', '', '', '', '', 0, sec);
            }
            checkLogExposure();
            if ((data.Contacts != null && data.Contacts.length > 0) || siteSearchObj != null) {
                sendMessageToParent('event{"event": "zoomdSearch:resultsShown"}');
            }
        }

        fixSearchResultTitle();

        if (CWS.flags.forceDisplay)
            CWS.flags.forceDisplay = false;

        $(document).trigger(SphereUp.SphereUpWidget.dataGenerated);

    } //generateSearchResult

    function setBanners(bannersObj, isDefault) {
        if (bannersObj != null) {
            $('#su_w_s_banner_wrapper').attr('hasBanner', 1);
            $('#su_w_s_small_banner_contnet').attr('href', bannersObj.DestUrl).attr('title', bannersObj.TextShort);
            $('#su_w_s_small_banner_contnet img').attr('src', bannersObj.PicUrlSmall).attr('alt', bannersObj.TextShort);
            $('#su_w_s_big_banner_contnet').attr('href', bannersObj.DestUrl).attr('title', (CWS.originalSettings.ExpandedWidth == 1) ? bannersObj.TextShort : bannersObj.TextLong);
            $('#su_w_s_big_banner_contnet img').attr('src', (CWS.originalSettings.ExpandedWidth == 1) ? bannersObj.PicUrlSmall : bannersObj.PicUrlBig).attr('alt', (CWS.originalSettings.ExpandedWidth == 1) ? bannersObj.TextShort : bannersObj.TextLong);
            $('#su_w_s_big_banner_contnet').data('AdGroupId', (isDefault) ? 'default' : bannersObj.GroupId);
            $('#su_w_s_big_banner_contnet').data('BannerName', (isDefault) ? 'default' : bannersObj.Name);
            showElement($('#su_w_s_banner_wrapper'));

            if (CWS.curState == WidgetState.EXPANDED) {
                showElement($('#su_w_s_big_banner'));
                hideElement($('#su_w_s_small_banner'));
            } else {
                showElement($('#su_w_s_small_banner'));
                hideElement($('#su_w_s_big_banner'));
            }
        } else {
            $('#su_w_s_banner_wrapper').attr('hasBanner', 0);
            hideElement($('#su_w_s_banner_wrapper'));
            hideElement($('#su_w_s_small_banner'));
            hideElement($('#su_w_s_big_banner'));
        }

        var newWidth = $('#su_w_s_widget').width() + CWS.iFrameMargin;
        var newHeight = $('#su_w_s_widget').height() + CWS.iFrameMargin;
        if (widget_ads.ads.footer_ad) {
            if ($("#su_ads_under_footer").length <= 0)
                newHeight += parseInt(widget_ads.ads.footer_ad_height);
        }
        if (newWidth > CWS.iFrameMargin && newHeight > CWS.iFrameMargin) {
            sendMessageToParent('SetSize,' + newWidth + ',' + newHeight + ',' + 200);
        }
    }

    function fixSearchResultTitle() {
        if (CWS.curState != WidgetState.EXPANDED) {
            $('.su_results_t_name h3, .su_results_t_description h4').width('');
            $('.su_results_t_name h3, .su_results_t_description h4').css('max-width', '');
        } else {
            var liWidth = $('#su_w_s_search_content_list').outerWidth(true);
            $('.su_results_t_name').each(function (index) {
                var li = $(this).closest('.su_w_s_search_content_item');
                var actionsWidth = $('.su_w_s_actions_list', li).outerWidth(true);
                var contactPicWidth = $('.su_w_s_search_content_item_picture', li).outerWidth(true);
                var newWidth = liWidth - contactPicWidth - actionsWidth - 5;
                $('.su_results_t_name h3, .su_results_t_description h4', li).width(newWidth);
                $('.su_results_t_name h3, .su_results_t_description h4', li).css('max-width', newWidth);
            });
        }
    }

    function openPhoneCallForm(selectedPhone, li) {

        if (typeof CWS.originalSettings.EnableCall == 'undefined' || CWS.originalSettings.EnableCall == null || !CWS.originalSettings.EnableCall) {
            return;
        }

        var rowNum = $(li).attr('row');
        closeSendMail(rowNum);
        hideElement($(li).find('.su_action_cards_messages_list')); // hide notifications

        if ($('#action_card_call_full_name' + rowNum).length <= 0) { // create
            // create call form
            var name = $.trim($('.su_results_t_name', li).text());
            var form = $($('<span>').append($(CWS.templates.searchResultPhoneCall).clone(false)).html().split('^rowNum^').join(rowNum).split('^NAME^').join(name));

            form.addClass('su_card_status_1');

            // generate phone list
            $('.su_action_recipient_data_list li', $(form)).remove(); // clear list
            $('.su_expand_phone_data_list .su_mobile, .su_expand_phone_data_list .su_phone', li).each(function (index) { // fill list
                var phone = $.trim($(this).text()).toLowerCase();
                phone = $('<li tabindex="1">').addClass('su_action_recipient_data_item').text(phone);
                $('.su_action_recipient_data_list', $(form)).append(phone);
            });
            $(form).find('.su_call_status_picture img').attr('src', $(li).find('.su_w_s_search_content_item_picture img').attr('src'));
            $('.contact_item_list_expanded_data', li).prepend(form);

            // click on phone should select it
            $('.su_action_recipient_data_list li', $(form)).unbind('click');
            $('.su_action_recipient_data_list li', $(form)).bind('click keyup', function (el) {
                if (el.type == 'keyup') {
                    var code = el.keyCode || el.which;
                    if (code != 13) { //Enter keycode
                        return;
                    }
                }
                $('li.active', $(el.target).parent()).removeClass('active');
                $(el.target).addClass('active');
                var details = $(li).find('#action_card_call_full_name' + rowNum).val();
                details += $(li).find('#action_card_call_phone' + rowNum).val();
                logAction('clickOnCallPhone', 'Contact', 'Expanded', name, $.trim($('.su_results_t_description', li).text()), details, $(el.target).text(), rowNum, 0);
            });

            $(li).find('#action_card_call_full_name' + rowNum + ', #action_card_call_phone' + rowNum).bind('blur', function () {
                $(this).attr('placeholder', $(this).attr('_placeholder'));
                validatePhoneCallForm(rowNum, $(this));
            });

            if (CWS.flags.ie9 || CWS.flags.ie8) {
                $('#action_card_call_full_name' + rowNum).placeholder();
                $('#action_card_call_phone' + rowNum).placeholder();
            }

            $(li).find('#action_card_call_full_name' + rowNum + ', #action_card_call_phone' + rowNum).bind('focus', function () {
                if ($(this).is('#action_card_call_phone' + rowNum) && !CWS.flags.ie7) {
                    $(this).parent().parent().removeClass('su_w_s_error');
                }
                else {
                    $(this).parent().removeClass('su_w_s_error');
                }
                $(this).attr('_placeholder', $(this).attr('placeholder'));
                $(this).attr('placeholder', '');
            });

            // close and cancel
            $('.su_call_status_container .action_card_message_close_card_btn', form).click(function () {
                $.ajax({
                    url: SU_BaseUrlServiceHttp + 'Call/Hangup',
                    data: data,
                    type: "GET",
                    dataType: "jsonp",
                    success: function (data) {
                        if (data.Success) { // call cancelled
                            $(li).attr('callsid', '');
                        } else { // call cancel failed
                        }
                    },
                    error: function (data) {
                    }
                });
                closePhoneCall(rowNum);
            });

            if (!CWS.flags.ie7) {
                $('#action_card_call_phone' + rowNum).intlTelInput();
                if (CWS.originalSettings.clientData != null && typeof (CWS.originalSettings.clientData.country_code) != "undefined") {
                    $('#action_card_call_phone' + rowNum).intlTelInput("setDefaultCountry", CWS.originalSettings.clientData.country_code.toLowerCase());
                }
            } else { // solution for IE7
                if (CWS.originalSettings.clientData != null && typeof (CWS.originalSettings.clientData.country_code) != "undefined") {
                    var data = $.fn.intlTelInput.getCountryData();
                    for (var i = 0; i < data.countries.length; i++) {
                        var o = data.countries[i];
                        if (CWS.originalSettings.clientData.country_code.toLowerCase() == o.cca2) {
                            var code = o['calling-code'];
                            $('#action_card_call_phone' + rowNum).focusin(function () {
                                var value = $.trim($(this).val());
                                if (value.length === 0 || value == $(this).attr('placeholder')) {
                                    $(this).val('+' + code);
                                    $(this).attr('code', code);
                                }
                            });
                            $('#action_card_call_phone' + rowNum).focusout(function () {
                                var value = $.trim($(this).val());
                                if (value.length > 0 && value != $(this).attr('placeholder')) {
                                    var dialCode = $.fn.intlTelInput.getDialCode(value);
                                    if ("+" + dialCode == value) {
                                        $(this).val("");
                                    }
                                }
                            });
                            break;
                        }
                    }
                }
            }
        } else { // existing form
            $(li).find('.contact_item_list_expanded_data .su_action_call').removeClass('su_card_status_2').removeClass('su_card_status_3').addClass('su_card_status_1'); // show calling message
        }

        logAction('phoneActionShown', 'Contact', 'Expanded', $.trim($('.su_results_t_name', li).text()), $.trim($('.su_results_t_description', li).text()), '', '', rowNum, 0);

        $('.su_action_call', li).find('.su_action_recipient_data_list li').removeClass('active');
        if (selectedPhone == null || selectedPhone.length == 0) {
            $(li).find('.su_action_call .su_action_recipient_data_list li').first().addClass('active');
        } else {
            $(li).find('.su_action_call .su_action_recipient_data_list li').filter(function () {
                return $(this).text() == selectedPhone;
            }).addClass('active');
        }

        $(li).find('.su_action_call .su_action_card_container .action_card_message_close_card_btn').unbind('click');
        $(li).find('.su_action_call .su_action_card_container .action_card_message_close_card_btn').click(function () {
            closePhoneCall(rowNum);
        });

        $(li).find('.su_action_call .su_action_card_container .action_card_primary_btn').unbind('click');
        $(li).find('.su_action_call .su_action_card_container .action_card_primary_btn').click(function () {
            makePhoneCall(rowNum);
        });

        if (CWS.flags.ie8) {
            showSpecialElement($('.su_action_call', li));
            hideSpecialElement($('.su_expand_phone_data_list', li).parent());
        } else {
            hideElement($('.su_expand_phone_data_list', li).parent());
            showElement($('.su_action_call', li));
        }

        scrollToSearchResultNumber($(li).attr('row'), $(li).attr('resultType'), 580, function () {//500
        });

        try { $('.contact_item_list_expanded_data.masonryApplied', li).masonry('destroy').removeClass('masonryApplied'); }
        catch (e) { }

        $('.contact_item_list_expanded_data', li).addClass('masonryApplied').masonry(masonrySettings);
    }

    function openSendMailForm(selectedEmail, li) {
        var showForm = true;

        if (CWS.originalSettings.DisableEmail) {
            return;
        }

        if (typeof CWS.originalSettings.CustomDisclaimer !== 'undefined' && CWS.originalSettings.CustomDisclaimer != null && CWS.originalSettings.CustomDisclaimer.length > 0) {
            showForm = confirm(CWS.originalSettings.CustomDisclaimer);
        }

        if (!showForm) return;

        var rowNum = $(li).attr('row');
        closePhoneCall(rowNum);
        hideElement($(li).find('.su_action_cards_messages_list'));
        if ($('#action_card_message_full_name' + rowNum).length <= 0) { // create form
            // create send mail form
            var name = $.trim($('.su_results_t_name', li).text());
            var form = $($('<span>').append($(CWS.templates.searchResultSendMail).clone(false)).html().split('^rowNum^').join(rowNum).split('^NAME^').join(name));
            $('.action_card_message_message_textarea', $(form)).addClass('su_placeholder');
            // generate mails list
            $('.su_action_recipient_data_list li', $(form)).remove(); // clear list
            $('.su_expand_email_data_list .su_email', li).each(function (index) { // fill list
                var mail = $.trim($(this).text()).toLowerCase();
                mail = $('<li tabindex="1">').addClass('su_action_recipient_data_item').text(mail);
                $('.su_action_recipient_data_list', $(form)).append(mail);
            });
            $('.contact_item_list_expanded_data', li).prepend(form);
            //click on email should select it
            $('.su_action_recipient_data_list li', $(form)).unbind('click');
            $('.su_action_recipient_data_list li', $(form)).bind('click keyup', function (el) {
                if (el.type == 'keyup') {
                    var code = el.keyCode || el.which;
                    if (code != 13) { //Enter keycode
                        return;
                    }
                }
                $('li.active', $(el.target).parent()).removeClass('active');
                $(el.target).addClass('active');
                logAction('clickOnSendMessageEmail', 'Contact', 'Expanded', name, $.trim($('.su_results_t_description', li).text()), $(el.target).text(), '', rowNum);
            });

            $(li).find('#action_card_message_full_name' + rowNum + ', #action_card_message_email' + rowNum + ', #action_card_message_message_text' + rowNum).bind('blur', function () {
                if ($(this).attr('id') == 'action_card_message_message_text' + rowNum) { // textarea no placeholder
                    if ($.trim($(this).val()).length <= 0) {
                        $(this).val($(this).attr('aria-label'));
                        $(this).addClass('su_placeholder');
                    } else {
                        $(this).removeClass('su_placeholder');
                    }
                } else {
                    $(this).attr('placeholder', $(this).attr('_placeholder'));
                }
                validateSendMailForm(rowNum, $(this));
            });

            if (CWS.flags.ie9 || CWS.flags.ie8) {
                $('#action_card_message_full_name' + rowNum).placeholder();
                $('#action_card_message_email' + rowNum).placeholder();
            }

            $(li).find('#action_card_message_full_name' + rowNum + ', #action_card_message_email' + rowNum + ', #action_card_message_message_text' + rowNum).bind('focus', function () {
                $(this).parent().removeClass('su_w_s_error');
                if ($(this).attr('id') == 'action_card_message_message_text' + rowNum) { // textarea no placeholder
                    if ($(this).hasClass('su_placeholder')) {
                        $(this).val('');
                        $(this).removeClass('su_placeholder');
                    }
                } else {
                    $(this).attr('_placeholder', $(this).attr('placeholder'));
                    $(this).attr('placeholder', '');
                }
            });
        }


        logAction('messageActionShown', 'Contact', 'Expanded', $.trim($('.su_results_t_name', li).text()), $.trim($('.su_results_t_description', li).text()), '', '', rowNum, 0);

        changeButtonState(li, false);

        $('.su_action_message', li).find('.su_action_recipient_data_list li').removeClass('active');
        if (selectedEmail == null || selectedEmail.length == 0) {
            $(li).find('.su_action_message .su_action_recipient_data_list li').first().addClass('active');
        } else {
            $(li).find('.su_action_message .su_action_recipient_data_list li').filter(function () {
                return $(this).text() == selectedEmail;
            }).addClass('active');
        }

        $(li).find('.su_action_message .su_action_card_container .action_card_message_close_card_btn').unbind('click');
        $(li).find('.su_action_message .su_action_card_container .action_card_message_close_card_btn').click(function () {
            closeSendMail(rowNum);
        });

        $(li).find('.su_action_message .su_action_card_container .action_card_primary_btn').unbind('click');
        $(li).find('.su_action_message .su_action_card_container .action_card_primary_btn').click(function () {
            sendMail(rowNum);
        });

        if (CWS.flags.ie8) {
            showSpecialElement($('.su_action_message', li));
            hideSpecialElement($('.su_expand_email_data_list', li).parent());
        } else {
            hideElement($('.su_expand_email_data_list', li).parent());
            showElement($('.su_action_message', li));
        }

        scrollToSearchResultNumber($(li).attr('row'), $(li).attr('resultType'), 580, function () {//500
        });

        try { $('.contact_item_list_expanded_data.masonryApplied', li).masonry('destroy').removeClass('masonryApplied'); }
        catch (e) { }

        $('.contact_item_list_expanded_data', li).addClass('masonryApplied').masonry(masonrySettings);
    }

    function closePhoneCall(rowNum) {
        if (rowNum >= 0) {
            var li = $('#search_result_id_' + rowNum);

            if (CWS.flags.ie8) {
                hideSpecialElement($('.su_action_call', li));
                showSpecialElement($('.su_expand_phone_data_list', li).parent());
            } else {
                hideElement($('.su_action_call', li));
                showElement($('.su_expand_phone_data_list', li).parent());
            }
            hideElement($('.su_action_cards_messages_list', li));

            $('.contact_item_list_expanded_data.masonryApplied', li).masonry('destroy').removeClass('masonryApplied');
            $('.su_action_call .su_w_s_error', li).removeClass('su_w_s_error');
            $('.contact_item_list_expanded_data', li).addClass('masonryApplied').masonry(masonrySettings);
        } else {
            if (CWS.flags.ie8) {
                hideSpecialElement($('.su_action_call'));
                showSpecialElement($('.su_expand_phone_data_list').parent());
            } else {
                hideElement($('.su_action_call'));
                showElement($('.su_expand_phone_data_list').parent());
            }
            hideElement($('.su_action_cards_messages_list'));
            $('.su_action_call .su_w_s_error').removeClass('su_w_s_error');
        }
    }

    function closeSendMail(rowNum) {
        if (rowNum >= 0) {
            var li = $('#search_result_id_' + rowNum);

            if (CWS.flags.ie8) {
                hideSpecialElement($('.su_action_message', li));
                showSpecialElement($('.su_expand_email_data_list', li).parent());
            } else {
                hideElement($('.su_action_message', li));
                showElement($('.su_expand_email_data_list', li).parent());
            }
            hideElement($('.su_action_cards_messages_list', li));

            $('.contact_item_list_expanded_data.masonryApplied', li).masonry('destroy').removeClass('masonryApplied');
            $('.su_action_message .su_w_s_error', li).removeClass('su_w_s_error');
            $('.contact_item_list_expanded_data', li).addClass('masonryApplied').masonry(masonrySettings);
        } else {
            if (CWS.flags.ie8) {
                hideSpecialElement($('.su_action_message'));
                showSpecialElement($('.su_expand_email_data_list').parent());
            } else {
                hideElement($('.su_action_message'));
                showElement($('.su_expand_email_data_list').parent());
            }
            hideElement($('.su_action_cards_messages_list'));
            $('.su_action_message .su_w_s_error').removeClass('su_w_s_error');
        }
    }

    function fixPhoneNumber(phone) {
        return phone.replace(/[- ()]/g, '');
    }

    function makePhoneCall(rowNum) {

        if (!validatePhoneCallForm(rowNum, null)) return;

        var li = $('#search_result_id_' + rowNum);
        var fromName = $.trim($('#action_card_call_full_name' + rowNum).val());
        var fromPhone = $.trim($('#action_card_call_phone' + rowNum).val());
        fromPhone = fixPhoneNumber(fromPhone);
        var toName = $.trim($('.su_results_t_name', li).text());
        var toTitle = $.trim($('.su_results_t_description', li).text());
        var toPhone = $('.su_action_call', li).find('.su_action_recipient_data_item.active').text();
        var toPhoneFixed = fixPhoneNumber(toPhone);

        var data = { FromName: fromName, FromPhone: fromPhone, ToName: toName, ToTitle: toTitle, ToPhone: toPhoneFixed, clientId: CWS.originalSettings.clientId, sessionId: CWS.originalSettings.sessionId, url: getCurrentLocationUrl() };

        $(li).find('.recipient_data_phone_number').text(toPhone);
        $(li).find('.user_data_phone_number').text(fromPhone);
        $(li).find('.contact_item_list_expanded_data .su_action_call').removeClass('su_card_status_1').removeClass('su_card_status_2').addClass('su_card_status_3'); // show calling message

        logAction('clickOnPhoneCall', 'Contact', 'Expanded', toName, toTitle, toPhoneFixed, fromName + ' <' + fromPhone + '>', rowNum);

        $.ajax({
            url: SU_BaseUrlServiceHttp + 'Call/Call',
            data: data,
            type: "GET",
            dataType: "jsonp",
            success: function (data) {
                if (!data.Success) {
                    showCallActionErrorMessage(li, rowNum, ((CWS.originalSettings.Language == 'heb') ? "לצערינו לא הצלחנו לחבר אותך, אנא נסה שוב מאוחר יותר" : "Unfortunately we could not connect you, please try again later"));
                    return;
                }
                if (data.Success && data.Sid) {
                    $(li).attr('callsid', data.Sid);
                    logAction('clickOnCall', 'Contact', 'Expanded', toName, toTitle, fromName + ' <' + fromPhone + '>', data.Sid, rowNum, 0);
                    //$('.contact_item_list_expanded_data.masonryApplied', li).masonry('destroy').removeClass('masonryApplied');
                    $('.contact_item_list_expanded_data', li).addClass('masonryApplied').masonry(masonrySettings);
                }
                $(li).data('callStatusBack', false);
                // settimeout for 60 sec to check call status back
                timeout_id = setTimeout(function () {
                    checkCallStatusCallback(toPhone, rowNum, li);
                }, 60000);
                $(li).data('timeout_id', timeout_id);
            },
            error: function (data) {
                showCallActionErrorMessage(li, rowNum, ((CWS.originalSettings.Language == 'heb') ? "לצערינו לא הצלחנו לחבר אותך, אנא נסה שוב מאוחר יותר" : "Unfortunately we could not connect you, please try again later"));
            }
        });
    }

    function checkCallStatusCallback(toPhone, rowNum, li) {
        if (!$(li).data('callStatusBack')) { // no responce from server, close message and show form
            openPhoneCallForm(toPhone, li);
            showActionNotification(rowNum, false, ((CWS.originalSettings.Language == 'heb') ? "לצערינו לא הצלחנו לחבר אותך, אנא נסה שוב מאוחר יותר" : "Unfortunately we could not connect you, please try again later"));
        } else { // check in 60 sec the status
            $(li).data('callStatusBack', false);
            setTimeout(function () {
                checkCallStatusCallback(toPhone, rowNum, li);
            }, 60000);
        }
    }

    function checkCallStatus(sid, status1, status2) {
        // get li by sid
        var li = $('#su_w_s_search_content_list li.su_w_s_search_content_item[callsid="' + sid + '"]');
        var rowNum = $(li).attr('row');
        var status = true;

        // queued, ringing, in-progress, completed, busy, failed, no-answer, canceled
        if (status1 == "in-progress" && status2 == null) {
            $(li).find('.contact_item_list_expanded_data .su_action_call').removeClass('su_card_status_1').removeClass('su_card_status_3').addClass('su_card_status_2');
            //$('.contact_item_list_expanded_data.masonryApplied', li).masonry('destroy').removeClass('masonryApplied');
            $('.contact_item_list_expanded_data', li).addClass('masonryApplied').masonry(masonrySettings);
        } else if (status1 == "completed" || status1 == "canceled" || status2 == "completed" || status2 == "canceled") {
            if (typeof $(li).data('timeout_id') !== 'undefined')
                clearTimeout($(li).data('timeout_id'))
            closePhoneCall(rowNum);
        } else if (status1 == "failed" || status1 == "busy" || status1 == "no-answer") {
            openPhoneCallForm($('.su_action_call', li).find('.su_action_recipient_data_list li.active').text(), li);
            if (typeof $(li).data('timeout_id') !== 'undefined')
                clearTimeout($(li).data('timeout_id'))
            showActionNotification(rowNum, false, ((CWS.originalSettings.Language == 'heb') ? "לצערינו לא הצלחנו לחבר אותך, אנא נסה שוב מאוחר יותר" : "Unfortunately we could not connect you, please try again later"));
        } else if (status2 == "failed") {
            if (!CWS.flags.ie7) {
                $('#action_card_call_phone' + rowNum).parent().parent().addClass('su_w_s_error');
            }
            else {
                $('#action_card_call_phone' + rowNum).parent().addClass('su_w_s_error');
            }
            openPhoneCallForm($('.su_action_call', li).find('.su_action_recipient_data_list li.active').text(), li);
            if (typeof $(li).data('timeout_id') !== 'undefined')
                clearTimeout($(li).data('timeout_id'))
            showActionNotification(rowNum, false, ((CWS.originalSettings.Language == 'heb') ? "נראה כי המספר שהכנסת אינו תקין, אנא תקן את המספר ונסה שוב" : "The number you've entered seems incorrect, please check and try again"));
        } else if (status2 == "busy" || status2 == "no-answer") {
            openPhoneCallForm($('.su_action_call', li).find('.su_action_recipient_data_list li.active').text(), li);
            if (typeof $(li).data('timeout_id') !== 'undefined')
                clearTimeout($(li).data('timeout_id'))
            showActionNotification(rowNum, false, ((CWS.originalSettings.Language == 'heb') ? "נראה כי המספר שהכנסת אינו זמין, אנא נסה שוב מאוחר יותר" : "The number you've entered seems busy, please try again later"));
        } else if (status2 == "in-progress") {
            closePhoneCall(rowNum);
            if (typeof $(li).data('timeout_id') !== 'undefined')
                clearTimeout($(li).data('timeout_id'))
            showActionNotification(rowNum, false, ((CWS.originalSettings.Language == 'heb') ? "אתה מחובר כעת ליעד המבוקש" : "Your call is now in progress"));
        } else { // status not processed
            status = false;
        }
        if (status) {
            $(li).data('callStatusBack', true);
        }
    }

    function showCallActionErrorMessage(li, rowNum, message) {
        showActionNotification(rowNum, false, message);
        $(li).find('.contact_item_list_expanded_data .su_action_call').removeClass('su_card_status_3').removeClass('su_card_status_2').addClass('su_card_status_1');
    }

    function sendMail(rowNum) {
        var li = $('#search_result_id_' + rowNum);
        var senderName = $.trim($('#action_card_message_full_name' + rowNum).val());
        var senderEmail = $.trim($('#action_card_message_email' + rowNum).val());
        var targetName = $.trim($('.su_results_t_name', li).text());
        var targetTitle = $.trim($('.su_results_t_description', li).text());
        var messageBody = $('#action_card_message_message_text' + rowNum).val();
        var targetEmail = $('.su_action_message', li).find('.su_action_recipient_data_item.active').text();
        var data = { clientId: CWS.originalSettings.clientId, senderName: senderName, senderEmail: senderEmail, targetName: targetName, targetTitle: targetTitle, targetEmail: targetEmail, messageBody: messageBody, sessionId: CWS.originalSettings.sessionId, url: getCurrentLocationUrl() };


        if (!validateSendMailForm(rowNum, null)) return;

        changeButtonState(li, true);

        logAction('clickOnSendMessage', 'Contact', 'Expanded', targetName, targetTitle, targetEmail, senderName + ' <' + senderEmail + '>', rowNum);

        $.ajax({
            url: SU_BaseUrlServiceHttp + 'SendMessage',
            data: data,
            type: "GET",
            dataType: "jsonp",
            success: function (data) {
                trace('log successfull ' + data, TraceLevel.DEBUG);
                changeButtonState(li, false);
                if (data) {
                    closeSendMail(rowNum);
                }
                if (CWS.originalSettings.Language == 'heb') {
                    showActionNotification(rowNum, data, data ? "ההודעה שלך נשלחה בהצלחה" : "הייתה בעיה לשלוח את ההודעה, אנא נסה שוב מאוחר יותר");
                }
                else {
                    showActionNotification(rowNum, data, data ? "Your message was successfully submitted" : "There was a problem sending your message, please try again later");
                }
            },
            error: function (data) {
                trace('log error ' + data, TraceLevel.ERROR);
                changeButtonState(li, false);
                if (CWS.originalSettings.Language == 'heb') {
                    showActionNotification(rowNum, false, "הייתה בעיה לשלוח את ההודעה, אנא נסה שוב מאוחר יותר");
                }
                else {
                    showActionNotification(rowNum, false, "There was a problem sending your message, please try again later");
                }
            }
        });
    }

    function validatePhoneCallForm(rowNum, object) {
        var formValid = true;
        if (object == null || $(object).attr('id') == 'action_card_call_phone' + rowNum) { // validate phone
            try {
                // check if to remove lead 0 from number
                var phone = $('#action_card_call_phone' + rowNum);
                var phoneNum = $(phone).val();
                var cntCode = $(phone).attr('code');
                if (typeof (cntCode) == "undefined") { // then not ie7, get from list
                    cntCode = $($(phone).parent().find('ul.country-list li.active')[0]).attr('data-dial-code');
                }
                if (cntCode.length > 0) { // code found
                    var strTmp = $.trim($(phone).val().replace('+' + cntCode, ''));
                    if (strTmp.indexOf('0') == 0) { // remove leading zero
                        strTmp = strTmp.slice('1', strTmp.length);
                        phoneNum = '+' + cntCode + ' ' + strTmp;
                    }
                }
            } catch (e) {
            }

            var number = fixPhoneNumber(phoneNum);
            if ($.trim($(phone).val()).length <= 0 || !validatePhoneNumber(number) || number == $(phone).attr('aria-label')) { // validate phone
                formValid = false;
                if (!CWS.flags.ie7) {
                    $('#action_card_call_phone' + rowNum).parent().parent().addClass('su_w_s_error');
                } else {
                    $('#action_card_call_phone' + rowNum).parent().addClass('su_w_s_error');
                }
            } else {
                $(phone).val(phoneNum);
                if (!CWS.flags.ie7) {
                    $('#action_card_call_phone' + rowNum).parent().parent().removeClass('su_w_s_error');
                } else {
                    $('#action_card_call_phone' + rowNum).parent().removeClass('su_w_s_error');
                }
            }
        }

        if (object == null || $(object).attr('id') == 'action_card_call_full_name' + rowNum) { // validate name
            var name = $('#action_card_call_full_name' + rowNum);
            if ($.trim($(name).val()).length <= 0 || $(name).val() == $(name).attr('aria-label')) { // validate name
                formValid = false;
                $(name).parent().addClass('su_w_s_error');
            } else {
                $(name).parent().removeClass('su_w_s_error');
            }
        }
        return formValid;
    }

    function validateSendMailForm(rowNum, object) {
        var formValid = true;
        if (object == null || $(object).attr('id') == 'action_card_message_message_text' + rowNum) { // validate
            var message = $('#action_card_message_message_text' + rowNum);
            if ($.trim($(message).val()).length <= 0 || $(message).hasClass('su_placeholder') || $(message).val() == $(message).attr('aria-label')) { // validate message
                formValid = false;
                $(message).parent().addClass('su_w_s_error');
            } else {
                $(message).parent().removeClass('su_w_s_error');
            }
        }
        if (object == null || $(object).attr('id') == 'action_card_message_email' + rowNum) { // validate
            var mail = $('#action_card_message_email' + rowNum);
            if ($.trim($(mail).val()).length <= 0 || !validateEmail($(mail).val()) || $(mail).val() == $(mail).attr('aria-label')) { // validate mail
                formValid = false;
                $(mail).parent().addClass('su_w_s_error');
            } else {
                $(mail).parent().removeClass('su_w_s_error');
            }
        }
        if (object == null || $(object).attr('id') == 'action_card_message_full_name' + rowNum) { // validate
            var name = $('#action_card_message_full_name' + rowNum);
            if ($.trim($(name).val()).length <= 0 || $(name).val() == $(name).attr('aria-label')) { // validate name
                formValid = false;
                $(name).parent().addClass('su_w_s_error');
            } else {
                $(name).parent().removeClass('su_w_s_error');
            }
        }
        return formValid;
    }

    function validateEmail(email) {
        var regex = /^([a-zA-Z0-9_\.\-\+])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/;
        if (regex.test(email) && !stringEndsWithDot(email)) {
            return true;
        }
        return false;
    }
    function stringEndsWithDot(val) {
        return val.lastIndexOf('.') === (val.length - 1);
    }

    function changeButtonState(li, isLoading) {
        var sendBtn = $('.action_card_primary_btn', $(li));
        if (isLoading) {
            sendBtn.addClass('su_w_s_progress');
            $('.su_w_s_btn_caption', sendBtn).text($(sendBtn).attr('sending'));
        } else {
            sendBtn.removeClass('su_w_s_progress');
            $('.su_w_s_btn_caption', sendBtn).text($(sendBtn).attr('send'));
        }
    }

    function showActionNotification(rowNum, isSuccess, message) {
        var li = $('#search_result_id_' + rowNum);
        $(li).find('.action_card_message_item').addClass(isSuccess ? 'su_w_s_ok' : 'su_w_s_error');
        $(li).find('.action_card_message_item p').html('<span/>' + message);
        showElement($(li).find('.su_action_cards_messages_list'));
        //$('.contact_item_list_expanded_data.masonryApplied', li).masonry('destroy').removeClass('masonryApplied');
        $('.contact_item_list_expanded_data', li).addClass('masonryApplied').masonry(masonrySettings);
        setTimeout(function () {
            hideElement($(li).find('.su_action_cards_messages_list'));
            //$('.contact_item_list_expanded_data.masonryApplied', li).masonry('destroy').removeClass('masonryApplied');
            $('.contact_item_list_expanded_data', li).addClass('masonryApplied').masonry(masonrySettings);
        }, 5000);
    }

    var masonrySettings = null, discoveryMasonrySettings = null;
    var signalRChat = null;
    function expandSearchResult(li, clickedObject) {
        var preventCollapse = false;
        var contact = $(li).data('json');
        var itype = ($(li).attr('resulttype') == ResultType.Contact ? 'Contact' : 'SiteSearch');

        // start to load signalR if not loaded
        if (typeof ($.connection) == "undefined" && CWS.originalSettings.EnableCall) {
            loadScript(signalR[0], function () {
                loadScript(signalR[1], function () {
                    trace('SignalR loaded', TraceLevel.DEBUG);
                    signalRChat = $.connection.CallHub;
                    $.connection.hub.url = SU_BaseUrlServiceHttp + "signalr";
                    // starting the signalR
                    //$.connection.hub.state = 4
                    //$.signalR.connectionState //Object {connecting: 0, connected: 1, reconnecting: 2, disconnected: 4}
                    //TODO check if connection opened
                    signalRChat.client.updateCallStatus = function (sid, status1, status2) {
                        checkCallStatus(sid, status1, status2);
                    };
                    $.connection.hub.start(); // open the signalR connection
                });
            });
        }
        if ($.isFunction(CWS.generateExternalContentForResult)) {
            CWS.generateExternalContentForResult(contact, li);
        }

        if ($('.contact_item_list_expanded_data', li).children().length <= 0 || itype == 'SiteSearch') { // // generate expanded data
            generateExpandedData(li, contact);
        }
        if (itype == 'Contact') {
            // if clicked on mail button, take 1st mail
            if ($(clickedObject).parent().hasClass('su_email')) {
                openSendMailForm(contact.Emails[0], li);
            } else if ($(clickedObject).parent().hasClass('su_phone')) {
                if (CWS.originalSettings.EnableCall) {
                    var firstPhone = (contact.Mobiles != null && contact.Mobiles.length > 0) ? contact.Mobiles[0] : ((contact.Phones != null && contact.Phones.length > 0) ? contact.Phones[0] : '');
                    if (firstPhone.length > 0) {
                        openPhoneCallForm(firstPhone, li);
                    }
                }
            }
        }

        // prevent event if no collapse wanted(select text, control click)
        if ($(li).hasClass('su_w_s_expand')) {
            if ($(clickedObject).closest('li').hasClass('data_icon') || $(clickedObject).is('a')) { // || $(ev.target).is('button')
                preventCollapse = true;
            }
        }

        if ($(clickedObject).parent().hasClass('data_icon') || $(clickedObject).hasClass('data_icon')) { // address have no button
            var btnAct = $(clickedObject).parent().hasClass('data_icon') ? $(clickedObject).parent() : $(clickedObject);
            var classTxt = $.trim($(btnAct).attr('class').replace('data_icon', ''));
            var clickText = '';
            switch (classTxt) {
                case 'su_phone':
                    clickText = 'PhoneIcon';
                    break;
                case 'su_email':
                    clickText = 'EmailIcon';
                    break;
                case 'su_address':
                    clickText = 'AddressIcon';
                    break;
                default:
                    break;
            }

            if (clickText.length > 0) { // No log for nothing
                var _li = getTitleDescriptionIndex($(li));
                var recordExpanded = $(li).hasClass('su_w_s_expand') ? itype + 'Expanded' : itype + 'Collapsed';
                logAction('clickOn' + clickText, itype, recordExpanded, _li.name, _li.description, '', '', _li.index, new Date().getTime());
            }
        }
        
        // remove selection from contacts
        if (!preventCollapse) {
            var masonryContainer = $('.contact_item_list_expanded_data', li);

            $('.su_w_s_search_content_item').removeClass('su_selected');
            $('.su_w_s_site_search_content_item').removeClass('su_selected');
            $(li).addClass('su_selected').toggleClass('su_w_s_expand');

            if (!$(li).hasClass('su_w_s_expand')) {
                //If a video is showing, stop playing
                if ($.isFunction(CWS.pauseVideo)) {
                    CWS.pauseVideo(li);
                }


                var row = $(li).attr('row');
                $('#su_w_s_search_content_wrapper').off("scroll.pauseVideo" + row);
            }

            if ($(li).hasClass('su_w_s_expand')) {// log expand action
                logRecordExpandCollapse($(li), 'Expanded');
                sendMessageToParent('event{"event": "zoomdSearch:resultExpanded"}');
            } else {
                logRecordExpandCollapse($(li), 'Collapsed');
                sendMessageToParent('event{"event": "zoomdSearch:resultCollapsed"}');
            }

            if ($(li).hasClass('su_w_s_expand')) {
                $('.contact_expand_btn .su_hc', $(li)).text($('.contact_expand_btn .su_hc', $(li)).attr('collapse'));
            } else {
                $('.contact_expand_btn .su_hc', $(li)).text($('.contact_expand_btn .su_hc', $(li)).attr('expand'));
                //close send email
                closeSendMail($(li).attr('row'));
                closePhoneCall($(li).attr('row'));
                try { $('.masonryApplied', masonryContainer).masonry('destroy').removeClass('masonryApplied'); }
                catch (e) { }
            }

            if (CWS.curState != WidgetState.EXPANDED) {
                transitionToExpandedState(WidgetState.EXPANDED, function () {
                    if (masonryContainer.parent().hasClass('su_w_s_expand')) {
                        if (CWS.flags.ie8) {
                            var el = $('.su_w_s_contact_item_data_card', masonryContainer).addClass('no_pie_behavior');
                            setTimeout(function () {
                                el.removeClass('no_pie_behavior');
                            }, 500);
                        }
                        try { $('.masonryApplied', masonryContainer).masonry('destroy').removeClass('masonryApplied'); }
                        catch (e) { }
                        masonryContainer.addClass('masonryApplied').masonry(masonrySettings);
                        //masonryContainer.masonry('layout');
                    } else {
                        try { $('.contact_item_list_expanded_data.masonryApplied', li).masonry('destroy').removeClass('masonryApplied'); }
                        catch (e) { }
                        $('.contact_item_list_expanded_data', li).addClass('masonryApplied').masonry(masonrySettings);
                    }
                });
            } else {
                /*stop video on scroll +-8 rows*/
                var videoEl = $(li).find('video');
                var row = $(li).attr('row');
                if (videoEl.get(0)) {
                    var stopIt = function (li, row) {
                        CWS.pauseVideo(li);
                        $('#su_w_s_search_content_wrapper').off("scroll.pauseVideo" + row);
                    };
                    $('#su_w_s_search_content_wrapper').on("scroll.pauseVideo" + row, function () {
                        var elemsMinus = $("#search_result_id_" + (parseInt(row) - 8));
                        var elemsPlus = $("#search_result_id_" + (parseInt(row) + 8));
                        if (elemsPlus.get(0)) {
                            if (elemsPlus.offset().top < 0) {
                                stopIt(li,row);
                            }
                        }
                        if (elemsMinus.get(0)) {
                            if (elemsMinus.offset().top > 0) {
                                stopIt(li, row);
                            }
                        }
                    });
                }
                // scroll to clicked contact
                scrollToSearchResultNumber($(li).attr('row'), $(li).attr('resultType'), 580, function () {//500
                    //trace('scroll completed');
                });
                if (masonryContainer.parent().hasClass('su_w_s_expand')) {
                    if (CWS.flags.ie8) {
                        var el = $('.su_w_s_contact_item_data_card', masonryContainer).addClass('no_pie_behavior');
                        setTimeout(function () {
                            el.removeClass('no_pie_behavior');
                        }, 500);
                    }
                    masonryContainer.addClass('masonryApplied').masonry(masonrySettings);
                    //masonryContainer.masonry('layout');
                }
            }
        }
    }

    function transitionToExpandedState(newState, callback) {
        if (CWS.curState != newState) {
            var hintingBoxHeight = $('#su_w_s_hinting_box').is(':visible') && $('.category_hint').length > 0 ? $('#su_w_s_hinting_box').outerHeight(true) : 0;
            var newHeight = CWS.maxExpandedHeight - $('#su_w_s_top_bar').outerHeight(true) - $('#su_w_s_search_input_flexi_width').outerHeight(true) - $('#su_w_s_indication_row').outerHeight(true) - hintingBoxHeight - $('#su_w_s_logo_wrapper').outerHeight(true) - $('#su_w_s_banner_wrapper').outerHeight(true);
            CWS.curState = newState;
            var sendHeight = CWS.maxExpandedHeight + CWS.iFrameMargin;

            if (!$('#su_w_s_banner_wrapper').is(":visible")) {
                sendHeight -= 88;
            }

            if (!$('#su_w_s_widget').hasClass(CWS.originalSettings.ExpandedClass)) {
                var oldWidth = $('#su_w_s_widget').width();
                // getting the width by configuration
                $('#su_w_s_widget').addClass(CWS.originalSettings.ExpandedClass).css('max-width', 'none');
                var newWidth = $('#su_w_s_widget').width();
                $('#su_w_s_widget').removeClass(CWS.originalSettings.ExpandedClass).css('max-width', '');
                if (widget_ads.expandedStateAddHeight()) {
                    if ($("#su_ads_under_footer").length > 0)
                        sendHeight += parseInt($("#su_ads_under_footer").outerHeight(true));
                    else
                        sendHeight += parseInt(widget_ads.ads.footer_ad_height);
                }
                sendMessageToParent('SetSize,' + (oldWidth + CWS.iFrameMargin) + ',' + (sendHeight) + ',' + 200);
            }
            $('#su_w_s_search_content_wrapper').height(newHeight);
            $('#su_w_s_results_wrapper').stop(false, false).animate({
                height: CWS.maxExpandedHeight - $('#su_w_s_logo_wrapper').outerHeight(true) - $('#su_w_s_banner_wrapper').outerHeight(true)
            }, 200);

            //hide small banner and show large
            if ($('#su_w_s_banner_wrapper').attr('hasBanner') == '1') {
                showElement($('#su_w_s_big_banner'));
                hideElement($('#su_w_s_small_banner'));
            }
            sendMessageToParent('SetSize,' + (newWidth + CWS.iFrameMargin) + ',' + (sendHeight) + ',' + 400);

            if (!$('#su_w_s_widget').hasClass(CWS.originalSettings.ExpandedClass)) {
                trace("before expand animate", TraceLevel.DEBUG);
                $('#su_w_s_widget').animate({
                    width: newWidth
                }, 400, function () {
                    trace("expand animation finished", TraceLevel.DEBUG);
                    $('#su_w_s_widget').addClass(CWS.originalSettings.ExpandedClass);
                    //$('#su_w_s_widget').width('');
                    scrollToSelectedResult(1); // 200
                    // align name of contact
                    fixSearchResultTitle();
                    fixCustomEllipsis($('.su_discovery_title', $('#su_w_s_discovery_content_list')), $('.su_discovery_title:first :first-child', $('#su_w_s_discovery_content_list')).prop("tagName"));
                    if (typeof (callback) == "function") callback();
                });
            }
            else {
                scrollToSelectedResult(1); // 200
                // align name of contact
                fixSearchResultTitle();
                fixCustomEllipsis($('.su_discovery_title', $('#su_w_s_discovery_content_list')), $('.su_discovery_title:first :first-child', $('#su_w_s_discovery_content_list')).prop("tagName"));
                if (typeof (callback) == "function") callback();
            }
        }
        else {
            if (typeof (callback) == "function") callback();
        }
    }

    function generateExpandedData(li, contact) {
        //Hints - Highlights
        if (contact.Hinting != null && contact.Hinting.length > 0) {
             var template = $('.su_expand_html_data_list', CWS.templates.searchResultContactRowTemplate).parent();
             var card = template.clone();
             var html = contact.Hinting.replace(/<em>/g, '<b>').replace(/<\/em>/g, '</b>');
             if (html.indexOf('<li') !== 0) {
                 html = '<li><p>' + html + '</p></li>';
             }
             $('.su_expand_html_data_list', card).html(html);
             $(card).addClass('su_card_span_' + CWS.originalSettings.ExpandedWidth);
             $('.contact_item_list_expanded_data', li).append(card);
         }

        if (contact.Emails != null && contact.Emails.length > 0) {
            var template = $('.su_expand_email_data_list', CWS.templates.searchResultContactRowTemplate).parent();
            var itemTemplate = $('.su_expand_email_data_list li', template)[1];
            var card = template.clone();
            assignNamedLabel(card, contact.Name);
            $('.su_expand_email_data_list li:not(:first-child)', card).remove();
            for (var i = 0; i < contact.Emails.length; i++) {
                var emailItem = $(itemTemplate).clone().removeClass().addClass('su_email');
                $('h4', emailItem).text(contact.Emails[i]);
                addToolTip($('h4', emailItem));
                $(emailItem).click(function () {
                    var _li = getTitleDescriptionIndex($(li));
                    var itype = ($(li).attr('resulttype') == ResultType.Contact ? 'Contact' : 'SiteSearch');
                    var recordExpanded = $(li).hasClass('su_w_s_expand') ? itype + 'Expanded' : itype + 'Collapsed';
                    logAction('clickOnEmailIcon', itype, recordExpanded, _li.name, _li.description, '', '', _li.index, 0);
                    openSendMailForm($.trim($(this).text()), li);
                });
                $('.su_expand_email_data_list', card).append(emailItem);
            }
            $('.contact_item_list_expanded_data', li).append(card);
        }

        if ((contact.Mobiles != null && contact.Mobiles.length > 0) || (contact.Phones != null && contact.Phones.length > 0) || (contact.Faxes != null && contact.Faxes.length > 0)) {
            var phoneTypeName = '';
            var template = $('.su_expand_phone_data_list', CWS.templates.searchResultContactRowTemplate).parent();
            var itemTemplate = $('.su_expand_phone_data_list li', template)[1];
            var card = template.clone();
            assignNamedLabel(card, contact.Name);
            $('.su_expand_phone_data_list li:not(:first-child)', card).remove();
            if (contact.Mobiles != null && contact.Mobiles.length > 0) {
                phoneTypeName = $(itemTemplate).attr('mobile');
                for (var j = 0; j < contact.Mobiles.length; j++) {
                    var mobileItem = $(itemTemplate).clone().removeClass().addClass('su_mobile').attr('aria-label', phoneTypeName);
                    $('h4', mobileItem).text(contact.Mobiles[j]);
                    addToolTip($('h4', mobileItem));
                    if (CWS.originalSettings.EnableCall) {
                        $(mobileItem).click(function () {
                            var _li = getTitleDescriptionIndex($(li));
                            var itype = ($(li).attr('resulttype') == ResultType.Contact ? 'Contact' : 'SiteSearch');
                            var recordExpanded = $(li).hasClass('su_w_s_expand') ? itype + 'Expanded' : itype + 'Collapsed';
                            logAction('clickOnPhoneIcon', itype, recordExpanded, _li.name, _li.description, '', '', _li.index, 0);
                            openPhoneCallForm($.trim($(this).text()), li);
                        });
                    }
                    $('.su_expand_phone_data_list', card).append(mobileItem);
                }
            }
            if (contact.Phones != null && contact.Phones.length > 0) {
                phoneTypeName = $(itemTemplate).attr('phone');
                for (var p = 0; p < contact.Phones.length; p++) {
                    var phoneItem = $(itemTemplate).clone().removeClass().addClass('su_phone').attr('aria-label', phoneTypeName);
                    $('h4', phoneItem).text(contact.Phones[p]);
                    addToolTip($('h4', phoneItem));
                    if (CWS.originalSettings.EnableCall) {
                        $(phoneItem).click(function () {
                            var _li = getTitleDescriptionIndex($(li));
                            var itype = ($(li).attr('resulttype') == ResultType.Contact ? 'Contact' : 'SiteSearch');
                            var recordExpanded = $(li).hasClass('su_w_s_expand') ? itype + 'Expanded' : itype + 'Collapsed';
                            logAction('clickOnPhoneIcon', itype, recordExpanded, _li.name, _li.description, '', '', _li.index, 0);
                            openPhoneCallForm($.trim($(this).text()), li);
                        });
                    }
                    $('.su_expand_phone_data_list', card).append(phoneItem);
                }
            }
            if (contact.Faxes != null && contact.Faxes.length > 0) {
                phoneTypeName = $(itemTemplate).attr('fax');
                for (var f = 0; f < contact.Faxes.length; f++) {
                    var faxItem = $(itemTemplate).clone().removeClass().addClass('su_fax').attr('aria-label', phoneTypeName);
                    $('h4', faxItem).text(contact.Faxes[f]);
                    addToolTip($('h4', faxItem));
                    $(faxItem).click(function () {
                        var _li = getTitleDescriptionIndex($(li));
                        var itype = ($(li).attr('resulttype') == ResultType.Contact ? 'Contact' : 'SiteSearch');
                        var recordExpanded = $(li).hasClass('su_w_s_expand') ? itype + 'Expanded' : itype + 'Collapsed';
                        logAction('clickOnPhoneIcon', itype, recordExpanded, _li.name, _li.description, '', '', _li.index, 0);
                    });
                    $('.su_expand_phone_data_list', card).append(faxItem);
                }
            }
            $('.contact_item_list_expanded_data', li).append(card);
        }

        if (contact.HomeAddress != null) {
            var template = $('.su_expand_address_data_list', CWS.templates.searchResultContactRowTemplate).parent();
            var card = template.clone();
            assignNamedLabel(card, contact.Name);
            $('.su_expand_address_data_list li:not(:first-child)', card).remove();

            var address = contact.HomeAddress.replace(/\(mapme\)/i, "");
            var imgMap = null;
            if (/\(mapme\)/i.test(contact.HomeAddress)) {
                var encodedAddress = encodeURIComponent(address);
                var imageUrl = CWS.mapImageUrl.replace('^ADDRESS^', encodedAddress);
                var addressmapItem = $('.su_expand_address_data_list li.su_address_map_img', template).clone();
                imgMap = $('img', addressmapItem);
                $('.su_expand_address_data_list', card).append(addressmapItem);
                $(imgMap).attr('src', imageUrl).one('load', function () {
                    $('.contact_item_list_expanded_data.masonryApplied', li).masonry('destroy').removeClass('masonryApplied');
                    $('.contact_item_list_expanded_data', li).addClass('masonryApplied').masonry(masonrySettings);
                });
            }

            var addressItem = $('.su_expand_address_data_list li.su_address', template).clone();
            $('h4', addressItem).text(address);
            addToolTip($('h4', addressItem));
            $('.su_expand_address_data_list', card).append(addressItem);

            if (/\(mapme\)/i.test(contact.HomeAddress)) {
                var addUrl = CWS.mapAddressUrl.replace('^ADDRESS^', encodedAddress);
                var parkUrl = CWS.mapParkingUrl.replace('^ADDRESS^', encodedAddress);
                var addresslinksItem = $('.su_expand_address_data_list li.su_address_links', template).clone();
                $(imgMap).closest('a').attr('href', addUrl);
                $(imgMap).closest('a').attr('target', CWS.originalSettings.LinksTargetTop ? "_top" : "_blank");
                $('.addressDirection', addresslinksItem).attr('href', addUrl);
                $('.addressParking', addresslinksItem).attr('href', parkUrl);
                assignNamedLabel($('.addressDirection', addresslinksItem), address);
                assignNamedLabel($('.addressParking', addresslinksItem), address);
                $('.su_expand_address_data_list', card).append(addresslinksItem);
            }
            $('.contact_item_list_expanded_data', li).append(card);
        }

        if (contact.Htmls != null && contact.Htmls.length > 0) {
            var template = $('.su_expand_html_data_list', CWS.templates.searchResultContactRowTemplate).parent();
            for (var h = 0; h < contact.Htmls.length; h++) {
                if ((/\[RURL\]/g).test(contact.Htmls[h])) {
                    clientSiteUrl = location.href;
                    if (CWS.isIFrameMode == true || (document.referrer !== null && document.referrer !== '' && typeof document.referrer !== 'undefined')) {
                        clientSiteUrl = document.referrer;
                    }
                    contact.Htmls[h] = contact.Htmls[h].replace((/\[RURL\]/g), encodeURIComponent(clientSiteUrl));
                }
                if ((/\[CLIENTID\]/g).test(contact.Htmls[h])) {
                    contact.Htmls[h] = contact.Htmls[h].replace((/\[CLIENTID\]/g), encodeURIComponent(CWS.originalSettings.clientId));
                }
                if ((/\[STERM\]/g).test(contact.Htmls[h])) {
                    contact.Htmls[h] = contact.Htmls[h].replace((/\[STERM\]/g), encodeURIComponent(getQueryText()));
                }


                var card = template.clone();
                var html = contact.Htmls[h];
                if (html.indexOf('<li') !== 0) {
                    html = '<li>' + html + '</li>';
                }
                var cardSpan = $(html).first().attr('card_span');
                $('.su_expand_html_data_list', card).html(html);
                var ifram1e = $('.su_expand_html_data_list', card).find('iframe');
                if (typeof (ifram1e.get(0)) !== "undefined") {
                    var siteUrl1 = '';
                    if (parent) {
                        siteUrl1 = document.referrer;
                    }
                    if (ifram1e.attr('src').indexOf('?') == -1)
                        $('.su_expand_html_data_list', card).find('iframe').attr('src', ifram1e.attr('src') + "?s=" + encodeURIComponent(getQueryText()) + "&rurl=" + encodeURIComponent(siteUrl1));
                    else
                        $('.su_expand_html_data_list', card).find('iframe').attr('src', ifram1e.attr('src') + "&s=" + encodeURIComponent(getQueryText()) + "&rurl=" + encodeURIComponent(siteUrl1));
                }

                $('.su_expand_html_data_list', card).find('a').attr('tabindex', 1);
                $('.su_expand_html_data_list', card).find('div a').attr('role', 'link');
                if (typeof (cardSpan) != "undefined" && cardSpan > 1) {
                    $(card).addClass('su_card_span_' + cardSpan);
                }
                assignNamedLabel($('[aria-label~="^NAME^"]', card), contact.Name);
                $(card).find('img').one('load', function () {
                    $('.contact_item_list_expanded_data.masonryApplied', li).masonry('destroy').removeClass('masonryApplied');
                    $('.contact_item_list_expanded_data', li).addClass('masonryApplied').masonry(masonrySettings);
                });
                //hide placeholder card for external content
                if ($.isFunction(CWS.isExternalContentPlaceholderCard) && CWS.isExternalContentPlaceholderCard(html)) {
                    $(card).hide();
                }
                $('.contact_item_list_expanded_data', li).append(card);
            }
        }
        widget_ads.addAdsToResponse(li);
        $('.contact_item_list_expanded_data.masonryApplied', li).masonry('destroy').removeClass('masonryApplied');
        $('.contact_item_list_expanded_data', li).addClass('masonryApplied').masonry(masonrySettings);
    }

    function getCSS(prop, fromClass) {
        var $inspector = $("<div>").css('display', 'none').addClass(fromClass);
        $("body").append($inspector); // add to DOM, in order to read the CSS property
        try {
            return $inspector.css(prop);
        } finally {
            $inspector.remove(); // and remove from DOM
        }
    }

    function masonryLayoutComplete(msnryInstance, laidOutItems) {
        trace('masonry layoutComplete', TraceLevel.DEBUG);
    }

    function logRecordExpandCollapse(li, action) {
        var _li = getTitleDescriptionIndex(li);
        var itype = (li.attr('resultType') == ResultType.Contact ? 'Contact' : 'SiteSearch');
        logAction(action, itype, (CWS.curState == WidgetState.EXPANDED ? 'widgetExpanded' : 'widgetCollapsed'), _li.name, _li.description, '', '', _li.index, new Date().getTime());
    }

    function getTitleDescriptionIndex(li) {
        var a = {
            name: $.trim($('.site_search_su_results_t_name,.su_results_t_name', li).text()),
            description: $.trim($('.site_search_results_t_description,.su_results_t_description', li).text()),
            index: li.index() + 1
        };
        return a;
    }

    function logHoverDelay(li, time) {
        var _li = getTitleDescriptionIndex(li);
        var itype = (li.attr('resultType') == ResultType.Contact ? 'Contact' : 'SiteSearch');
        logAction('hoverSearchResult', itype, li.hasClass('su_w_s_expand') ? 'Expanded' : 'Collapsed', _li.name, _li.description, '', '', _li.index, time);
    }

    function generateContactResult(contact, index) {
        var currResultRow = $(CWS.templates.searchResultContactRowTemplate).clone(false).removeClass('su_even su_odd');

        currResultRow.data('json', contact);
        currResultRow.addClass(index % 2 == 0 ? 'su_even' : 'su_odd');
        assignNamedLabel($(currResultRow), contact.Name);
        var liCustomAction = null;
        if (contact.CustomAction != null) {
            try {
                liCustomAction = $(contact.CustomAction);
            } catch (err) { } //Non valid html
        }
        var liPhone = $('.su_w_s_actions_list li.su_phone', currResultRow).clone();
        var liEmail = $('.su_w_s_actions_list li.su_email', currResultRow).clone();
        var liAddress = $('.su_w_s_actions_list li.su_address', currResultRow).clone();

        var expandBtn = $(currResultRow).find('.contact_expand_btn').clone();

        assignNamedLabel($('button', expandBtn), contact.Name, true);
        $(currResultRow).attr('row', searchContactsIndex);
        $(currResultRow).attr('id', 'search_result_id_' + searchContactsIndex++);
        $(currResultRow).attr('resultType', ResultType.Contact);
        $(currResultRow).attr('contactid', contact.Id);
        $(currResultRow).find('.su_results_t_name h3').html(contact.Name);
        addToolTip($(currResultRow).find('.su_results_t_name h3'));

        if (contact.Title != null) {
            $(currResultRow).find('.su_results_t_description h4').text(contact.Title);
        } else {
            hideElement($(currResultRow).find('.su_results_t_description'));
        }
        addToolTip($(currResultRow).find('.su_results_t_description h4'));
        if (contact.Image != null) {
            $(currResultRow).find('.su_w_s_search_content_item_picture img').remove();

            $(currResultRow).find('.su_w_s_search_content_item_picture').prepend('<div id="SU_Img' + index + '" style="background-position: center; background-image:url(\'' + contact.Image + '\');height: 100%;width: 100%;border-radius:0;background-size: cover;" alt="' + escape(contact.Name) + ' contact picture" ></div>');

        } else {
            $(currResultRow).find('.su_w_s_search_content_item_picture img').attr('alt', contact.Name + ' contact picture');
        }

        //clear preview icons
        $('.su_w_s_actions_list', currResultRow).html('');
        //Expanded view data preparation
        $('.contact_item_list_expanded_data', currResultRow).html('');

        if (contact.Emails != null && contact.Emails.length > 0 && liCustomAction == null) {
            $('.su_w_s_actions_list', currResultRow).append(liEmail);
            $('.su_w_s_actions_list > li:last', currResultRow).addClass('su_email').show();
        }

        if (((contact.Mobiles != null && contact.Mobiles.length > 0) || (contact.Phones != null && contact.Phones.length > 0) || (contact.Faxes != null && contact.Faxes.length > 0)) && liCustomAction == null) {
            $('.su_w_s_actions_list', currResultRow).append(liPhone);
            $('.su_w_s_actions_list > li:last', currResultRow).addClass('su_phone').show();
        }

        if (contact.HomeAddress != null) {
            if (!CWS.flags.IsInHighContrastMode && liCustomAction == null) {
                $('.su_w_s_actions_list', currResultRow).append(liAddress);
                $('.su_w_s_actions_list > li:last', currResultRow).addClass('su_address').show();
            }
        }

        if (liCustomAction != null) {
            $('.su_w_s_actions_list', currResultRow).append(liCustomAction);
        }

        $('.su_hc', $(expandBtn)).text($('.su_hc', $(expandBtn)).attr('expand'));
        $('.su_w_s_actions_list', currResultRow).append(expandBtn);

        if (widget_ads.isContentAdsOn()) {
            $(currResultRow).addClass('borderTopFix');
        }

        $('#su_w_s_search_content_list').append($(currResultRow));
    }

    function addToolTip(elem, tip) {
        if (typeof (tip) == "undefined" || tip == null) {
            var tip = elem.text();
        }
        elem.attr('title', tip);
    }

    function scrollHandler() {
        //checkLogExposure();
        var myDiv = $('#su_w_s_search_content_wrapper')[0];
        if (myDiv.offsetHeight + myDiv.scrollTop >= (myDiv.scrollHeight * CWS.scrollPercentageExtraLoader)) {
            $('#su_w_s_search_content_wrapper').off('scroll.main');
            loadMoreContacts(bindScroll);
        }
    } //scrollHandler

    function checkLogExposure() {
        if (shouldTrack) {
            var lastItem = $('.su_w_s_search_content_item').filter(function (index) {
                return $(this).offset().top >= (CWS.curState == WidgetState.EXPANDED ? 416 : 300) && $(this).offset().top <= (CWS.curState == WidgetState.EXPANDED ? 508 : 392)
            });
            var lastId = CWS.lastIndexLogged;
            if (lastItem != null && lastItem.length > 0) {
                lastId = lastItem.attr('row');
            } else if (!CWS.moreContactsAvailable) {
                lastId = $('.su_w_s_search_content_item:last').attr('row');
            }
            lastId = parseInt(lastId);
            if (lastId > CWS.lastIndexLogged) {
                var data = buildLogData('searchResultShown', 'Contact', 'Collapsed', '', '', '', '', CWS.lastIndexLogged);
                $.extend(data, { fromIndex: CWS.lastIndexLogged + 1, toIndex: lastId });
                trace(data, TraceLevel.DEBUG);

                if (CWS.traceLevel == TraceLevel.DEBUG) {
                    $.ajax({
                        url: SU_BaseUrlServiceHttp + 'LogExposure',
                        data: data,
                        type: "GET",
                        dataType: "jsonp",
                        success: function (data) {
                            CWS.lastIndexLogged = lastId;
                        },
                        error: function (data) {
                            trace('log error ' + data, TraceLevel.INFO);
                        }
                    });
                }
            }
        }
    }

    function bindScroll() {
        trace('scrollissue bindScroll', TraceLevel.DEBUG);
        $('#su_w_s_search_content_wrapper').off('scroll.main');
        $('#su_w_s_search_content_wrapper').on("scroll.main", scrollHandler);
    }

    function GetSiteSearchObj(data) {
        if (typeof (data) == "undefined") {
            return null;
        }
        var obj = data;
        if (obj == null || typeof obj.Results == 'undefined') {
            return null;
        }
        return obj;
    }

    function generateDefaultCategories(defaultCategories, filterType) {
        var ul = $('#su_w_s_filter_list');
        $('li', ul).remove();

        $(ul).attr('filtertype', '');
        if (defaultCategories == null) return;
        $(ul).attr('filtertype', filterType);

        $('#su_w_s_results_wrapper').removeClass('su_w_s_spell_hint').removeClass('su_w_s_categories_hint');
        if (defaultCategories.length > 0) {
            if (filterType == FilterType.Suggestion) {
                $('#su_w_s_results_wrapper').addClass('su_w_s_spell_hint');
                $('#su_w_s_sub_title_spell_check').attr('aria-hidden', false);
                $('#su_w_s_sub_title_categories').attr('aria-hidden', true);
            }
            else if (filterType == FilterType.Category || filterType == FilterType.DefaultCategory) {
                $('#su_w_s_results_wrapper').addClass('su_w_s_categories_hint');
                $('#su_w_s_sub_title_spell_check').attr('aria-hidden', true);
                $('#su_w_s_sub_title_categories').attr('aria-hidden', false);
            }
        }

        for (var i = 0; i < defaultCategories.length; i++) {
            var elem = CWS.templates.defaultCategoryTemplate.clone();

            $(elem).attr('filterType', filterType);

            if (typeof (defaultCategories[i].Selected) != "undefined" && defaultCategories[i].Selected == true) {
                $(elem).addClass('active');
            }

            if (filterType == FilterType.DefaultCategory) {
                $('h2', elem).text(getFormattedCategory(defaultCategories[i], false)).attr('tabindex', 1).data('category-name', defaultCategories[i]);
            } else if (filterType == FilterType.Category) {
                $('h2', elem).text(getFormattedCategory(defaultCategories[i].Name, false)).attr('tabindex', 1).data('category-name', defaultCategories[i].Name);
            } else if (filterType == FilterType.Suggestion) {
                $('h2', elem).text(defaultCategories[i]).attr('tabindex', 1).data('category-name', defaultCategories[i]);
            }
            ul.append(elem);
        }

        // add event listener for clicks for category and suggestions
        $('#su_w_s_filter_list li').bind('click keyup', function (el) {

            if (el.type == 'keyup') {
                var code = el.keyCode || el.which;
                if (code != 13) { //Enter keycode
                    return;
                }
            }

            var searchText = $('#su_w_s_search_input').val();
            var filterType = $(this).attr('filterType');

            // if (filterType == FilterType.DefaultCategory) {
            //     gaTrack('defaultCategory', 'Category', $(el.target).text());
            // } else if (filterType == FilterType.Category) {
            //     gaTrack('Category', 'Category', $(el.target).text());
            // } else 
            if (filterType == FilterType.Suggestion) {
                //gaTrack('Hint', 'Hint', $(el.target).text());
                searchText = $.trim($(el.target).closest('li').text());
                logAction('clickOnSpellCheck', '', (CWS.curState == WidgetState.EXPANDED ? 'widgetExpanded' : 'widgetCollapsed'), '', '', '', '', 0, 0);
            }

            $(el.target).closest('li').toggleClass('active');
            //    $('#su_w_s_search_input').focus();
            $('#su_w_s_search_input').val(searchText);
            if (filterType == FilterType.Suggestion) {
                $('#su_w_s_search_input').trigger('keyup');
            }
            else {
                $('#su_w_s_search_input').trigger('keyup', [$(el.target).text(), $(this).index() + 1]);
            }
        });
        showElement($('#su_w_s_filter_list'));
    }

    function getFormattedCategory(category, includeNumber) {
        try {
            if (category.indexOf('~') < 0) {
                return category;
            }
            if (includeNumber) {
                category = category.substring(0, category.indexOf('~')) + ' (' + category.substring(category.indexOf('~') + 1) + ')';
            } else {
                category = category.substring(0, category.indexOf('~'));
            }
        } catch (e) {
            category = '';
        }
        return category;
    }
    function setFocus(li) {
        var obj = li.data('json');
        if (typeof obj.Name != 'undefined') {//contact search
            $('#su_w_s_contact_focus_box .su_focus_t_name h2').text(obj.Name);
            $('#su_w_s_contact_focus_box .su_w_s_search_content_item_picture img').remove();
            if (obj.Image != null) {
                $('#su_w_s_contact_focus_box .su_w_s_search_content_item_picture').append('<img src="' + obj.Image + '" style="width:50px;height:50px;">');
            }
            $('#su_w_s_contact_focus_box .contact_item_focus_list .su_focus_t_description h3').text(obj.Title);
        } else {//site search
            //todo : siteSearch expand

            $('#su_w_s_results_detail_contact_header .su_w_s_results_detail_header_list img').attr('src', $(li).find('.su_w_s_site_search_content_item_picture img').attr('src'));
            $('#su_w_s_results_detail_contact_header .su_detail_header_t_name h2').html(obj.title);
            $('#su_w_s_results_detail_contact_header .su_detail_header_t_description h3').html(obj.htmlSnippet);
            //su_detail_header_t_name
        }
    }

    function bindKeyBoardNavigation() {
        trace('bindKeyBoardNavigation', TraceLevel.DEBUG);
        var agent = window.navigator.userAgent,
            start = agent.indexOf('OS ');
        var ios = ((agent.indexOf('iPhone') > -1 || agent.indexOf('iPad') > -1) && start > -1);
        var android = navigator.userAgent.indexOf('Android') != -1;

        if (!ios && !android) {
            $(document).keydown(function (event) {
                if (event.which == 27) {
                    showReadyState();
                }
            });
        }
    }

    function findFirstVisibleElement(direction) {
        var currSelectedEl = $('#su_w_s_search_content_list li.su_selected');
        var currSelectedIndex = parseInt($(currSelectedEl).attr('row'));

        if (direction == 'up') { // up
            var counter = 3;
            for (var i = currSelectedIndex; i >= 0; i--) {
                var el = $('#su_w_s_search_content_list li[row=' + i + ']');
                if (!elementVisibleAtUl(el) && counter-- <= 0) {
                    return el;
                }
            }
            return null;
        } else { // down
            currSelectedIndex += 1;
            for (var j = currSelectedIndex; j < $('#su_w_s_search_content_list li').length; j++) {
                var el = $('#su_w_s_search_content_list li[row=' + j + ']');
                if (!elementVisibleAtUl(el)) {
                    return el;
                }
            }
            return null;
        }
    }

    function elementVisibleAtUl(li) {
        if ($(li).offset() == null) return true;
        if ($(li).offset().top < $('#su_w_s_search_content_wrapper').offset().top) { // element over upper border
            return false;
        } else if ($(li).offset().top + $(li).height() > $('#su_w_s_search_content_wrapper').offset().top + $('#su_w_s_search_content_wrapper').height()) { // element over down border
            return false;
        }
        return true;
    }

    function getEmptyResult() {
        var data = new Object();
        data.Contacts = [];
        data.Categories = [];
        data.Suggestions = [];
        data.TotalContacts = 0;
        return data;
    }


    function showNoResultsMsg(state) {
        if (state) {
            var noResultAdslength = widget_ads.ads.search_ad_noresult_height.length;
            var noResultAds_height = 0;
            if (noResultAdslength) {
                for (var i = 0; i < noResultAdslength; i++) {
                    //the li element is 5 px bigger than the iframe allways 
                    noResultAds_height += (parseInt(widget_ads.ads.search_ad_noresult_height[i]) + 5);
                };
                noResultAds_height = (($("#su_w_s_search_content_wrapper").height() + noResultAds_height) / 2) + "px";
            }
            if (noResultAds_height != 0) {
                $('#su_w_s_search_content_box_no_results_msg').css("top", noResultAds_height);
            }
            showElement($('#su_w_s_search_content_box_no_results_msg'));
            $(".su_w_s_sorting_box").toggleClass("no_result",true);
        } else {
            hideElement($('#su_w_s_search_content_box_no_results_msg,#su_w_s_site_search_no_results_message'));
            $(".su_w_s_sorting_box").toggleClass("no_result", false);
        }
    }

    function showErrorMessage(state) {
        showLoading(false);
        if (state) {
            showElement($('#su_w_s_search_content_box_search_error_msg'));
            hideElement($('#su_w_s_search_content_list'));
        } else hideElement($('#su_w_s_search_content_box_search_error_msg'));
    }

    function hasQueryDefined() {
        return hasQueryTextDefined() || $('#su_w_s_filter_list li.active').length > 0;
    }

    function hasQueryTextDefined() {
        return ($('#su_w_s_search_input').val() != '' && $('#su_w_s_search_input').val() != CWS.originalSettings.PlaceHolder);
    }


    function getSelectedCategories() {
        var a = [];
        $('#su_w_s_filter_list .su_w_s_hint_item.active').each(function (_, elem) {
            if ($(elem).attr('filterType') != FilterType.Suggestion) {
                //a.push($.trim($('h2', elem).data('category-name')));
                a.push($.trim($('h2', elem).text()));
            }
        });
        return a;
    }

    function getSelectionHtml() {
        var html = "";
        if (typeof window.getSelection != "undefined") {
            var sel = window.getSelection();
            if (sel.rangeCount) {
                var container = document.createElement("div");
                for (var i = 0, len = sel.rangeCount; i < len; ++i) {
                    container.appendChild(sel.getRangeAt(i).cloneContents());
                }
                html = container.innerHTML;
            }
        } else if (typeof document.selection != "undefined") {
            if (document.selection.type == "Text") {
                html = document.selection.createRange().htmlText;
            }
        }
        return html;
    }


    //////////////////////////////////////////////////////////////////////////////////////////////////////////////
    //////////////////////////////////////////////////////////////////////////////////////////////////////////////
    //////////////////////////////////////////////////////////////////////////////////////////////////////////////
    //////////////////// FUNCTIONS IN USE
    //////////////////////////////////////////////////////////////////////////////////////////////////////////////
    //////////////////////////////////////////////////////////////////////////////////////////////////////////////
    //////////////////////////////////////////////////////////////////////////////////////////////////////////////
    //////////////////////////////////////////////////////////////////////////////////////////////////////////////

    function loadScript(src, callback) {
        src.link = src.link.replace('^VER^', CWS.baseVersion);
        if (src.name != "JQuery" && src.name != "json2")
            src.link = src.link + "?ver=" + CWS.widgetVersion;

        var script = null;
        if (src.type == 'js') {
            if (src.name == "JQuery") { //jQuery
                if (window.jQuery != undefined && window.jQuery.fn.jquery == '1.9.1') { // check if jquery already loaded
                    trace('script already loaded ' + src.link, TraceLevel.DEBUG);
                    jQuery = window.jQuery; // The jQuery version on the window is the one we want to use
                    callback(src.name);
                    return;
                }
            }

            script = document.createElement("script");
            script.setAttribute("type", "text/javascript");
            script.setAttribute("src", src.link);

        } else if (src.type == 'css') { // css files
            trace('loaded - ' + src.name, TraceLevel.INFO);
            if (getBrowserName() == 'safari') {
                loadStyleSheetSafari(src.link, callback(src.name), this);
                return;
            } else {
                // not working at safari
                script = document.createElement("link");
                script.setAttribute('rel', 'stylesheet');
                script.setAttribute('type', 'text/css');
                script.setAttribute('href', src.link);
            }
        } else {
            trace('loadScript Error type to load ' + src.link, TraceLevel.DEBUG);
            return;
        }

        if (script.readyState) {
            script.onreadystatechange = function () { // For old versions of IE
                if (this.readyState == 'complete' || this.readyState == 'loaded') {
                    trace('loaded - ' + src.name, TraceLevel.INFO);
                    script.onload = script.onreadystatechange = null;
                    callback(src.name);
                }
            };
        } else { // Other browsers
            script.onload = function (event) {
                trace('loaded - ' + src.name, TraceLevel.INFO);
                callback();
            };
            script.onerror = function (event) {
                trace('error loading resource - ' + src.link, TraceLevel.ERROR);
                callback(-200); //stop widget loading
            };
        }
        (document.getElementsByTagName("head")[0] || document.documentElement).appendChild(script);
    }

    function loadStyleSheetSafari(path, fn, scope) {
        var head = document.getElementsByTagName('head')[0],
        link = document.createElement('link');
        link.setAttribute('href', path);
        link.setAttribute('rel', 'stylesheet');
        link.setAttribute('type', 'text/css');

        var sheet, cssRules;
        // get the correct properties to check for depending on the browser
        if ('sheet' in link) {
            sheet = 'sheet'; cssRules = 'cssRules';
        }
        else {
            sheet = 'styleSheet'; cssRules = 'rules';
        }

        var interval_id = setInterval(function () {
            try {
                if (link[sheet] && link[sheet][cssRules].length) {
                    trace('loaded safari css', TraceLevel.DEBUG);
                    clearInterval(interval_id);
                    clearTimeout(timeout_id);
                    fn.call(scope || window, true, link);
                }
            } catch (e) { } finally { }
        }, 10),
        timeout_id = setTimeout(function () {
            clearInterval(interval_id);
            clearTimeout(timeout_id);
        }, 15000);

        head.appendChild(link);
        return link;
    }

    function getCurrentLocationUrl() {
        var url = location.href;
        if (CWS.isIFrameMode == true || (document.referrer !== null && document.referrer !== '' && typeof document.referrer !== 'undefined')) {
            url = document.referrer;
        }
        return url;
    }

    function trace(message, level) {
        if (typeof (level) === 'undefined') {
            level = TraceLevel.INFO;
        }
        if (typeof window !== "undefined" && window !== null && typeof window.console !== "undefined" && window.console !== null) {
            if (level >= CWS.traceLevel) {
                console.log('Message to parent:' + message, TraceLevel.DEBUG);
            }
        }
    }

    function sendMessageToParent(message) {
        if (typeof socket != 'undefined' && socket != null) {
            trace('Message to parent:' + message, TraceLevel.DEBUG);
            //socket.postMessage(message, document.location.href);
            socket.postMessage(message, getCurrentLocationUrl());
        }
        else {
            $(SphereUp.SphereUpWidget).trigger("MessageToParent", message);
        }
    }
    function getNextSuffix() {
        CWS.flags.suffix.index = (CWS.flags.suffix.index + 1) % 2;
        return CWS.flags.suffix.keys[CWS.flags.suffix.index];
    }
    function getQueryStringParameterByName(name) {
        return getQueryStringParameterByName(name, window.location.search);
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

    function showSpecialElement(elem) {
        $(elem).css('visibility', '');
        $(elem).width('');
        $(elem).height('');
        $(elem).css('marginTop', '');
        $(elem).css('border', '');
    }
    function hideSpecialElement(elem) {
        $(elem).css('visibility', 'hidden');
        $(elem).width(0);
        $(elem).height(0);
        $(elem).css('marginTop', 0);
        $(elem).css('border', 0);
    }

    function showElement(elem) {
        $(elem).show();
        $(elem).attr('aria-hidden', false);
    }
    function hideElement(elem) {
        $(elem).hide();
        $(elem).attr('aria-hidden', true);
    }
    function assignNamedLabel(elems, name, setValue) {
        $(elems).each(function (_, elem) {
            if ($(elem).attr('aria-label') && typeof ($(elem).attr('aria-label')) !== 'undefined') {
                $(elem).attr('aria-label', $(elem).attr('aria-label').replace('^NAME^', name));
                if (setValue) {
                    $(elem).val($(elem).attr('aria-label'));
                }
            }
            if ($(elem).attr('alt') && typeof ($(elem).attr('alt')) !== 'undefined') {
                $(elem).attr('alt', $(elem).attr('alt').replace('^NAME^', name));
            }
        });
    }
    function assignNamedLabelAtAttribute(elems, value, label, attribute) {
        $(elems).each(function (_, elem) {
            if ($(elem).attr(attribute) && typeof ($(elem).attr(attribute)) !== 'undefined') {
                $(elem).attr(attribute, $(elem).attr(attribute).replace(label, value));
            }
        });
    }

    if (!String.prototype.splice) {
        String.prototype.splice = function (idx, rem, s) {
            return (this.slice(0, idx) + s + this.slice(idx + Math.abs(rem)));
        };
    }

    window.sendMailUp = function (fn, email) {
        sendMessageToParent(fn + ',' + email);
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
        }
        if (CWS.flags.isIE) {
            div.outerHTML = ""; // prevent mixed-content warning, see http://support.microsoft.com/kb/925014
        } else {
            document.body.removeChild(div);
        }
        return highContrastMode;
    }

    function getCookie(name) {
        var nameEQ = name + "=";
        var ca = document.cookie.split(';');
        for (var i = 0; i < ca.length; i++) {
            var c = ca[i];
            while (c.charAt(0) == ' ') c = c.substring(1, c.length);
            if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length, c.length);
        }
        return "";
    }

    function buildLogData(action, itemType, itemState, itemName, itemTitle, linkCaption, linkUrl, resultIndex, timeSeconds, customParams) {
        var page = ((typeof (CWS.statistics.currentPageNumber) != "number") ? 0 : CWS.statistics.currentPageNumber);
        var filterType = $('#su_w_s_filter_list').attr('filtertype');
        var filter1 = $('h2', $($('#su_w_s_filter_list li')[0])).data('category-name');
        var filter2 = $('h2', $($('#su_w_s_filter_list li')[1])).data('category-name');
        var filter3 = $('h2', $($('#su_w_s_filter_list li')[2])).data('category-name');
        var selectedCategories = getSelectedCategories();
        var query = getQueryText();
        var totalResults = $('#su_w_s_total_searched_contacts:visible').length == 1 ? $('#su_w_s_total_searched_contacts').text() :
            $('#su_w_s_discovery_content_list:visible').length == 1 ? $('#su_w_s_discovery_content_list .su_w_s_discovery_item_data_card:not(.widget_zoomd_ads)').length : 0;
        var clientSiteUrl = getCurrentLocationUrl();
        var clientPageTitle = CWS.hostSiteTitle;
        var bannerUrl = null;

        var abGroupCookieName = 'ab_' + CWS.originalSettings.clientId;
        var abGroup = getCookie(abGroupCookieName);

        filter1 = getFormattedCategory(filter1, false);
        filter2 = getFormattedCategory(filter2, false);
        filter3 = getFormattedCategory(filter3, false);

        try {
            totalResults = parseInt(totalResults);
        } catch (e) {
            totalResults = 0;
        }

        if (totalResults == '' || totalResults == 'undefined') {
            totalResults = 0;
        }

        if (filterType == FilterType.Category || filterType == FilterType.DefaultCategory) {
            filterType = 'category';
        } else {
            filterType = 'suggestion';
        }

        if (resultIndex == '' || resultIndex == null || isNaN(resultIndex)) resultIndex = 0;
        if (timeSeconds == '' || timeSeconds == null || isNaN(timeSeconds)) timeSeconds = 0;

        if ($('#su_w_s_banner_wrapper').is(":visible")) { // if banner visible at all
            if ($('#su_w_s_small_banner').is(":visible")) { // get url of small
                bannerUrl = $('#su_w_s_small_banner img').attr('src');
            } else if ($('#su_w_s_big_banner').is(":visible")) {  // get url of large
                bannerUrl = $('#su_w_s_big_banner img').attr('src');
            }
        }
        var data = {
            action: action,
            clientId: CWS.originalSettings.clientId,
            sessionId: CWS.originalSettings.sessionId,
            abGroup: abGroup,
            query: query,
            filterType: filterType,
            filter1: filter1,
            filter2: filter2,
            filter3: filter3,
            itemType: itemType,
            itemState: itemState,
            itemName: itemName,
            itemTitle: itemTitle,
            linkCaption: linkCaption,
            linkUrl: linkUrl,
            totalResults: totalResults,
            resultIndex: resultIndex,
            resolution: CWS.statistics.resolution,
            clientSiteUrl: clientSiteUrl,
            clientPageTitle: clientPageTitle,
            zoom: CWS.statistics.zoom,
            timeSeconds: timeSeconds,
            page: page,
            bannerUrl: customParams && customParams.bannerUrl,//bannerUrl,
            selectedCategories: JSON.stringify(selectedCategories),
            widgetMinorVersion: CWS.widgetMinorVersion,
            language: CWS.language,
            referrer: CWS.reff,
            platform: CWS.originalSettings.platform,
            startTime: new Date().toISOString()//,
            //customParams: JSON.stringify(customParams)
            //if added server returning 404 
        };
        if (CWS.EntryPoint) {
            data.entryPoint = CWS.EntryPoint;
        }
        if (SphereUp.SphereUpWidget.ServerInit && SphereUp.SphereUpWidget.ServerInit.abTesting) {
            data.abTesting = SphereUp.SphereUpWidget.ServerInit.abTesting;
        }
        return data;
    }

    function logAction(action, itemType, itemState, itemName, itemTitle, linkCaption, linkUrl, resultIndex, timeSeconds, customParams) {
        if (!shouldTrack || CWS.originalSettings.Design_Mode) {
            return;
        }

        var data = buildLogData(action, itemType, itemState, itemName, itemTitle, linkCaption, linkUrl, resultIndex, timeSeconds, customParams);

        trace(data, TraceLevel.DEBUG);

        if (window.appInsights && $.isFunction(window.appInsights.trackEvent)) {
            window.appInsights.trackEvent(action);
        }

        if (CWS.traceLevel != TraceLevel.DEBUG) {
            $.ajax({
                url: SU_BaseUrlServiceHttp + 'LogClientAction',
                data: { clientId: CWS.originalSettings.clientId, action: action, eventData: JSON.stringify(data) },
                type: "POST",
                dataType: "json",
                success: function (data) {
                    trace('log successfull ' + data, TraceLevel.DEBUG);
                },
                error: function (data) {
                    trace('log error ' + data, TraceLevel.DEBUG);
                }
            });
        }
    }

    function checkSecured() {
        if (location.protocol.indexOf('https') >= 0) {
            var i;
            SU_BaseUrlServiceHttp = SU_BaseUrlServiceHttp.replace('http:', 'https:');
            ie98PlaceHolder.link = ie98PlaceHolder.link.replace('http:', 'https:');
            cssSource.link = cssSource.link.replace('http:', 'https:');
            cssSourcePath = cssSourcePath.replace('http:', 'https:');
            for (i = 0; i < sources.length; i++) {
                sources[i].link = sources[i].link.replace('http:', 'https:');
            }
            for (i = 0; i < signalR.length; i++) {
                signalR[i].link = signalR[i].link.replace('http:', 'https:');
            }
        }
    };

    function validatePhoneNumber(strPhone) {
        //var regEx = new RegExp('^(\+[0-9]{2,}[0-9]{4,}[0-9]*)(x?[0-9]{1,})?$');
        var regEx = new RegExp(/^\+(9[976]\d|8[987530]\d|6[987]\d|5[90]\d|42\d|3[875]\d|2[98654321]\d|9[8543210]|8[6421]|6[6543210]|5[87654321]|4[987654310]|3[9643210]|2[70]|7|1)[1-9](\d{7,13})$/);
        return regEx.test(strPhone);
    }

    function canEnterState(state) {
        if (CWS.originalSettings.SkipStates == null)
            return true;
        return CWS.originalSettings.SkipStates.indexOf(state) < 0;
    }

    isFoxClient = function (clientId) {
        if (clientId == "21729253" || clientId == "25604989" || clientId == "16410241" || clientId == "77456887"
         || clientId == "04167873" || clientId == "98456893" || clientId == "81252467" || clientId == "92708591"
         || clientId == "01378581" || clientId == "74235769" || clientId == "82878773" || clientId == "84161989"
         || clientId == "92509037" || clientId == "78022579" || clientId == "14456389" || clientId == "20890989"
         || clientId == "76723211" || clientId == "24976767" || clientId == "25604989-2")
            return true;

        return false;
    }

})();

(function (a) {
    ($.browser = $.browser || {}).mobile = /(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(a) || /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0, 4));
})(navigator.userAgent || navigator.vendor || window.opera);