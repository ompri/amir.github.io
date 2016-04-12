/*!
 * jQuery.tabbable 1.0 - Simple utility for selecting the next / previous ':tabbable' element.
 * https://github.com/marklagendijk/jQuery.tabbable
 *
 * Includes ':tabbable' and ':focusable' selectors from jQuery UI Core
 *
 * Copyright 2013, Mark Lagendijk
 * Released under the MIT license
 *
 */
function initTabPlugin(n){"use strict";function t(t){var i=n(t),f=n(":focus"),r,u;r=0;f.length===1&&(u=i.index(f),u+1<i.length&&(r=u+1));i.eq(r).focus()}function i(t){var i=n(t),u=n(":focus"),f=i.length-1,r;u.length===1&&(r=i.index(u),r>0&&(f=r-1));i.eq(f).focus()}function r(t){function o(t){return n.expr.filters.visible(n(t))&&!n(t).parents().addBack().filter(function(){return n.css(this,"visibility")==="hidden"}).length}var i,r,u,f=t.nodeName.toLowerCase(),e=!isNaN(n.attr(t,"tabindex"));return"area"===f?(i=t.parentNode,r=i.name,!t.href||!r||i.nodeName.toLowerCase()!=="map")?!1:(u=n("img[usemap=#"+r+"]")[0],!!u&&o(u)):(/input|select|textarea|button|object/.test(f)?!t.disabled:"a"===f?t.href||e:e)&&o(t)}n.focusNext=function(){t(":focusable")};n.focusPrev=function(){i(":focusable")};n.tabNext=function(){t(":tabbable")};n.tabPrev=function(){i(":tabbable")};n.extend(n.expr[":"],{data:n.expr.createPseudo?n.expr.createPseudo(function(t){return function(i){return!!n.data(i,t)}}):function(t,i,r){return!!n.data(t,r[3])},focusable:function(t){return r(t,!isNaN(n.attr(t,"tabindex")))},tabbable:function(t){var i=n.attr(t,"tabindex"),u=isNaN(i);return(u||i>=0)&&r(t,!u)}})}