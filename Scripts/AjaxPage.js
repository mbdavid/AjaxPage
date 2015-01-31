/*
  AjaxPage
  ========
  Como funciona: 
  1) Apos a carga do GET
    a) Captura os botões de image/submit
    b) Faz cache dos <script src=".."> que foram carregados
    c) Faz o submit via ajax, processa o retorno

  2) Processar o retorno
    a) Remove <style> e <scripts>
    b) Atualiza somente o HTML
    c) Monta um array com todos os scripts: Os externos que já estao na cache, nao são adicionados no array
    d) Executa todos os scripts externos, depois os inlines.
    e) Alguns scripts "inline" não executa (provavelmente do ScriptManager)
  Regra de execução de scripts:
    Inline: body > Sempre (em todos requests) - head > Somente GET
    Externo: body || head > Apenas 1 vez, apos isso é feito cache e nao executa mais.
*/

// TODO: não permitir reenvio enquanto nao tiver o processamento OK


(function (window, $) {

    var _cache = {}; // Cache scripts
    var _headers = { 'X-Ajax-Page': '1' }; // Header on request to identify AjaxPage GET/POST
    var _xhr = null;
    var _ajaxPage = {};

    _ajaxPage.abort = _abort;
    _ajaxPage.method = _method;
    _ajaxPage.onreject = function () { };
    _ajaxPage.onstart = function () { };
    _ajaxPage.onend = function () { };
    _ajaxPage.onerror = null;

    // Publish AjaxPage object
    window.AjaxPage = _ajaxPage;

    // Log capture
    var log = function () {
        if (console && console.log) {
            console.log(arguments);
        }
    }

    // Start AjaxPage
    $(function () {

        // Disabling AjaxPage
        if (window.EnableAjaxPage === false) {
            log('EnableAjaxPage = false');
            return;
        }

        // Make some validations
        if ($('head').length == 0) { log('No <head> tag found: AjaxPage disabled'); return; }
        if ($('form').length != 1) { log('No <form> tag found or more than one: AjaxPage disabled'); return; }

        _bindAddToPostBack();

        // At this point, all script already run. Just to create cache items
        _addScripts($('head').html(), [], false);
        _addScripts($('body').html(), [], false);

        // capturing possible submit buttons
        $(document).on('click', 'input[type=submit],input[type=button],button', function (e) {
            var input = $(this);
            $('form').data('sender', input.attr('name') + '=' + input.val());
        });
        // Capture input[type=image] click 
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
            _submitForm(null, null, sender);
            return false;

        });

    });

    function _bindAddToPostBack() {
        _addToPostBack(function (t, a) {
            _submitForm(t, a, null);
            return false;
        });
    }

    // capture __doPostBack function
    _addToPostBack = function (func) {

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

    // Submiting a form
    function _submitForm(eventTarget, eventArgument, sender) {

        var form = $('form');

        _hiddenField('__EVENTTARGET', eventTarget);
        _hiddenField('__EVENTARGUMENT', eventArgument);

        var data = new FormData(form.get(0));

        if (typeof (sender) == 'string') {
            var items = sender.split('&');
            $.each(items, function (i, v) {
                var kv = v.split('=');
                data.append(kv[0], kv[1]);
            });
        }

        var opts = {
            type: 'POST',
            url: form.attr('action'),
            dataType: 'html',
            headers: _headers,
            data: data,
            processData: false,
            contentType: false,
            success: function (data, textStatus, jqXHR) {

                // Update page
                _updatePage(data, textStatus, jqXHR);

                // Trigger page load event
                $(window).triggerHandler('load');

            },
            error: _errorPage
        };

        _request(opts);
    }

    function _abort() {

        if (_xhr && _xhr.readyState != 4) {
            _xhr.abort();
        }
    }

    function _hiddenField(id, value) {

        var input = $('#' + id);

        if (input.length == 0 && value != null)
            input = $('<input />').attr({ 'name': id, 'id': id, 'type': 'hidden' }).appendTo($('form'));

        input.val(value);
    }

    // Update body page
    function _updatePage(data, textStatus, jqXHR) {

        var matchHead = data.match(/<head.*>[\s\S]*<\/head>/i);
        var matchBody = data.match(/<body.*>[\s\S]*<\/body>/i);
        var matchStyle = data.match(/<style.*>[\s\S]*<\/style>/gi);
        var scripts = [];

        // Setting title
        document.title = _title(data) || document.title;

        if (matchStyle) {
            for (var i = 0; i < matchStyle.length; i++) {
                $('head').append(matchStyle[i]);
            }
        }

        if (matchBody) {

            var html = matchBody[0];
            var lastfocus = $(document.activeElement).attr('id');

            // removing <body> tags
            html = html.replace(/^<body.*?>/i, '').replace(/<\/body>$/i, '');

            // removing styles inside body
            html = html.replace(/<style.*>[\s\S]*<\/style>/gi, '');

            // addScripts to cache and get all script must be run after update body
            html = _addScripts(html, scripts, true);

            // Replace body
            $('body').html(html);

            // Set focus
            if (lastfocus) {
                var l = document.getElementById(lastfocus);
                if (l) { try { l.focus(); } catch (e) { } }
            }
        }

        // If has scripts in head tag, add to cache and list too
        if (matchHead) {
            _addScripts(matchHead[0], scripts, false);
        }

        // Clear all variables from WebResources.axd
        _clearVars();

        // Execute all scripts on array
        $.each(scripts, function (index, script) {
            $('head').append(script);
        });
    }

    function _errorPage(data, args, textStatus) {

        if (textStatus != 'abort') {
            // if has a onerror capture, do not show on screen. 
            if (_ajaxPage.onerror == null) {
                _updatePage(data.responseText);
            }
            else {
                // Get <title> error message
                _ajaxPage.onerror(_title(data.responseText));
            }
        }
    }

    // Create a cache scripts. 
    // If includeScriptBlock == false, ignore inlineScript
    function _addScripts(html, scripts, includeInlineScript) {

        var matchScripts = html.match(/<script.*?>[\s\S]*?<\/.*?script>/gi);

        // No javascript, just return html
        if (!matchScripts) return html;

        for (var i = 0; i < matchScripts.length; i++) {

            var script = matchScripts[i]; // Script tag, including <script> .. </script>

            // Test if is a external JS
            if (script.match(/<script.*src=["'].*?["']>/i) != null) {

                // get just src="..."
                var src = _clear(script.match(/src=["'].*?["']/i)[0]); //Clear html codes &amp; => &

                // remove "no-cache" urls
                src = src.replace(/[\?&][t_]=[0-9\.]*/, ''); // removing &t=<time>

                if (!_cache[src]) { // Test if is in cache. If not, add to cache and list to run
                    _cache[src] = true;
                    scripts.push(script);
                }
            }
                // Inline scripts
            else if (includeInlineScript) {

                if (script.match(/function __doPostBack\(eventTarget, eventArgument\)/) != null) {
                    // Ignore if script it's only __doPostBack definition
                }
                else {
                    scripts.push(script);
                }
            }

            // Removing script from HTML
            html = html.replace(script, '');
        }

        return html;
    }

    // Manage ajax requests
    function _request(opts) {

        if (_xhr != null) {
            _ajaxPage.onreject();
        }
        else {
            _xhr = $.ajax(opts);
            _ajaxPage.onstart();
            _xhr.always(function () {
                _ajaxPage.onend();
                _xhr = null;
            });
        }
    }

    // Clear html codes (like &amp; => &)
    function _clear(text) {
        return $('<div />').html(text).text();
    }

    // Clear variables from WebForms scripts WebResources.axd
    function _clearVars() {

        window.theForm = document.forms[0];

        if (typeof (WebForm_PostBackOptions) == 'function') {
            window.__pendingCallbacks = new Array();
            window.__synchronousCallBackIndex = -1;
            window.__theFormPostData = "";
            window.__theFormPostCollection = new Array();
            window.__disabledControlArray = new Array();
        }

        if (typeof (ValidatorUpdateDisplay) == 'function') {
            window.Page_IsValid = true;
            window.Page_BlockSubmit = false;
            window.Page_InvalidControlToBeFocused = null;
            window.__theFormPostCollection = new Array();
            window.__disabledControlArray = new Array();
        }
    }

    // Get <title>
    function _title(html) {

        var matchTitle = html.match(/<title>[\s\S]*<\/title>/i);

        if (matchTitle != null) {
            var title = matchTitle[0].replace(/^<title.*?>/i, '').replace(/<\/title>$/i, '');
            return _clear(title);
        }

        return null;
    }

    // Used for call Page Method
    function _method(name, args, onsuccess, onerror) {

        var url = location.href.replace(/\?.*$/, '') + '/' + name;

        return $.ajax({
            type: 'POST',
            url: url,
            data: args == null ? null : JSON.stringify(args),
            contentType: 'application/json; charset=utf-8',
            dataType: 'json',
            cache: false,
            success: function (r) {
                if (onsuccess) onsuccess(r.d);
            },
            error: function (r) {

                var err = '';

                try {
                    err = JSON.parse(r.responseText).Message;
                }
                catch (e) {
                    err = _title(r.responseText);
                }

                if (onerror) onerror(err);
                else if (AjaxPage.onerror) AjaxPage.onerror(err);
            }
        });
    }

})(this, jQuery);