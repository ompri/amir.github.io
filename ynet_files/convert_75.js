var startTime = new Date();
if (typeof Linicom === 'undefined') {
    Linicom = {
	"_root" : 'http://linicom.co.il',
  "_adroot" : '//rot.linicom.co.il/audit',
	"_uid"  : 75,
	"_options" : {"gp":{"pictures":{"whitelist":[],"blacklist":[]},"words":{"whitelist":[],"blacklist":[]},"maxcount":1,"minfold":40,"blinks":"2-8","picminh":1,"picminw":1,"picmaxh":2,"picmaxw":3,"enabled":false},"gw":null,"gw_ch":{"bordersize":1,"bordercolor":"Orange"},"blacklist":["ynet","bigdeal","yedioth","doubleclick","sekindo","talkahead","pro.co.il","games.co.il","yit.co.il","realcommerce","akamai","acum","radware","totalmedia","google","infomed","photour.co.il","www.chuparim4u.co.il","relevanti","shichor","jdate","pranaessentials.net","zimerdeal.co.il","psakdin.co.il","vrit","cisco","yevulim","doctordrai","zimerdati","hoogel","outbrain","bvd.co.il","http://bit.ly/16HgKRY","http://belondonyesh.co.il/","ynethack","http://bit.ly/1aPqWJH","http://bit.ly/17137t5","daka90","travelist","runway.co.il","runy.co.il/","http://goo.gl/r9IVC7","belkin-ad","bit.ly/GJi","goo.gl/brz1N1","http://vegansontop.co.il/","http://bit.ly/16C8TpN","winemarket","goo.gl/7GrT1z","frogi.co.il","shufersal.co.il","apos/minisite2","proportzia","bit.ly/LolfIN","columbia","proportzia","goo.gl/aDszwB","http://goo.gl/W3317F","goo.gl/XIgpxy","goo.gl/N7Pcwp","allaboutjerusalem.com/he","Jumpstarter","jumpstarter","alljobs.co.il","yjobs.co.il","bit.ly/1kXnSy1","goo.gl/TfX1Nq","cookschool.co.il","poalimatarim.co.il","notnimtikva","http://campaign.proportzia.co.il/rh/f260/?ref=ynethair&np=1","goo.gl","goo.gl/A3GDJK","http://goo.gl/KFctAC","pninalove.co.il","xnet.co.il/family/articles/0,14566,L-3106084,00.html","oref.org.il/","centralpark","bryantpark","rockwer","readingfest","rockense","ultramusic","tomorrowland","ozorafest","sunfestival","boomfestival","mankind.co.uk","guilty.co.il","bela.co.il","adiharpaz.co.il/","pagim.net/","alphagifted.org.il/","familylinks","luxvision.co.il","vegansontop","kishrey-teufa.co.il","bit.ly/1GuhJVi","smartair.co.il","kishrey-teufa.co.il","bit.ly/1GuhJVi","bit.ly/1J5EFxM","bit.ly/1BpCHpe","bit.ly","bit.ly/1Cf1Aik","bit.ly/1Rc0Kdf","kishrey-teufa.co.il/guide/sicily_guide/packages/ ","929.org.il","sialive"],"print":false,"convert":"remote","skip":0,"links_hours_limit":0,"gw_hours_limit":0,"gp_hours_limit":0,"mhr_hours_limit":0,"mgp_hours_limit":0,"domain":null,"regex":null,"ir_hours_limit":1,"background":"#ffffff"},
	"_wasShown" : false,
	"_ready" : false,
	"_showDialog"  : function() {
		if(!('print' in Linicom._options) || Linicom._options.print==false)
			return;
		var url = Linicom._root + '/external/?u=' + Linicom._uid + '&a=' + encodeURIComponent('linicom://print')  + '&ref=' + encodeURIComponent(document.location.href) ;
		if(typeof(window.showModalDialog) !== 'undefined') {
			window.showModalDialog(url,0,'dialogHeight:550px;dialogWidth:400px; location:no');
		}
		else {
			window.open(url,null,'height=550,width=400,menubar=no,location=no');
		}

	},
	"_queryRegex" : (function(){
		var sub_delims="['!,;=\\$\\(\\)\\*\\+&]";
		var gen_delims="[\\:\\/\\?\\#\\[\\]\\@]";
		var reserverd="(" + gen_delims + "|" + sub_delims + ")";
		var unreserved="[a-zA-Z_0-9\\-\\.~]";
		var pct_encoded="%[0-9a-fA-F][0-9a-fA-F]";
		var pchar="(" + unreserved + "|" + pct_encoded + "|" + sub_delims + "|:|\\@)";
		var query="(" + pchar + "|/|\\?)*";
		var fragment="(" + pchar + "|/|\\?)*";
		var segment="(" + pchar + ")*";
		var segment_nz="(" + pchar + ")+";
		var segment_nz_nc="(" + unreserved + "|" + pct_encoded + "|" + sub_delims + "|" + "\\@)+";
		var path_rootless = "(" + segment_nz + "(/" + segment + ")*)";
		var path_noscheme = "(" + segment_nz_nc + "(/"+ segment +")*)";
		var path_absolute = "/("+ segment_nz + "(/"+ segment +")*)?";
		var path_abempty  = "(/" + segment+")*";
		var path="(" + path_abempty + "|" + path_absolute + "|" + path_noscheme + "|" + path_rootless +")?";
		var reg_name = "(" + unreserved + "|" + pct_encoded + "|" + sub_delims + ")*";
		var dec_octet = "([0-9]|[1-9][0-9]|1[0-9][0-9]|2[0-4][0-9]|25[0-5])";
		var ipv4addr = "(" + dec_octet + "\\." + dec_octet + "\\." + dec_octet + "\\." + dec_octet +")";
		var port = "([0-9]*)";
		var host = "(" + ipv4addr + "|" + reg_name + ")";
		var userinfo= "(" + unreserved + "|" + pct_encoded + "|" + sub_delims +"|\\:)*";
		var authority = "((" + userinfo +"\\@)?" + host + "(\\:"+port+")?)";
		var relative_part = "(//" + authority + path_abempty
						+"|"+path_absolute
						+"|"+path_noscheme
						+")?";
		var relative_ref = "(" + relative_part + "(\\?" + query + ")?(#" + fragment +")?)";


		var hier_part = "(//" + authority + path_abempty
						+"|"+path_absolute
						+"|"+path_rootless
						+")?";
		var uri = "^((f|ht)tps?:" +  hier_part + "(\\?" + query + ")?(#" + fragment +")?)$";
		return new RegExp(uri);
	})(),
	"_escape":function(part) {
		var l=part.length;
		var out='';
		var allowed=/^[a-zA-Z0-9_\-.~+]$/;
		var pct_allowed=/^%[0-9a-fA-F][0-9a-fA-F]$/;
		var c;
		for(var i=0;i<l;) {
			if(allowed.test(part.substr(i,1))) {
				out+=part.substr(i,1);
				i++;
			}
			else if(pct_allowed.test(part.substr(i,3))) {
				out+=part.substr(i,1);
				i+=3;
			}
			else if((c=part.charCodeAt(i))<128) {
				if(c < 16)
					out+='%0' + c.toString(16);
				else
					out+='%' + c.toString(16);
				i++;
			}
			else {
				return null;
			}
		}
		return out;
	},
	"_recoverURL":function(url) {
		var q,f,query,fixed='',result;
		q=url.indexOf('?');
		if(q==-1)
			return null;
		q+=1;
		f=url.indexOf('#',q);
		if(f==-1)
			f=url.length;
		queries=url.substr(q,f-q).split('&');
		for(var i=0;i<queries.length;i++) {
			var pair=queries[i],key,value;
			if(fixed!='')
				fixed+='&';
			var pos = pair.indexOf('=');
			if(pos==-1)
				return null;
			key=Linicom._escape(pair.substr(0,pos));
			value=Linicom._escape(pair.substr(pos+1));
			if(!key || !value)
				return null;
			fixed+=key+'='+value;
		}
		result=url.substr(0,q) + fixed + url.substr(f);
		if(!Linicom._queryRegex.test(result)) {
			return null;
		}
		return result;
	},
	"_onPrintEvent" : function()  {
		if(!Linicom._wasShown) {
			Linicom._showDialog();
		}
		Linicom._wasShown = false;
	},
	"_trueSetLink" : function(a,newlink)
	{
		if(navigator.appName == 'Microsoft Internet Explorer') {
			var old = a.innerHTML ;
			if(old.indexOf('<')==-1) {
				a.href=newlink;
				a.innerHTML = old;
				return
			}
		}
		a.href=newlink;
	},
	"_setLink" : function(a,newlink)
	{
		Linicom._trueSetLink(a,newlink);
		if(Linicom.ynethack) {
			a.onclick=function() {
				Linicom._trueSetLink(a,newlink);
				return true;
			};
		}
	},
  "_get": function (url) {
      var head = document.getElementsByTagName('head')[0];
      var n = document.createElement('script');
      n.src = url;
      n.onload = function () {
          head.removeChild(n);
      };
      head.appendChild(n);
  },
  "_addEvent": function (obj, e, callback) {
      if (typeof obj.addEventListener !== 'undefined') {
          obj.addEventListener(e, callback);
      } else if (typeof obj.attachEvent !== 'undefined') {
          e = 'on' + e;
          obj.attachEvent(e, callback);
      } else {
          obj['on' + e] = callback;
      }
  },
  "_windowHeight": function () {
    if ('outerHeight' in window) return window.outerHeight;
    return document.documentElement.offsetHeight;
  },
  "_elementInViewport": function(el) {
		var top = el.offsetTop;
		var left = el.offsetLeft;
		var width = el.offsetWidth;
		var height = el.offsetHeight;

		while (el.offsetParent) {
			el = el.offsetParent;
			top += el.offsetTop;
			left += el.offsetLeft;
		}

		return (
			((top < (window.pageYOffset + window.innerHeight) && top > window.pageYOffset ) ||
			((top + height) < (window.pageYOffset + window.innerHeight) &&(top + height) > window.pageYOffset)) &&
			((left < (window.pageXOffset + window.innerWidth) && left > window.pageXOffset) ||
			((left + width) < (window.pageXOffset + window.innerWidth) && (left + width) > window.pageXOffset))
		);
  },
  "_adClick": function (obj, url) {
      setTimeout(function() {
        obj.href = url;
    }, 100);
  },
  _supportedClient: function () {
      var res = -1;
      if (navigator.appName == 'Microsoft Internet Explorer') {
          var ua = navigator.userAgent;
          var re = new RegExp("MSIE ([0-9]{1,}[\.0-9]{0,})");
          if (re.exec(ua) !== null) {
              res = parseFloat(RegExp.$1);
              if (res <= 7.0)
                  return false;
          }
      }
      return true;
  },
	"_isMobile": function () {
		var check = false;
		(function(a){if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4)))check = true})(navigator.userAgent||navigator.vendor||window.opera);
		return check;
	},
	"_onLoad" : function() {
		if(Linicom._ready)
			return;
		Linicom._ready = true;
		if(Linicom._uid == -1)
			return;
		var convert = 'remote';
		var print = false;
		var regex = null;
		var blacklist = ['www.googleadservices.com','class:ob-rec-link-img','class:ob-text-content'];
		var skip = 0;
		var options = Linicom._options;
		var root = Linicom._root;
		var uid = Linicom._uid;

		//options.print=0;

		if('convert' in options)
			convert = options.convert;
		if('print' in options)
			print = options.print;
		if('regex' in options && options.regex != null && options.regex != "")
			regex = new RegExp(options.regex);
		if('blacklist' in options)
			blacklist = blacklist.concat(options.blacklist);
		if('skip' in options)
			skip = options.skip;
		Linicom.ynethack=false;
		for(var i=0;i<blacklist.length;i++) {
			if(blacklist[i]==='ynethack') {
				Linicom.ynethack = true;
				break;
			}
		}

		var date = new Date();
    
		if(print==1) {
			window.onbeforeprint = Linicom._onPrintEvent;
		}
		if(typeof Linicom.convertWords !== 'undefined') {
			//Checking if this unique have already seen GW ad
			var linicom_seen_gw = document.cookie.replace(/(?:(?:^|.*;\s*)linicom_seen_gw\s*\=\s*([^;]*).*$)|^.*$/, "$1");
			if(linicom_seen_gw === "" || linicom_seen_gw < date.getTime()/1000)
				Linicom.convertWords.handle();
		}
		if(typeof Linicom.goldenPicture !== 'undefined' && !Linicom._isMobile()) {
			//Checking if this unique have already seen GP ad
			var linicom_seen_gp = document.cookie.replace(/(?:(?:^|.*;\s*)linicom_seen_gp\s*\=\s*([^;]*).*$)|^.*$/, "$1");
			if(linicom_seen_gp === "" || linicom_seen_gp < date.getTime()/1000)
				Linicom.goldenPicture.handle();
		}
    	if(typeof Linicom.inRead !== 'undefined') {
			//Checking if this unique have already seen IR ad
			var linicom_seen_ir = document.cookie.replace(/(?:(?:^|.*;\s*)linicom_seen_ir\s*\=\s*([^;]*).*$)|^.*$/, "$1");
			if(linicom_seen_ir === "" || linicom_seen_ir < date.getTime()/1000)
				Linicom.inRead.handle();
		}
		if(typeof Linicom.escapeZone !== 'undefined' && !Linicom._isMobile()) {
			var linicom_seen_ez = document.cookie.replace(/(?:(?:^|.*;\s*)linicom_seen_ez\s*\=\s*([^;]*).*$)|^.*$/, "$1");
			if(linicom_seen_ez === "" || linicom_seen_ez < date.getTime()/1000)
				Linicom.escapeZone.handle();
		}
		if(typeof Linicom.jumpSpot !== 'undefined' && !Linicom._isMobile()) {
			var linicom_seen_js = document.cookie.replace(/(?:(?:^|.*;\s*)linicom_seen_js\s*\=\s*([^;]*).*$)|^.*$/, "$1");
			if(linicom_seen_js === "" || linicom_seen_js < date.getTime()/1000)
				Linicom.jumpSpot.handle();
		}
	},
	"_addReadyEventListener" : function(obj,event)
	{
		if(obj.addEventListener) {
			obj.addEventListener(event, function(){
				obj.removeEventListener(event,arguments.callee,false);
				Linicom._onLoad();
			},false);
		}
		else if(obj.attachEvent) {
			obj.attachEvent(event, function(){
				if(document.readyState != 'complete')
					return;
				obj.detachEvent(event,arguments.callee);
				Linicom._onLoad();
			});
		}
		else {
			var callback = function() {
				if(document.readyState != 'complete')  {
					setTimeout(callback,100);
					return;
				}
				Linicom._onLoad();
			};
			callback();
		}
	},
	"register" : function()
	{
		if(document.readyState === 'complete' || document.readyState === 'loaded') {
			Linicom._onLoad();
		}
		else if(document.addEventListener) {
			Linicom._addReadyEventListener(document,'DOMContentLoaded');
			Linicom._addReadyEventListener(window,'load');
		}
		else {
			Linicom._addReadyEventListener(document,'onreadystatechange');
			Linicom._addReadyEventListener(window,'load');
		}
	},
	"showPrintAdvertisement" : function() {
		Linicom._showDialog();
		Linicom._wasShown = true;
	},
	"setHoursLimitCookie" : function(hours, value) {
			var date = new Date();
			date.setTime(date.getTime() + (hours * 60 * 60 * 1000));
			var expires = "; expires=" + date.toGMTString();
			var exp_epoch = Math.round(date.getTime()/1000);
			var domain = "";
			var domain_option = Linicom._options.domain;
			if(domain_option !== undefined && domain_option!=null) {
				// accept only exact subdomain (i.e. .foo something)
				domain_option='.'+domain_option;
				var hostname = '.' + window.location.hostname;
				if(hostname.indexOf(domain_option, hostname.length - domain_option.length) != -1)
					domain = ";domain="+domain_option;
			}
			document.cookie = value+"=" + exp_epoch + expires + domain + "; path=/";
	}
    };

    Linicom.register();
}










