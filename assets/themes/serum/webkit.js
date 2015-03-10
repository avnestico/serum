/**
 * JavaScript workaround for sticky footers in Android 4.3- and iOS 6- browsers
 * This is necessary because these browsers only have partial support for display: -webkit-box;
 *
 * Sticky footers, illustrated:
 *
 * +---------+  +---------+  +---------+  +---------+
 * | Header  |  | Header  |  | Header  |  | Header  |
 * +---------+  +---------+  +---------+  +---------+
 * | Content |  | Content |  | Content |  | Content |
 * |         |  |         |  |         |  |         |
 * |         |  | Content |  | Content |  | Content |
 * |         |  |         |  |         |  |         |
 * +---------+  +---------+  | Content |  | Content |
 * | Footer  |  | Footer  |  +---------+  |         |
 * |         |  |         |  | Footer  |  | Content |
 * +---------+  +---------+  +---------+  +---------+
 *                                          Footer
 *
 * Expected behaviour:
 *   Case 1) When the sum of the heights of the page elements is smaller than or equal to the viewport height, footer is
 *     fixed at the bottom of the screen
 *   Case 2) When combined height is greater than the viewport height, footer is fluid below content
 *
 * Actual behaviour in legacy webkit browsers:
 *   Case 1) Works as advertised
 *   Case 2) Flex scaling is ignored; footer is still fixed at the bottom of the page, overlapping the content
 *
 * Workaround:
 *   Check page - if the sum of the vertical divs is greater than the viewport height, set display: block;
 *   This disables flexbox when it would cause problems; by falling back to display: block;, the header, content, and
 *     footer are displayed normally
 *   Run this check again whenever orientation changes
 *
 * Side-effects:
 *   Divs must be positioned in their correct order in html, as all order properties are ignored when display is not
 *     set to flex
 */

var ua = navigator.userAgent;
var activateFix = false;

// Check for user agent of old Androids not running Chrome or Firefox
var isAndroid = ua.match(/Android (\d+.\d+)/);
if (isAndroid) {
    var isChrome = ua.match(/Chrome/);
    var isFirefox = ua.match(/Firefox/);

    if (!isChrome && !isFirefox) {
        androidVer = parseFloat(isAndroid[1]);
        if (androidVer < 4.4) {
            activateFix = true;
        }
    }
}

// Check for user agent of old iPhones
var isIphone = ua.match(/iPhone OS (\d)/);
if (isIphone) {
    iphoneVer = parseFloat(isIphone[1]);
    if (iphoneVer < 7) {
        activateFix = true;
    }
}

if (activateFix) {
    // Immediately run the fix script, and have it run again whenever the screen resizes (ie on orientation change)
    // This is needed to cover the edge case of a page that needs the fix in landscape but does not in portrait
    addCssToHead("/assets/themes/serum/css/webkit.css");
    webkitFlexWorkaround();
}

function addCssToHead(filename) {
    var head = document.getElementsByTagName("head")[0];
    var link = document.createElement("link");
    link.setAttribute("rel", "stylesheet");
    link.setAttribute("type", "text/css");
    link.setAttribute("href", filename);
    head.appendChild(link);
}

function webkitFlexWorkaround() {
    var viewHeight = document.body.scrollHeight;

    // Find sum of heights of page elements
    var headerHeight = document.getElementsByClassName('sidebar-top')[0].scrollHeight;
    var contentHeight = document.getElementsByClassName('content')[0].scrollHeight;
    var footerHeight = document.getElementsByClassName('sidebar-bottom')[0].scrollHeight;
    var pageHeight = headerHeight + contentHeight + footerHeight;

    // If the elements are larger than the view height, the browser displays the buggy behaviour
    // The full if-else statement is needed to overwrite the id value when orientation changes
    if (pageHeight > viewHeight) {
        document.body.id = "webkit-fix-enabled";
    }
    else {
        document.body.id = "webkit-fix-disabled";
    }
}
