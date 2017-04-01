/*
  Ajax Page
  =========
  How works: 
  1) After GET
    a) Capture all image/submit buttons
    b) Do cache of all external scripts <script src="..">
    c) Do submit using FormData and XmlHttp

  2) Processing data return
    a) Remove <scripts> tags
    b) Update only BODY tag
    c) Build an array with all scripts that will be run
    d) Execute all scripts in script array.
    e) Some "inline" scripts will not be run (like ScriptManager)
  Rules to execute scripts:
    Inline: Always
    External: External > Only first time (cache-it)

=> TODO:
    - <link rel=stylesheet> works only when in master page (full GET)
    - How works with pageLoad/$(fn)/...

=> TARGET: page must works FINE without this lib. If, in future, I want remove, every needs works
    - This is not means that all apps works only adding this .js

=> Server changes:
    - Server must send response header "X-Ajax-Path" with responseURL !!

    private void Context_BeginRequest(object sender, EventArgs e)
    {
        context.Response.Headers["X-Ajax-Path"] = context.Request.Url.PathAndQuery;
    }
*/
//var _use = {
//    total: 0, viewstate: 0, form: 0, stats: function () {
//        console.log('ViewState: ' + Math.round((_use.viewstate / _use.total) * 100) + '% - ' +
//            'Overhead: ' + Math.round(((_use.total - _use.form) / _use.total) * 100) + '%');
//}};

