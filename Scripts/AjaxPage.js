/*
  Ajax Library
  ============
  How works: 
  1) After GET
    a) Capture all image/submit buttons
    b) Do cache of all external scripts <script src="..">
    c) Do submit using FormData and XmlHttp

  2) Processing data return
    a) Remove <style> and <scripts> tags
    b) Update only BODY tag
    c) Build an array with all scripts that will be run
    d) Execute all scripts in script array.
    e) Some "inline" scripts will not be run (like ScriptManager)
  Rules to execute scripts:
    Inline: body > Always - head > Only GET
    External: body || head > Only first time - cache-it.

//TODO:
    - <link rel=stylesheet> works only when in master page (full GET)
    - How works with pageLoad/$(fn)/...

=> TARGET: page must works FINE without this lib. If, in future, I want remove, every needs works
    - This is not means that all apps works only adding this .js

*/

(function (window, $) {

    var cache = {}; // cache scripts
    var headers = { 'X-Ajax-Page': '1' }; // header on request to identify AjaxPage GET/POST
    var xhr = null;

    // start ajaxpage
    $(function () {

        // make some validations
        if ($('head').length == 0) { console.error('No <head> tag found: AjaxPage disabled'); return; }
        if ($('form').length != 1) { console.error('No <form> tag found or more than one: AjaxPage disabled'); return; }

        bindAddToPostBack();

        // at this point, all script already run, just to create cache items
        addScripts($('head').html(), [], false);
        addScripts($('body').html(), [], false);

        // capturing possible submit buttons
        $(document).on('click', 'input[type=submit],input[type=button],button', function (e) {
            var input = $(this);
            $('form').data('sender', input.attr('name') + '=' + input.val());
        });

        // capture input[type=image] click 
        $(document).on('click', 'input[type=image]', function (e) {
            var input = $(this);
            $('form').data('sender', input.attr('name') + '.x=' + e.offsetX + '&' + input.attr('name') + '.y=' + e.offsetY);
        });

        // capture submit event from submit buttons
        $(document).on('submit', 'form', function (e) {
            e.preventDefault();
            var form = $(this);
            var sender = form.data('sender');
            form.removeData('sender');
            submitForm(null, null, sender);
            return false;
        });

    });

    function bindAddToPostBack() {
        addToPostBack(function (t, a) {
            submitForm(t, a, null);
            return false;
        });
    }

    // capture __doPostBack function
    addToPostBack = function (func) {

        if (typeof (__doPostBack) != 'function') {
            __doPostBack = func;
        }
        else {
            var old__doPostBack = __doPostBack;
            __doPostBack = function (t, a) {
                if (func(t, a)) old__doPostBack(t, a);
            }
        }
    };

    // submiting a form
    function submitForm(eventTarget, eventArgument, sender) {

        var form = $('form');

        // set target/argument event hidden values
        hiddenField(form, '__EVENTTARGET', eventTarget);
        hiddenField(form, '__EVENTARGUMENT', eventArgument);

        // get FormData from form
        var data = new FormData(form.get(0));

        // add sender values (when button clicked)
        if (typeof (sender) == 'string') {
            var items = sender.split('&');
            $.each(items, function (i, v) {
                var kv = v.split('=');
                data.append(kv[0], kv[1]);
            });
        }

        // prepare options for ajax request
        var opts = {
            type: 'POST',
            url: form.attr('action'),
            dataType: 'html',
            headers: headers,
            data: data,
            processData: false,
            contentType: false,
            success: function (data, textStatus, jqXHR) {
                updatePage(data);
                $(window).trigger('load');
            },
            error: function(data, args, textStatus) {
                if (textStatus != 'abort') {
                    updatePage(data.responseText);
                }
            }
        };

        // run ajax request
        request(opts);
    }

    // set (add out update) an input hidden value in a form
    function hiddenField(form, id, value) {

        var input = $('#' + id, form);

        if (input.length == 0 && value != null) {
            input = $('<input />')
                .attr({ 'name': id, 'id': id, 'type': 'hidden' })
                .appendTo(form);
        }

        input.val(value);
    }

    // update body page
    function updatePage(html, verb) {

        var matchHead = html.match(/<head.*>[\s\S]*<\/head>/i);
        var matchBody = html.match(/<body.*>[\s\S]*<\/body>/i);
        var matchForm = html.match(/<form.*>[\s\S]*<\/form>/i);
        var matchStyle = html.match(/<style.*>[\s\S]*<\/style>/gi);
        var scripts = [];

        // setting title
        document.title = title(html) || document.title;

        // append all styles in header
        if (matchStyle) {
            for (var i = 0; i < matchStyle.length; i++) {
                $('head').append(matchStyle[i]);
            }
        }

        if (matchForm) {

            var form = matchForm[0];
            var focus = $(document.activeElement).attr('id');

            // get form action and update in current form
            var action = clearHtml(form.match(/action=["'](.*?)["']/i)[1]);

            // removing <form> tag, styles and scripts
            form = form.replace(/^<form.*?>/i, '').replace(/<\/form>$/i, '');
            form = form.replace(/<style.*>[\s\S]*<\/style>/gi, '');
            form = form.replace(/<script.*?>[\s\S]*?<\/.*?script>/gi, '');

            // create a link A to resolve relative URL from action form
            var a = document.createElement('a');
            a.href = action;

            // if action is different from location, change location
            if (a.href != location.href) {
                verb = 'GET';
                history.pushState(null, null, a.href);
            }

            // update form action and content
            $('form').attr('action', action).html(form);

            // set focus
            if (focus) {
                $('#' + focus).focus();
            }
        }

        // clear all variables from WebResources.axd
        clearVars();

        // update base href
        var base = $('base');
        if (base.length == 0) base = $('<base>').appendTo($('head'));
        base.attr('href', location.href);

        // if has scripts in head tag, add to cache and list too
        // if is a GET, execute inline scripts
        if (matchHead) {
            addScripts(matchHead[0], scripts, verb == 'GET');
        }

        // getting all scripts in body that will be run later
        if (matchBody) {
            addScripts(matchBody[0], scripts, true);
        }

        // execute all scripts on array
        $.each(scripts, function (index, script) {
            $('head').append(script);
        });
    }

    // get all scripts that are not in cache
    function addScripts(html, scripts, includeInline) {

        var matchScripts = html.match(/<script.*?>[\s\S]*?<\/.*?script>/gi);

        // No javascript, just return html
        if (!matchScripts) return;

        for (var i = 0; i < matchScripts.length; i++) {

            var script = matchScripts[i]; // script tag, including <script> .. </script>

            // test if is a external JS
            if (script.match(/<script.*src=["'].*?["']>/i) != null) {

                // get just src="..."
                var src = clearHtml(script.match(/src=["'].*?["']/i)[0]); // clear html codes &amp; => &

                // remove "no-cache" urls
                src = src.replace(/[\?&][t_]=[0-9\.]*/, ''); // removing &t=<time>

                if (!cache[src]) { // test if is in cache, if not, add to cache and list to run
                    cache[src] = true;
                    scripts.push(script);
                }
            }
            // inline scripts
            else if (includeInline) {

                // ignore if script it's only __doPostBack definition
                if (script.match(/function __doPostBack\(eventTarget, eventArgument\)/) != null) {
                }
                else {
                    scripts.push(script);
                }
            }
        }
    }

    // capture all links to use history.pushState
    $(document).on('click', 'a', function (e) {

        var href = $(this).attr('href');

        if (href.indexOf('#') == 0 || href.indexOf('javascript:') == 0) return;

        // prevent default link redirect
        e.preventDefault();

        // avoid request ajax queue
        if (xhr != null) return false;

        // change location without refresh and call by ajax
        history.pushState(null, null, href);
        redirect(href);

        return false;
    });

    // register history changes (backward/fordward browser buttons)
    window.addEventListener('popstate', function (e) {
        redirect(location.href);
    });

    // redirect a page using ajax "history"
    function redirect(url) {

        // prepare options for GET ajax request
        var opts = {
            type: 'GET',
            url: url,
            dataType: 'html',
            headers: headers,
            processData: false,
            contentType: false,
            success: function (data, textStatus, jqXHR) {
                updatePage(data, 'GET');
                $(window).trigger('load');
            },
            error: function (data, args, textStatus) {
                if (textStatus != 'abort') {
                    updatePage(data.responseText);
                }
            }
        };

        // run ajax request
        request(opts);
    }

    // busybox control (use .busybox css class)
    var busybox = {
        delay: 500,
        running: false,
        start: function () {
            busybox.running = true;
            setTimeout(function () {
                if (busybox.running) {
                    $('.busybox').show();
                }
            }, busybox.delay);
        },
        end: function () {
            $('.busybox').hide();
            busybox.running = false;
        }
    }

    // execute ajax request + busybox
    function request(options) {

        // avoid request ajax queue
        if (xhr != null) return;

        xhr = $.ajax(options);

        busybox.start();

        xhr.always(function () {
            busybox.end();
            xhr = null; // clear xhr when finish
        }); 
    }

    // clear html codes (like &amp; => &)
    function clearHtml(text) {
        return $('<div />').html(text).text();
    }

    // clear variables from WebForms scripts WebResources.axd
    function clearVars() {

        window.theForm = document.forms[0];

        if (typeof (window.WebForm_PostBackOptions) == 'function') {
            window.__pendingCallbacks = new Array();
            window.__synchronousCallBackIndex = -1;
            window.__theFormPostData = "";
            window.__theFormPostCollection = new Array();
            window.__disabledControlArray = new Array();
        }

        if (typeof (window.ValidatorUpdateDisplay) == 'function') {
            window.Page_IsValid = true;
            window.Page_BlockSubmit = false;
            window.Page_InvalidControlToBeFocused = null;
            window.__theFormPostCollection = new Array();
            window.__disabledControlArray = new Array();
        }

        if (typeof (window.WebForm_OnSubmit) == 'function') {
            window.WebForm_OnSubmit = function () { return true; }
        }

    }

    // get <title> content
    function title(html) {

        var matchTitle = html.match(/<title>[\s\S]*<\/title>/i);

        if (matchTitle != null) {
            var title = matchTitle[0].replace(/^<title.*?>/i, '').replace(/<\/title>$/i, '');
            return clearHtml(title);
        }

        return null;
    }


})(this, jQuery);