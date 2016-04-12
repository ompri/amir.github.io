var socket = null;

function getQueryStringParameterByName(name) {
    name = name.replace(/[\[]/, "\\\[").replace(/[\]]/, "\\\]");
    var regexS = "[\\?&]" + name + "=([^&#]*)";
    var regex = new RegExp(regexS, "i");
    var results = regex.exec(window.location.search);
    if (results == null)
        return "";
    else
        return decodeURIComponent(results[1].replace(/\+/g, " "));
}

//$(document).ready(function () {

    var clientId = getQueryStringParameterByName('clientId');
    var widgetVersion = getQueryStringParameterByName('ver');
    var userWidgetId = getQueryStringParameterByName('userWidgetId');
    var maxWidth = getQueryStringParameterByName('maxWidth');
    var platform = getQueryStringParameterByName('platform');
//SphereUp.SphereUpWidget.startWidget(JSON.parse(unescape(getQueryStringParameterByName('userOptions'))));

    function onMessageHandler(e) {
        var origin = e.origin || e.originalEvent.origin;
        var message = e.data;
        if (typeof (message) == 'string') {
            if (message == "parentMinimizeWidget") {
                SphereUp.SphereUpWidget.minimizeWidget();
            }
            else if (message == "parentCloseSiteSearch") {
                SphereUp.SphereUpWidget.closeSiteSearch();
            }
            else if (message == "hoverInWidget") {
                SphereUp.SphereUpWidget.hoverInWidget();
            }
            else if (message == "hoverInWidgetNoFocus") {
                SphereUp.SphereUpWidget.hoverInWidget(true);
            }
            else if (message == "hoverOutWidget") {
                SphereUp.SphereUpWidget.hoverOutWidget();
            }
            else if (message.indexOf('setTitle') == 0) {
                SphereUp.SphereUpWidget.setPageTitle(message);
            }
            else if (message.indexOf('zoom:') == 0) {
                var zoom = message.split(':')[1];
                SphereUp.SphereUpWidget.setZoom(zoom);
            }
            else if (message.indexOf('search:') == 0) {
                var q = message.split(':')[1];
                SphereUp.SphereUpWidget.search(q);
            } else if (message.indexOf('hidePlacementAd:') == 0) {
                if (origin !== SphereUp.SphereUpWidget.ServerInit.baseUrlServiceHttp && (origin + '/') !== SphereUp.SphereUpWidget.ServerInit.baseUrlServiceHttp)
                    return;
                var placement = message.split(':')[1];
                SphereUp.SphereUpWidget.hidePlacement(placement);
            }
        }
    }

    /////////EasyXDM////////
    socket = parent;//new easyXDM.Socket({
    if (window.addEventListener) {
        window.addEventListener('message', function (e) {
            onMessageHandler(e);
        });
    }
    else   // IE8 IE9
    {
        window.attachEvent("onmessage", function (e) {
            onMessageHandler(e);
        });
    }

	
    SphereUp.SphereUpWidget.startWidget({ platform:platform ,clientId: clientId, isIFrameMode: true, userWidgetId: userWidgetId, /* Language: 'heb',*/widgetVersion: widgetVersion, maxWidth: maxWidth });
//});