(function (window, $) {

    var cache = {}; // cache scripts
    var headers = { 'X-Ajax-Request': '1' }; // header on request to identify AjaxPage GET/POST
    var xhr = null;
    var destroy = []; // array to destroy components when page leaving
    var pageState = circularCache(10);

    // start ajaxpage
    $(function () {

        // make some validations
        if ($('head').length == 0) { console.error('No <head> tag found: AjaxPage disabled'); return; }
        if ($('form').length != 1) { console.error('No <form> tag found or more than one: AjaxPage disabled'); return; }

        bindAddToPostBack();

        // at this point, all script already run, just to create cache of external scripts
        addScripts($('html').html());

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
                updatePage(data, 'POST', jqXHR.getResponseHeader('X-Ajax-Path'));
            },
            error: function(data, args, textStatus) {
                if (textStatus != 'abort') {
                    updateError(data.responseText);
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
    function updatePage(html, verb, url) {

        var defer = $.Deferred();
        var matchForm = html.match(/<form.*>[\s\S]*<\/form>/i);

        // setting title
        document.title = title(html) || document.title;

        // checks if url != location.href
        var uri = getUri(url.replace(/[&?]_=\d+/, ''));

        // if action is different from location, change location
        if (uri != location.href) {

            // store page state before leave
            savePageState();

            // change url
            history.pushState(null, null, uri);
            verb = 'GET';
        }

        // before update page, call dispose and clear array
        destroy.forEach(function (fn) {
            fn();
        });
        destroy = [];

        if (matchForm) {

            var form = matchForm[0];
            var focus = $(document.activeElement).attr('id');

            // getting keypress attribute in form (for WebForm_FireDefaultButton)
            var keypress = form.match(/^<form.*?>/i)[0]
                .match(/keypress="(.*?)"/i);

            // removing <form> tag, styles and scripts
            form = form.replace(/^<form.*?>/i, '').replace(/<\/form>$/i, '');
            form = form.replace(/<script.*?>[\s\S]*?<\/.*?script>/gi, '');

            // update form action and content (only if has form content)
            var frm = $('form').attr('action', url).html(form);

            if (keypress) {
                frm.attr('keypress', keypress[0]);
            }

            // total size usage
            // _use.total += html.length;
            // _use.form += matchForm[0].length;
            // _use.viewstate += $('#__VIEWSTATE').val().length;

            // set focus
            setTimeout(function () {
                if (verb == 'GET') {
                    $('[autofocus]').focus();
                }
                else if (verb == 'POST' && focus) {
                    $('#' + focus).focus();
                }
            }, 0);

            // clear all variables from WebResources.axd
            clearVars();
        }

        // update base href
        var base = $('base');
        if (base.length == 0) base = $('<base>').appendTo($('head'));
        base.attr('href', location.href);

        // get all inline scripts + not cached external scripts
        var scripts = addScripts(html);

        // execute all scripts on array in a another thread
        setTimeout(function () {

            $.each(scripts, function (index, script) {
                $('head').append(script);
            });

            // trigger pageLoad event (do not call if is only redirect)
            $(window).trigger('load');

            defer.resolve();
        });

        return defer.promise();
    }

    // update page with server error message
    function updateError(html) {
        var matchBody = html.match(/<body.*>[\s\S]*<\/body>/i);

        if (matchBody) {
            var err = matchBody[0].replace(/^<body.*?>/i, '').replace(/<\/body>$/i, '');
            err = err.replace(/<style.*>[\s\S]*<\/style>/gi, '');
            err = err.replace(/<script.*?>[\s\S]*?<\/.*?script>/gi, '');
            err = err.replace(/width=100%/ig, ''); // why not?
            $('form').html('<div class="error">' + err + '</div>');
        }
        document.title = title(html) || 'PageError';
        console.error(document.title);
    }

    // get all scripts that are not in cache
    function addScripts(html) {

        var scripts = [];
        var matchScripts = html.match(/<script.*?>[\s\S]*?<\/.*?script>/gi);

        // No javascripts
        if (!matchScripts) return [];

        for (var i = 0; i < matchScripts.length; i++) {

            var script = matchScripts[i]; // script tag, including <script> .. </script>

            // test if is a external file
            if (script.match(/<script.*src=["'].*?["']>/i) != null) {

                // get just src="..."
                var src = clearHtml(script.match(/src=["'].*?["']/i)[0]); // clear html codes &amp; => &

                // remove "no-cache" urls
                src = src.replace(/[\?&][t_]=[0-9\.]*/, ''); // removing &t=<time>

                // test if is in cache, if not, add to cache and list to run
                if (!cache[src]) {
                    cache[src] = true;
                    scripts.push(script);
                }
            }
            // inline scripts
            else {

                // ignore if script it's only __doPostBack definition
                if (script.match(/function __doPostBack\(eventTarget, eventArgument\)/) == null) {
                    scripts.push(script);
                }
            }
        }

        return scripts;
    }

    // capture all links to use history.pushState
    $(document).on('click', 'a:not([target])', function (e) {

        var link = $(this);
        var href = link.attr('href');

        // no ajax
        if (!href || 
            href.indexOf('#') == 0 || 
            href.indexOf('javascript:') == 0) return;

        // prevent default link redirect
        e.preventDefault(); e.stopPropagation();

        // avoid request ajax queue
        if (xhr != null) return false;

        // change location without refresh and call by ajax
        redirect(href);

        return false;
    });

    // register history changes (backward/fordward browser buttons)
    window.addEventListener('popstate', function (e) {
        redirect(location.href + '#restore');
    });

    // redirect a page using ajax "history"
    function redirect(url) {

        var uri = getUri(url);
        var hash = /#.*$/.test(uri) ? uri.match(/#.*$/)[0] : '';
        uri = uri.replace(/#.*$/, '');

        // no ajax - redirect from browser
        if (/^#noajax/i.test(hash)) {
            location.href = uri;
            return;
        }

        // store page-state before leave (if page are leaving)
        if (location.href != uri) {
            savePageState();
        }

        // test if redirect page is from 

        if (/^#restore$/i.test(hash)) {
            var state = pageState.get(uri);
            if (state) {
                return pageRestore(uri, state);
            }
        }

        if (uri != location.href) history.pushState(null, null, uri);

        // prepare options for GET ajax request
        var opts = {
            type: 'GET',
            url: url,
            dataType: 'html',
            headers: headers,
            processData: false,
            contentType: false,
            cache: false,
            success: function (data, textStatus, jqXHR) {
                updatePage(data, 'GET', jqXHR.getResponseHeader('X-Ajax-Path'));
                window.scrollTo(0, 0);
            },
            error: function (data, args, textStatus) {
                if (textStatus != 'abort') {
                    updateError(data.responseText);
                }
            }
        };

        // run ajax request
        request(opts);
    }

    // Save page state in cache
    function savePageState() {

        var form = $('form');

        // remove event target/argument
        form.find('#__EVENTTARGET').remove();
        form.find('#__EVENTARGUMENT').remove();

        var data = new FormData(form.get(0));
        data.append('__EVENTTARGET', '__RESTORE_PAGE_STATE');

        pageState.push(location.href, { form: data, scroll: window.scrollY });

    }

    // Restore a pageState and call server to rebuild
    function pageRestore(uri, state) {

        // prepare to call post request
        var opts = {
            type: 'POST',
            url: uri,
            dataType: 'html',
            headers: headers,
            data: state.form,
            processData: false,
            contentType: false,
            success: function (data, textStatus, jqXHR) {
                updatePage(data, 'POST', jqXHR.getResponseHeader('X-Ajax-Path')).then(function() {
                    window.scrollTo(0, state.scroll);
                });
            },
            error: function (data, args, textStatus) {
                if (textStatus != 'abort') {
                    updateError(data.responseText);
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
                    $('.busybox', window.top.document.body).show();
                }
            }, busybox.delay);
        },
        end: function () {
            $('.busybox', window.top.document.body).hide();
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

    // convert an url in full uri using a link element
    function getUri(url) {
        var a = document.createElement('a');
        a.href = url;
        return a.href;
    }

    // very simple circular cache class (avoid too many pageStates in memory)
    function circularCache(length) {
        var pointer = 0;
        var buffer = new Array(length);
        return {
            get: function (key) {
                for (var i = 0; i < length; i++) {
                    var item = buffer[i];
                    if (item && item.key == key) return item.value;
                }
                return null;
            },
            push: function (key, value) {
                for (var i = 0; i < length; i++) {
                    var item = buffer[i];
                    if (item && item.key == key) {
                        item.value = value;
                        return;
                    }
                }
                buffer[pointer] = { key: key, value: value };
                pointer = (pointer + 1) % length;
            }
        };
    };

    // small plugin to run Page WebService from javascript
    $.ws = function (serviceName, params, success, error) {
        return $.ajax({
            type: "POST",
            url: window.location.pathname.split("/").pop() + "/" + serviceName,
            data: JSON.stringify(params),
            contentType: "application/json; charset=utf-8",
            dataType: "json",
            success: function (response) {
                if (response.d) {
                    success(response.d);
                }
                else {
                    console.log("WS SUCCESS", response);
                }
            },
            error: function (xhr) {
                try {
                    var err = eval("(" + xhr.responseText + ")");
                    error(err.Message);
                }
                catch (e) {
                    console.error("WS ERROR: ", err);
                }
            }
        });
    };

    // exposes "redirect" / "dispose"
    window.redirect = redirect;

    window.destroy = function (fn) { destroy.push(fn); };

})(this, jQuery);
