zdLogger = function ($, options) {
    var self = this;
    this.clientId = options.clientId;
    this.currSocket = null;
    this.logsToSend = [];
    this.addIframeCont = function(clientId, callback) {
        var SU_BaseUrlServiceHttp = '';
        if (SphereUp && SphereUp.SphereUpWidget && SphereUp.SphereUpWidget.SU_BaseUrlServiceHttp) {
            SU_BaseUrlServiceHttp = SphereUp.SphereUpWidget.SU_BaseUrlServiceHttp;
        }
        var SU_BaseUrlContentHttp = '';
        if (SphereUp && SphereUp.SphereUpWidget && SphereUp.SphereUpWidget.SU_BaseUrlContentHttp) {
            SU_BaseUrlContentHttp = SphereUp.SphereUpWidget.SU_BaseUrlContentHttp;
        }
        var frameUrl = SU_BaseUrlServiceHttp + 'mvc/Widget/ZdLogger?clientId=' + encodeURIComponent(clientId) + '&contentSource=' + encodeURIComponent(SU_BaseUrlContentHttp);
        loadLoggerFrame(clientId, frameUrl);
        if (callback) callback();
    };
    function loadLoggerFrame(clientId, frameUrl) {
        if ($('body').length > 0) {
            $('<iframe id="zd_log" data-zd_clid="' + clientId + '" src="' + frameUrl + '" frameborder="0" width="1px" height="1px" style="visibility:none;position:absolute;"></iframe>').appendTo($('body')).load(function() {
                self.currSocket = this.contentWindow;
                $.each(self.logsToSend, function(index, msg) {
                    postLog(msg);
                });
            });
        } else {
            setTimeout(loadLoggerFrame, 100, clientId, frameUrl);
        }
    }
    this.logEvent = function (action, eventData) {
        if(typeof(eventData) != "string"){
            try {
                eventData.startTime = new Date().toISOString();
                eventData = JSON.stringify(eventData);
            } catch (e) {}
        }
        var message = action + '<<action/data>>' + eventData;
        if (self.currSocket) {
            postLog(message);
            return true;
        } else {
            self.logsToSend.push(message);
            return true;
        }
    }
    this.checkCompatabilityFunctions = function () {
        if (!Date.prototype.toISOString) {
            (function () {
                function pad(number) {
                    var r = String(number);
                    if (r.length === 1) {
                        r = '0' + r;
                    }
                    return r;
                }
                Date.prototype.toISOString = function () {
                    return this.getUTCFullYear()
                        + '-' + pad(this.getUTCMonth() + 1)
                        + '-' + pad(this.getUTCDate())
                        + 'T' + pad(this.getUTCHours())
                        + ':' + pad(this.getUTCMinutes())
                        + ':' + pad(this.getUTCSeconds())
                        + '.' + String((this.getUTCMilliseconds() / 1000).toFixed(3)).slice(2, 5)
                        + 'Z';
                };
            }());
        }
    };
    this.init = function (callback) {
        self.checkCompatabilityFunctions();
        self.addIframeCont(self.clientId, function () {
            if (callback) callback();
        });
        return self;
    };
    function postLog(message) {
        self.currSocket.postMessage(message, SphereUp.SphereUpWidget.SU_BaseUrlServiceHttp);
    }
};
