/**
 * PriceList view page scripts
 */
define([
    'jquery',
    'number',
    'datepicker',
    'handlebars',
    'bootstrap',

    'text!templates/master.layout.html',
    // 'text!templates/datepicker.html', datepicker_layout
    'text!templates/cart.html',
    'text!templates/cart_items.html',
    'text!templates/modal.html',
    'text!templates/modal_items.html',

    'text!templates/I18n.json'
], function ($, number, datepicker, handlebars, bootstrap, master_layout, cart_layout, cart_items_layout, modal_layout, modal_items_layout, I18n_json) {
    var withPricelist = function (pricelist) {
        // set pricelist element
        this.pricelist = pricelist;

        // reset data
        this.withData = {};
        this.withAllData = withPricelist.prototype.withAllData;
        this.cartData = {};
        this.cartItems = {};
    };

    // current pricelist item
    withPricelist.prototype.pricelist = {};
    // debug for show log message
    withPricelist.prototype.debug = false;
    // default language 'auto' (if it not set in html attr, or not found in browser = 'it')
    withPricelist.prototype.lang = 'auto';
    // data for perform request FORM data, and need to be shorter as possible
    withPricelist.prototype.withData = {};
    // all data that application collect from first to last request
    withPricelist.prototype.withAllData = {
        urls: {
            privacy: '/privacy-policy'
        }
    };
    // cartData, with grand_total etc.
    withPricelist.prototype.cartData = {};
    // cartItems, all selected services
    withPricelist.prototype.cartItems = {};

    withPricelist.prototype.clog = function (text) {
        if (this.debug) {
            console.info(text);
        }
    };

    // getPricelist: function (withData) {}, maybe with callback method showPricelist() ... but for the moment need ajax callback, success

    withPricelist.prototype.setPageData = function () {
        var pricelist_id,
            with_slug = this.pricelist.attr('data-with-slug'),
            with_id = this.pricelist.attr('data-with-id'),
            with_checkinout = this.pricelist.attr('data-checkinout'),
            with_check_in = this.pricelist.attr('data-checkin'),
            with_check_out = this.pricelist.attr('data-checkout');

        // lang of request
        if (typeof this.pricelist.attr('data-with-lang') != "undefined") {
            this.withData.lang = this.pricelist.attr('data-with-lang');
        } else {
            this.withData.lang = this.getLanguage();
        }
        // set Fallback language of request if set
        if (typeof $('#withPricelistScript').attr('data-fallback-lang') != "undefined") {
            this.withData.fallback_lang = $('#withPricelistScript').attr('data-fallback-lang');
        }

        // pricelist id
        if (typeof with_slug == "undefined" || with_slug.length == 0) {
            pricelist_id = with_id;
        } else {
            pricelist_id = with_slug;
        }
        this.withData.id = pricelist_id;

        // if data-with-services send request for retrieve only that services
        if (typeof this.pricelist.attr('data-with-services') !== 'undefined') {
            this.withData.only_services = this.pricelist.attr('data-with-services');
            this.clog('0.1 - Data Show Only Services: ' + this.withData.only_services);
        }

        // if isset check_in/out
        if (typeof with_check_in != 'undefined' && with_check_in.length > 0 && typeof with_check_out != 'undefined' && with_check_out.length > 0) {
            this.withData.check_in = with_check_in;
            this.withData.check_out = with_check_out;
            this.clog('0.2 - Set CheckIn - Out: ' + with_check_in + ' - ' + with_check_out);
        }
        else if (typeof with_checkinout != 'undefined' && with_checkinout.length > 0) {
            this.withData.check_inout = with_checkinout;
            this.clog('0.2 - Set CheckInOut: ' + with_checkinout);
        }

        // adults, children, children_age on pricelist data
        var with_adults = this.pricelist.attr('data-with-adults'),
            with_children = this.pricelist.attr('data-with-children'),
            with_children_age = this.pricelist.attr('data-with-children-age');

        this.withData.adults = (typeof with_adults == "undefined" || with_adults.length == 0) ? 1 : with_adults;
        this.withData.children = (typeof with_children == "undefined" || with_children.length == 0) ? 0 : with_children;
        this.withData.children_age = (typeof with_children_age == "undefined" || with_children_age.length == 0) ? [] : with_children_age.split(',');

        // set custom access token if isset in url (for preview in the pricelistCMS)
        var url_string = window.location.href;
        var url = new URL(url_string);
        if (url.searchParams.has("access_token")) {
            this.withData.access_token = url.searchParams.get("access_token");
            this.clog('0 - setCustomAccessToken');
            this.clog(this.withData.access_token);
        }

        // if data-with-description="false" disable description of pricelist, this override settings in CMS
        if (typeof this.pricelist.attr('data-with-description') !== 'undefined') {
            if (this.pricelist.attr('data-with-description') == "false" || this.pricelist.attr('data-with-description') == false) {
                this.withData.opt = {opt_pricelist_description: false};
                this.clog('0.3 - This Pricelist Disable Description!');
            }
        }

        this.clog('0.9 - setPageData');
        this.clog(this.withData);
    };

    withPricelist.prototype.setFormData = function (formSelector) {
        if (typeof formSelector.length == 'undefined' || formSelector.length > 0) {
            formSelector = $('.period', this.pricelist);
        }

        var formData = {};

        var check_in = '', check_out = '', children_age = [];
        formSelector.serializeArray().map(function (x) {
            if (x.name == 'check_in') {
                check_in = x.value;
            } else if (x.name == 'check_out') {
                check_out = x.value;
            } else if (x.name == 'children_age[]') {
                children_age.push(x.value);
            } else {
                formData[x.name] = x.value;
            }
        });

        formData.check_inout = check_in + '-' + check_out;
        formData.children_age = children_age;

        // add form data to yet set withData
        $.extend(this.withData, formData);

        this.clog('setFormData');
        this.clog(this.withData);
    };

    withPricelist.prototype.initPricelist = function () {
        this.setPageData();
        var _wp = this;

        try {
            I18n_json = $.parseJSON(I18n_json);
        } catch (e) {
            // yet json, keep calm
        }
        handlebars.registerHelper('_t',
            function (str) {
                return _wp.trans(str);
            }
        );

        $.ajax({
            url: requirejs.toUrl('') + 'requests.php',
            method: 'GET',
            dataType: 'json',
            data: _wp.withData,
            success: function (json) {
                if (json.success) {
                    // remove loader
                    _wp.pricelist.find(".btnSearch").prop('disabled', false);

                    // disable cart at this point if search not yet performed
                    // @todo: here we need a control to option to, and it may be override from client js
                    if (typeof _wp.withData.check_inout != 'undefined' || typeof _wp.withData.with_check_in != 'undefined') {
                        json.opt.opt_pricelist_cart_modal = true;
                    } else {
                        json.opt.opt_pricelist_cart_modal = false;
                    }

                    // render pricelist with all layouts
                    _wp.renderPricelist(json);
                    _wp.clog('1 - Pricelist generated');
                } else {
                    _wp.pricelist.html('<span class="help-block alert alert-danger">' + json.message + '</span>');
                }
            },
            error: function () {
                _wp.pricelist.html('<span class="help-block alert alert-danger">' + _wp.trans('pricelist.render error') + '</span>');
            }
        });
    };

    withPricelist.prototype.updatePricelist = function () {
        // add loader
        this.pricelist.find(".btnSearch").prop('disabled', true);
        // loader for table body
        $(".pricelistTable", this.pricelist).find(".pricelistResult").addClass('table_loader_center').hide('fast', function () {
            $(this).html('<tr><td colspan="' + $(".pricelistTable", this.pricelist).find('thead th').length + '"><img src="' + requirejs.toUrl('') + 'img/loader.svg" class="loader_table" /></td></tr>').show();
        });

        this.setFormData($('.period', this.pricelist));

        var _wp = this;
        $.ajax({
            url: requirejs.toUrl('') + 'requests.php',
            method: 'GET',
            dataType: 'json',
            data: _wp.withData,
            success: function (json) {
                if (json.success) {
                    // remove loader
                    _wp.pricelist.find(".btnSearch").prop('disabled', false);
                    $(".pricelistTable", _wp.pricelist).find("tbody").removeClass('table_loader_center');

                    // @todo: cart and modal need own option
                    json.opt.opt_pricelist_cart_modal = json.opt.opt_pricelist_search;

                    // render pricelist with all layouts
                    _wp.renderPricelist(json);
                    _wp.clog('6 - Pricelist updated');

                    _wp.clog('3 - Pricelist totals counter');
                    _wp.initCart();
                } else {
                    // remove loader
                    _wp.pricelist.find(".btnSearch").prop('disabled', false);

                    _wp.pricelist.find('.pricelistTable').html('<span class="help-block alert alert-danger">' + json.message + '</span>');
                }
            },
            error: function () {
                // remove loader
                _wp.pricelist.find(".btnSearch").prop('disabled', false);

                _wp.pricelist.find('.pricelistTable').html('<span class="help-block alert alert-danger">' + _wp.trans('pricelist.render error') + '</span>');
            }
        });
    };

    withPricelist.prototype.renderPricelist = function (data) {
        this.clog('renderData');
        this.clog(data);

        // init Templates
        var html_tpl = handlebars.compile(master_layout);

        // custom datepicker - if search datepicker enabled add the needed partials templates to master
        // if (data.opt.opt_pricelist_search) {
        //     var datepicker_tpl = handlebars.compile(datepicker_layout);
        //     handlebars.registerPartial('withDatepicker', datepicker_tpl);
        // }

        // if search enabled add the needed partials templates to master
        if (data.opt.opt_pricelist_cart_modal) {
            var cart_tpl = handlebars.compile(cart_layout),
                cart_items_tpl = handlebars.compile(cart_items_layout),
                modal_tpl = handlebars.compile(modal_layout),
                modal_items_tpl = handlebars.compile(modal_items_layout);

            handlebars.registerPartial('withCart', cart_tpl);
            handlebars.registerPartial('withCartItems', cart_items_tpl);
            handlebars.registerPartial('withModal', modal_tpl);
            handlebars.registerPartial('withModalItems', modal_items_tpl);
        }

        // merge json returned 'data' with the form or page data that are used to init/update
        // @todo: create a good white list maybe by define all data that i have yet defined here and that i can receive from server
        var whiteListAllData = {
            urls: this.withAllData.urls
        };
        this.withAllData = $.extend(data, this.withData, whiteListAllData);
        this.pricelist.html(html_tpl(this.withAllData));

        this.clog('#Pricelist rendered');
        $('[data-toggle=tooltip]').tooltip();

        if (data.opt.opt_pricelist_search) {
            this.clog('2 - Pricelist search opt enabled');
            // if its a search request init Prices
            if (typeof this.withData.check_inout != 'undefined' || typeof this.withData.with_check_in != 'undefined') {
                this.clog('3 - Pricelist totals counter');
                this.initCart();
            }
            // show datepicker
            this.clog('4 - Pricelist datepicker');
            this.initDatepicker();
        }
    };

    withPricelist.prototype.submitModal = function (modalForm) {
        // add loader
        this.pricelist.find(".btnModal").prop('disabled', true);
        // hide message's
        this.pricelist.find(".success-message").hide();
        this.pricelist.find(".errors-message").hide();

        var serializedData = modalForm.serialize();
        if (typeof this.withData.children_age != 'undefined' && this.withData.children_age.length > 0) {
            serializedData = serializedData + '&params[children_age]=' + this.withData.children_age.toString();
        }
        // Add js_referral to mail - depends on https://github.com/arturmamedov/utm_referral-cookie
        if (typeof cookieToString != 'undefined' && typeof cookieToString('js_referral') != 'undefined') {
            var js_referral_returned = '';
            if (typeof cookieToString('js_referral_returned') != 'undefined') {
                js_referral_returned = ' - Referral 2: ' + cookieToString('js_referral_returned');
            }
            serializedData = serializedData + '&params[ga_refferer]=' + cookieToString('js_referral') + js_referral_returned;
        }

        var _wp = this;
        $.ajax({
            url: requirejs.toUrl('') + 'post_requests.php',
            method: 'POST',
            dataType: 'json',
            data: serializedData,
            success: function (json) {
                if (json.success) {
                    // if(typeof ga != 'undefined') { ... console.info('no ga'); }
                    // GAT - ga('send', 'pageview', '/email-form-preventivo');

                    // remove loader
                    _wp.pricelist.find(".btnModal").prop('disabled', false);

                    // success message
                    _wp.pricelist.find(".success-message").html('<h3 class="text-success text-center">' + json.message + '</h3><h1 class="text-center"><i class="glyphicon glyphicon-ok text-success"></i></h1>').show();

                    // reset form
                    _wp.pricelist.find(".modal-form").html('<h5 class="text-center">' + _wp.trans('modal.for another quote') + '</h5>');

                    _wp.clog('5 - Modal Form Submitted');
                } else {
                    // remove loader
                    _wp.pricelist.find(".btnModal").prop('disabled', false);

                    // error message
                    _wp.pricelist.find(".errors-message").html('<p class="text-danger text-center">' + json.message + ' <i class="glyphicon glyphicon-remove text-danger"></i></p>').show();
                }
            },
            error: function () {
                // remove loader
                _wp.pricelist.find(".btnModal").prop('disabled', false);

                // general error message
                _wp.pricelist.find(".errors-message").html('<p class="text-danger text-center">' + _wp.trans('modal.send error') + ' <i class="glyphicon glyphicon-remove text-danger"></i></p>').show();
            }
        });
    };

    /*
     * Calculate the totals of pricelist for booking
     */
    withPricelist.prototype.cartTotals = function () {
        // reset cart
        this.cartItems = {};
        $(".pt-grand-total-all-periods", this.pricelist).number(0, 2, ',', ' ').attr('data-amount', 0);
        var grand_total = 0;

        var _wp = this;
        // pass trough all quantity of pricelist and add it to cart
        $(".pt-num-cell .num", this.pricelist).each(function () {
            // get num of services
            // get id of service
            var n = parseInt($(this).val()), num = n || 0;

            // if quantity of service is greater then 0 add it!
            for (var i = 1; i <= num; i++) {
                var id = parseInt($(this).attr('data-id')),
                    period_total = parseFloat($(".pt-total-all-periods-" + id, _wp.pricelist).attr('data-amount')),
                    service_name = $(".pt-total-all-periods-" + id, _wp.pricelist).attr('data-service-name'),
                    apt = num * period_total, services_periods_total = apt || 0;

                $(".pt-total-all-periods-" + id, _wp.pricelist).number(period_total, 2, ',', ' ');
                var readable_period_total = $(".pt-total-all-periods-" + id, _wp.pricelist).text();

                $(".pt-grand-total-all-periods-" + id, _wp.pricelist).number(services_periods_total, 2, ',', ' ').attr('data-amount', services_periods_total);
                _wp.cartItems[id + '-' + i] = ({
                    id: id,
                    num: i,
                    service_name: service_name,
                    period_total: period_total,
                    readable_period_total: readable_period_total
                });
                _wp.clog('3.3 - Aggiunto: ' + id + '/' + num + ' name: ' + service_name + ' price: ' + period_total);

                grand_total = grand_total + period_total;
                _wp.clog('3.4 - Calcolo: ' + period_total + ' +');
            }
        });
        this.clog(this.cartItems);

        // grand total show
        $(".pt-grand-total", this.pricelist).number(grand_total, 2, ',', ' ');
        this.clog('3.5 - Totale: ' + grand_total);
        // Total to cartData
        this.cartData.grand_total = grand_total;
        this.cartData.readable_grand_total = $(".pt-grand-total", this.pricelist).first().text();

        // update Cart items
        this.updateCartItems();
    };

    withPricelist.prototype.addToCart = function (id) {
        var value = parseInt($(".service" + id + " .pt-num-cell .num", this.pricelist).val()), quantity;
        value = (isNaN(value)) ? 0 : value;
        quantity = value + 1;
        $(".service" + id + " .pt-num-cell .num", this.pricelist).val(quantity);

        this.cartTotals();
    };

    withPricelist.prototype.removeFromCart = function (index, id) {
        delete this.cartItems[index];

        var quantity, value = parseInt($(".service" + id + " .pt-num-cell .num", this.pricelist).val());
        quantity = ((value - 1) <= 0) ? 0 : value - 1;
        $(".service" + id + " .pt-num-cell .num", this.pricelist).val(quantity);

        this.cartTotals();
    };

    withPricelist.prototype.updateCartItems = function () {
        this.cartData.cartItems = this.cartItems;

        // in cart
        var cart_items_tpl = handlebars.compile(cart_items_layout);
        $('.withCart .withCartContent', this.pricelist).html(cart_items_tpl(this.cartData));

        // in modal
        var modal_items_tpl = handlebars.compile(modal_items_layout);
        $(".modal", this.pricelist).find('.modal-list').html(modal_items_tpl(this.cartData));
    };

    withPricelist.prototype.initCart = function () {
        var _wp = this;

        // if (this.pricelist.find('.withCart').hasClass("cart_enabled")) {
        if (this.pricelist.hasClass("cart_enabled")) {
            // cart events yet enabled
            this.clog('3.2 - Cart yet here');

            /* @bugged $('.withCartBox', this.pricelist).affix({
                offset: {
                    top: $('.withCart', _wp.pricelist).offset().top,
                    bottom: $(document).height() - _wp.pricelist.offset().top - _wp.pricelist.height()
                }
            }).css({
                "width": $('.withCartBox', _wp.pricelist).outerWidth() + 'px'
                //, "left": $('.withCartBox', this.pricelist).offset().left
            });*/
        } else {
            // this.pricelist.find('.withCart').addClass('cart_enabled');
            this.pricelist.addClass('cart_enabled');
            this.clog('3.1 - Cart events enabled');

            // Fire the calculation on change of num input
            this.pricelist.on('change', '.pt-num-cell input.num', function () {
                _wp.cartTotals();
            });

            // attach event on modal open
            // $(".modal", this.pricelist).on('show.bs.modal', function () {
            //     var modal_items_tpl = handlebars.compile(modal_items_layout);
            //     $(this).find('.modal-list').html(modal_items_tpl(_wp.cartData));
            // });

            // attach event on modal form submit
            $(this.pricelist).on('submit', ".modal-form", function () {
                _wp.submitModal($(this));
                return false;
            });

            this.pricelist.on('click', '.add-service', function () {
                _wp.addToCart($(this).attr('data-service-id'));
            });

            $(this.pricelist).on('click', '.withCartBox .remove', function () {
                _wp.removeFromCart($(this).attr('data-service-index'), $(this).attr('data-service-id'));
            });

            /* @bugged $('.withCartBox', this.pricelist).affix({
                offset: {
                    top: $('.withCart', _wp.pricelist).offset().top,
                    bottom: $(document).height() - _wp.pricelist.offset().top - _wp.pricelist.height()
                }
            }).css({
                "width": $('.withCartBox', _wp.pricelist).outerWidth() + 'px'
                //, "left": $('.withCartBox', this.pricelist).offset().left
            });*/
        }

        // if isset yet something in input num get the total immediately
        this.cartTotals();
    };

    withPricelist.prototype.initDatepicker = function () {
        var _wp = this;

        if (this.pricelist.find('.period').hasClass("dp_enabled")) {
            // datapicker yet here
            this.clog('4.2 - Datapicker yet here');
        } else {
            this.clog('4.1 - Datapicker init');
            var bs_datepicker = this.pricelist.find('.period');
            bs_datepicker.addClass('dp_enabled');

            var date = new Date(),
                start_date = new Date(this.withAllData.iso_start_date),
                end_date = new Date(this.withAllData.iso_end_date),
                bsdp_lang_code = bs_datepicker.attr('data-lang');

            if (typeof bsdp_lang_code == 'undefined' || bsdp_lang_code.length == 0) {
                bsdp_lang_code = $("html").attr('lang');
            }
            if (typeof bsdp_lang_code == 'undefined' || bsdp_lang_code.length == 0 || bsdp_lang_code == 'en') {
                bsdp_lang_code = 'en-GB';
            }

            if (date.getTime() > start_date.getTime()) {
                start_date = date;
            }

            // # locales
            switch (bsdp_lang_code) {
                case'it':
                    $.fn.datepicker.dates['it'] = {
                        days: ["Domenica", "Lunedì", "Martedì", "Mercoledì", "Giovedì", "Venerdì", "Sabato"],
                        daysShort: ["Dom", "Lun", "Mar", "Mer", "Gio", "Ven", "Sab"],
                        daysMin: ["Do", "Lu", "Ma", "Me", "Gi", "Ve", "Sa"],
                        months: ["Gennaio", "Febbraio", "Marzo", "Aprile", "Maggio", "Giugno", "Luglio", "Agosto", "Settembre", "Ottobre", "Novembre", "Dicembre"],
                        monthsShort: ["Gen", "Feb", "Mar", "Apr", "Mag", "Giu", "Lug", "Ago", "Set", "Ott", "Nov", "Dic"],
                        today: "Oggi",
                        monthsTitle: "Mesi",
                        clear: "Cancella",
                        weekStart: 1,
                        format: "dd/mm/yyyy"
                    };
                    break;
                case'fr':
                    $.fn.datepicker.dates['fr'] = {
                        days: ["dimanche", "lundi", "mardi", "mercredi", "jeudi", "vendredi", "samedi"],
                        daysShort: ["dim.", "lun.", "mar.", "mer.", "jeu.", "ven.", "sam."],
                        daysMin: ["d", "l", "ma", "me", "j", "v", "s"],
                        months: ["janvier", "février", "mars", "avril", "mai", "juin", "juillet", "août", "septembre", "octobre", "novembre", "décembre"],
                        monthsShort: ["janv.", "févr.", "mars", "avril", "mai", "juin", "juil.", "août", "sept.", "oct.", "nov.", "déc."],
                        today: "Aujourd'hui",
                        monthsTitle: "Mois",
                        clear: "Effacer",
                        weekStart: 1,
                        format: "dd/mm/yyyy"
                    };
                    break;
                case'de':
                    $.fn.datepicker.dates['de'] = {
                        days: ["Sonntag", "Montag", "Dienstag", "Mittwoch", "Donnerstag", "Freitag", "Samstag"],
                        daysShort: ["Son", "Mon", "Die", "Mit", "Don", "Fre", "Sam"],
                        daysMin: ["So", "Mo", "Di", "Mi", "Do", "Fr", "Sa"],
                        months: ["Januar", "Februar", "März", "April", "Mai", "Juni", "Juli", "August", "September", "Oktober", "November", "Dezember"],
                        monthsShort: ["Jan", "Feb", "Mär", "Apr", "Mai", "Jun", "Jul", "Aug", "Sep", "Okt", "Nov", "Dez"],
                        today: "Heute",
                        monthsTitle: "Monate",
                        clear: "Löschen",
                        weekStart: 1,
                        format: "dd.mm.yyyy"
                    };
                    break;
                case'pl':
                    $.fn.datepicker.dates['pl'] = {
                        days: ["niedziela", "poniedziałek", "wtorek", "środa", "czwartek", "piątek", "sobota"],
                        daysShort: ["niedz.", "pon.", "wt.", "śr.", "czw.", "piąt.", "sob."],
                        daysMin: ["ndz.", "pn.", "wt.", "śr.", "czw.", "pt.", "sob."],
                        months: ["styczeń", "luty", "marzec", "kwiecień", "maj", "czerwiec", "lipiec", "sierpień", "wrzesień", "październik", "listopad", "grudzień"],
                        monthsShort: ["sty.", "lut.", "mar.", "kwi.", "maj", "cze.", "lip.", "sie.", "wrz.", "paź.", "lis.", "gru."],
                        today: "dzisiaj",
                        weekStart: 1,
                        clear: "wyczyść",
                        format: "dd.mm.yyyy"
                    };
                    break;
                case'nl':
                    $.fn.datepicker.dates['nl'] = {
                        days: ["zondag", "maandag", "dinsdag", "woensdag", "donderdag", "vrijdag", "zaterdag"],
                        daysShort: ["zo", "ma", "di", "wo", "do", "vr", "za"],
                        daysMin: ["zo", "ma", "di", "wo", "do", "vr", "za"],
                        months: ["januari", "februari", "maart", "april", "mei", "juni", "juli", "augustus", "september", "oktober", "november", "december"],
                        monthsShort: ["jan", "feb", "mrt", "apr", "mei", "jun", "jul", "aug", "sep", "okt", "nov", "dec"],
                        today: "Vandaag",
                        monthsTitle: "Maanden",
                        clear: "Wissen",
                        weekStart: 1,
                        format: "dd-mm-yyyy"
                    };
                    break;
                case'hu':
                    $.fn.datepicker.dates['hu'] = {
                        days: ["vasárnap", "hétfő", "kedd", "szerda", "csütörtök", "péntek", "szombat"],
                        daysShort: ["vas", "hét", "ked", "sze", "csü", "pén", "szo"],
                        daysMin: ["V", "H", "K", "Sze", "Cs", "P", "Szo"],
                        months: ["január", "február", "március", "április", "május", "június", "július", "augusztus", "szeptember", "október", "november", "december"],
                        monthsShort: ["jan", "feb", "már", "ápr", "máj", "jún", "júl", "aug", "sze", "okt", "nov", "dec"],
                        today: "ma",
                        weekStart: 1,
                        clear: "töröl",
                        titleFormat: "yyyy. MM",
                        format: "yyyy.mm.dd"
                    };
                    break;
            }

            // date picker
            bs_datepicker.datepicker({
                startDate: start_date.getDate() + '/' + (start_date.getMonth() + 1) + '/' + start_date.getFullYear(),
                endDate: end_date.getDate() + '/' + (end_date.getMonth() + 1) + '/' + end_date.getFullYear(),
                format: 'dd/mm/yyyy',
                inputs: $('.range', bs_datepicker),
                todayHighlight: true,
                todayBtn: 'linked',
                daysOfWeekHighlighted: "0",
                zIndexOffset: 9999,
                orientation: 'bottom',
                autoclose: true,
                language: bsdp_lang_code
            });

            $(".checkin", bs_datepicker).datepicker()
                .on('changeDate', function (e) {
                    $(".checkout", bs_datepicker).focus();
                });

            bs_datepicker.on('submit', function (e) {
                // if(typeof ga != 'undefined') {
                // GAT - ga('send', 'event', 'preventivo', 'calcola', 'sito-web', '5');
                _wp.clog('4.3 - Datapicker send new request');

                // update pricelist
                _wp.updatePricelist();

                // reset cart
                _wp.cartItems = {};
                _wp.updateCartItems();
                return false;
            });

            /**
             * childNum counter
             * ex:
             *
             * <form class="... children_age_form"> ...
             * <input type="number" class="form-control child_num_input" min="0" max="4" name="num_children">
             *
             *     and
             *
             *     <div class="col-sm-2 pull-right display-none" id="child_ageClone">
             *           <div class="form-group">
             *               <input type="number" placeholder="0" class="form-control" name="age_children[]" value="1" max="17" min="1" disabled/>
             *
             *           <label>Children <span class="jq_child_num">1</span></label>
             *           </div>
             *        </div>
             *  and
             *  impolode(',', $_POST['age_children']) in PHP
             *
             * max children: 4 @todo: configurabe
             * @type {any}
             */
            // $(".children_age_form", this.pricelist).each(function () {
            //     var form = $(this);
            //     form.on('keyup change', '.child_num_input', function () {
            //         // if counter are equal 0 - do nothing
            //         var _childNum = $('.child_num_input', form).val();
            //         if (_childNum == 0) {
            //             childNum = 0;
            //             $("[id^='child_age_']", form).remove();
            //             return false;
            //         }
            //         // over 4 chlids are invalid
            //         if (_childNum > 4) {
            //             $('body').gdivMessage(this.trans('datepicker.no more children'), 'warning', {hidetime: 7000});
            //             $('.child_num_input', form).val(4);
            //             return false;
            //         }
            //
            //         $("[id^='child_age_']", form).remove();
            //         for (var _cN = 1; _cN <= _childNum; _cN++) {
            //             var childClone = $('#child_ageClone', form).clone();
            //
            //             // change params
            //             childClone.attr('id', 'child_age_' + _cN);
            //             childClone.find('.jq_child_num').text(_cN);
            //             childClone.find('input').prop("disabled", false).removeProp('disabled').val(parseInt(_wp.withData.children_age[_cN - 1]));
            //
            //             // attach and show
            //             $('#child_ageClone', form).after(childClone);
            //             childClone.show();
            //
            //             form.css('padding-bottom', '10px');
            //         }
            //         childNum = $('.child_num_input', form).val();
            //     });
            //
            //     // init childNum counter
            //     function addAges(childNum) {
            //         for (var _childNum = 1; _childNum <= childNum; _childNum++) {
            //             if (_childNum > 4) {
            //                 $('.child_num_input', form).val(4);
            //                 return false;
            //             }
            //             var childClone = $('#child_ageClone', form).clone();
            //
            //             // change params
            //             childClone.attr('id', 'child_age_' + _childNum);
            //             childClone.find('.jq_child_num').text(_childNum);
            //             childClone.find('input').prop("disabled", false).removeProp('disabled').val(parseInt(_wp.withData.children_age[_childNum - 1]));
            //
            //             // attach and show
            //             $('#child_ageClone', form).after(childClone);
            //             childClone.show();
            //
            //             form.css('padding-bottom', '10px');
            //         }
            //     }
            //
            //     var childNum = $('.child_num_input', form).val();
            //     if (childNum > 0) {
            //         addAges(childNum);
            //     }
            // });
        }
    };

    withPricelist.prototype.setLanguage = function (lang) {
        if (!lang.length) {
            lang = 'auto';
        }

        if (lang == 'auto') {
            lang = $('html').attr('lang');

            if (!lang.length) {
                var browserLocale = navigator.language || navigator.userLanguage;
                lang = browserLocale.split('-')[0];
            }
        }

        if (!lang.length) {
            if (!this.lang.length) {
                this.lang = 'it';
            }
        } else {
            this.lang = lang;
        }

        return this.lang;
    };

    withPricelist.prototype.getLanguage = function () {
        if (this.lang.length > 0 && this.lang != 'auto') {
            return this.lang;
        } else {
            return this.setLanguage('auto');
        }
    };

    /**
     * Method for translate strings in the current selected this.lang or fallback or return the passed str without context prefix
     * @param string str
     * @returns string Translated str
     */
    withPricelist.prototype.trans = function (str) {
        var translated, lang_code = this.getLanguage();

        if (typeof I18n_json[lang_code] != 'undefined') {
            if (typeof I18n_json[lang_code][str] != 'undefined') {
                translated = I18n_json[lang_code][str];
            } else {
                translated = str.substr(str.indexOf('.') + 1);
                translated = translated.charAt(0).toUpperCase() + translated.slice(1);
                console.error('Missed translate: ' + lang_code + ' - for: ' + str);
            }
        } else {
            translated = str.substr(str.indexOf('.') + 1);
            translated = translated.charAt(0).toUpperCase() + translated.slice(1);
            console.error('Missed entire language: ' + lang_code + ' - when translating: ' + str);
        }

        return translated;
    };

    return withPricelist;
});