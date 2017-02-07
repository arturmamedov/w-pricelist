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
    'text!templates/cart.html',
    'text!templates/cart_items.html',
    'text!templates/modal.html',
    'text!templates/modal_items.html'
], function ($, number, datepicker, handlebars, bootstrap, master_layout, cart_layout, cart_items_layout, modal_layout, modal_items_layout) {
    var withPricelist = {
        debug: true,
        lang: 'it',
        pricelist: {},
        cartData: {},
        cartItems: {},

        clog: function (text) {
            if (withPricelist.debug) {
                console.info(text);
            }
        },

        getPricelist: function (pricelist, withData) {
            withPricelist.pricelist = pricelist;

            // add loader
            withPricelist.pricelist.find(".btnSearch").prop('disabled', true);
            withPricelist.pricelist.find("tbody").addClass('table_loader_center').hide('slow', function () {
                $(this).html('<tr><td colspan="' + pricelist.find('thead th').length + '"><img src="' + requirejs.toUrl('') + 'img/loader.svg" class="loader_table" /></td></tr>').show();
            });

            $.ajax({
                url: requirejs.toUrl('') + 'requests.php',
                method: 'GET',
                dataType: 'json',
                data: withData,
                success: function (json) {
                    if (json.success) {
                        // remove loader
                        withPricelist.pricelist.find(".btnSearch").prop('disabled', false);
                        withPricelist.pricelist.find("tbody").removeClass('table_loader_center');

                        if (withPricelist.pricelist.find('table').length) {
                            // refresh table content
                            withPricelist.pricelist.find('table').html(json.html.table);
                        } else {
                            // init Template
                            var html_tpl = handlebars.compile(master_layout),
                                cart_tpl = handlebars.compile(cart_layout),
                                cart_items_tpl = handlebars.compile(cart_items_layout),
                                modal_tpl = handlebars.compile(modal_layout),
                                modal_items_tpl = handlebars.compile(modal_items_layout);

                            handlebars.registerPartial('withCart', cart_tpl);
                            handlebars.registerPartial('withCartItems', cart_items_tpl);
                            handlebars.registerPartial('withModal', modal_tpl);
                            handlebars.registerPartial('withModalItems', modal_items_tpl);

                            withPricelist.pricelist.html(html_tpl(json));
                        }
                        withPricelist.clog('1 - Pricelist generated');

                        if (json.opt.opt_pricelist_search) {
                            withPricelist.clog('2 - Pricelist search opt enabled');
                            // if its a search request init Prices
                            if (typeof withData.check_inout != 'undefined' || typeof withData.with_check_in != 'undefined') {
                                withPricelist.clog('3 - Pricelist totals counter');
                                withPricelist.initCart();
                            }
                            // show datepicker
                            withPricelist.clog('4 - Pricelist datepicker');
                            withPricelist.datePicker();
                        }
                    } else {
                        // remove loader
                        withPricelist.pricelist.find(".btnSearch").prop('disabled', false);

                        if (withPricelist.pricelist.find('table').length) {
                            withPricelist.pricelist.find('table').html('<span class="help-block alert alert-danger">' + json.message + '</span>');
                        } else {
                            withPricelist.pricelist.html('<span class="help-block alert alert-danger">' + json.message + '</span>');
                        }
                    }
                },
                error: function () {
                    withPricelist.pricelist.html('<span class="help-block alert alert-danger">Pricelist Error! Errore durante la generazione del listino prezzi :(</span>');
                }
            });
        },

        submitModal: function (modalFrom) {
            // add loader
            withPricelist.pricelist.find(".btnModal").prop('disabled', true);

            $.ajax({
                url: requirejs.toUrl('') + 'post_requests.php',
                method: 'POST',
                dataType: 'json',
                data: modalFrom.serialize(),
                success: function (json) {
                    if (json.success) {
                        // remove loader
                        withPricelist.pricelist.find(".btnModal").prop('disabled', false);

                        // success message, animations.... @todo
                        //.html(json.html.table);

                        withPricelist.clog('5 - Modal Form Submitted');
                    } else {
                        // remove loader
                        withPricelist.pricelist.find(".btnModal").prop('disabled', false);

                        // error message ... @todo
                        //.html('<span class="help-block alert alert-danger">' + json.message + '</span>');
                    }
                },
                error: function () {
                    // general error message ... @todo
                    //.html('<span class="help-block alert alert-danger">Pricelist Error! Errore durante la generazione del listino prezzi :(</span>');
                }
            });
        },

        /*
         * Calculate the totals of pricelist for booking
         */
        cartTotals: function () {
            // reset cart
            withPricelist.cartItems = {};
            $(".pt-grand-total-all-periods", withPricelist.pricelist).number(0, 2, ',', ' ').attr('data-amount', 0);
            var grand_total = 0;

            // pass trough all quantity of pricelist and add it to cart
            $(".pt-num-cell .num", withPricelist.pricelist).each(function () {
                // get num of services
                // get id of service
                var n = parseInt($(this).val()), num = n || 0;

                // if quantity of service is greater then 0 add it!
                for (i = 1; i <= num; i++) {
                    var id = parseInt($(this).attr('data-id')),
                        period_total = parseFloat($(".pt-total-all-periods-" + id, withPricelist.pricelist).attr('data-amount')),
                        service_name = $(".pt-total-all-periods-" + id, withPricelist.pricelist).attr('data-service-name'),
                        apt = num * period_total, services_periods_total = apt || 0;

                    $(".pt-total-all-periods-" + id, withPricelist.pricelist).number(period_total, 2, ',', ' ');
                    var readable_period_total = $(".pt-total-all-periods-" + id, withPricelist.pricelist).text();

                    $(".pt-grand-total-all-periods-" + id, withPricelist.pricelist).number(services_periods_total, 2, ',', ' ').attr('data-amount', services_periods_total);
                    withPricelist.cartItems[id + '-' + num] = ({
                        id: id,
                        num: num,
                        service_name: service_name,
                        period_total: period_total,
                        readable_period_total: readable_period_total
                    });
                    withPricelist.clog('3.3 - Aggiunto: ' + id + '/' + num + ' name: ' + service_name + ' price: ' + period_total);


                    grand_total = grand_total + period_total;
                    withPricelist.clog('3.4 - Calcolo: ' + grand_total + ' +');
                }
            });

            // grand total show
            $(".pt-grand-total", withPricelist.pricelist).number(grand_total, 2, ',', ' ');
            withPricelist.clog('3.5 - Totale: ' + grand_total);
            // Total to cartData
            withPricelist.cartData.grand_total = grand_total;
            withPricelist.cartData.readable_grand_total = $(".pt-grand-total", withPricelist.pricelist).first().text();

            // Cart items
            withPricelist.cartData.cartItems = withPricelist.cartItems;
            var cart_items_tpl = handlebars.compile(cart_items_layout);
            $('.withCart .withCartContent', withPricelist.pricelist).html(cart_items_tpl(withPricelist.cartData));


            /*
            if (id > 0 && num > 0) {
                // get all priods total
             var period_total = parseFloat($(".pt-total-all-periods-" + id, withPricelist.pricelist).attr('data-amount')),
             service_name = $(".pt-total-all-periods-" + id, withPricelist.pricelist).attr('data-service-name'),
                    grand_total = 0;

                withPricelist.clog('3.3 - Aggiunto: ' + id + '/' + num + ' name: ' + service_name + ' price: ' + period_total);

                // write the addition of all periods total per num of services
                var apt = num * period_total, services_periods_total = apt || 0;

                // addToCart()
             $(".pt-grand-total-all-periods-" + id, withPricelist.pricelist).number(services_periods_total, 2, ',', ' ').attr('data-amount', services_periods_total);
             $(".pt-grand-total-all-periods-" + id, withPricelist.pricelist).number(services_periods_total, 2, ',', ' ');
             withPricelist.addToCart(id, service_name, period_total);

                // removeFromCart()


                // sum all totals of periods and services and write the grand total sum
             $(".pt-grand-total-all-periods", withPricelist.pricelist).each(function () {
                    var ap_totals = parseFloat($(this).attr('data-amount')); // @todo: intarnationalization
                    if (ap_totals > 0) {
                        grand_total = grand_total + ap_totals;
                        withPricelist.clog('3.4 - Calcolo: ' + ap_totals + ' +');
                    }
                });

                // grand total sum
             $(".pt-grand-total", withPricelist.pricelist).number(grand_total, 2, ',', ' ');
                withPricelist.clog('3.5 - Totale: ' + grand_total);
            }
             */
        },

        addToCart: function (id, service_name, period_total) {
            // $(".withCartContent > ul > li.nothingMessage", withPricelist.pricelist).hide();
            // $(".withCartContent > ul", withPricelist.pricelist).append('<li class="list-group-item cart-service-' + id + '">' + service_name + ' &nbsp; € ' + period_total + '</li>');
        },

        removeFromCart: function () {
            // $(".withCartContent > ul > li.nothingMessage", withPricelist.pricelist).hide();
            // $(".withCartContent > ul > li.cart-service-"+id, withPricelist.pricelist).remove();
        },

        initCart: function () {
            if (withPricelist.pricelist.hasClass("cart_enabled")) {
                // cart events yet enabled
                withPricelist.clog('3.2 - Cart yet here');
            } else {
                withPricelist.pricelist.addClass('cart_enabled');
                withPricelist.clog('3.1 - Cart events enabled');


                // Fire the calculation on change of num input
                withPricelist.pricelist.on('change', '.pt-num-cell input.num', function () {
                    withPricelist.cartTotals();
                });
            }

            // if isset yet something in input num get the total immediately
            withPricelist.cartTotals();


            // attach event on modal open
            $(".modal", withPricelist.pricelist).on('show.bs.modal', function () {
                var modal_items_tpl = handlebars.compile(modal_items_layout);
                $(this).find('.modal-list').html(modal_items_tpl(withPricelist.cartData));
            });

            // attach event on modal form submit
            $(".modal-form", withPricelist.pricelist).on('submit', function () {
                withPricelist.submitModal($(this));
                return false;
            });

            $('.withCartBox', withPricelist.pricelist).affix({
                offset: {
                    top: $('.withCart', withPricelist.pricelist).offset().top,
                    bottom: $(document).height() - withPricelist.pricelist.offset().top - withPricelist.pricelist.height()
                }
            }).css({
                "width": $('.withCartBox', withPricelist.pricelist).outerWidth() + 'px'
                //, "left": $('.withCartBox', withPricelist.pricelist).offset().left
            });
        },

        datePicker: function () {
            if (withPricelist.pricelist.find('.period').hasClass("dp_enabled")) {
                // datapicker yet here
                withPricelist.clog('4.2 - Datapicker yet here');
            } else {
                withPricelist.clog('4.1 - Datapicker init');
                var bs_datepicker = withPricelist.pricelist.find('.period');
                bs_datepicker.addClass('dp_enabled');

                var date = new Date(),
                    bsdp_lang_code = bs_datepicker.attr('data-lang');

                if (typeof bsdp_lang_code == 'undefined' || bsdp_lang_code.length == 0) {
                    bsdp_lang_code = $("html").attr('lang');
                }
                if (typeof bsdp_lang_code == 'undefined' || bsdp_lang_code.length == 0) {
                    bsdp_lang_code = 'en-GB';
                }

                // contact page datepicker
                bs_datepicker.datepicker({
                    //startDate: date.toString(),
                    //endDate: date.setDate(date.getDate() + 400).toString(),
                    format: 'dd/mm/yyyy',
                    inputs: $('.range'),
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
                    withPricelist.clog('4.3 - Datapicker send new request');

                    var withData = {},
                        pricelist_id,
                        with_slug = withPricelist.pricelist.attr('data-with-slug'),
                        with_id = withPricelist.pricelist.attr('data-with-id'),
                        with_lang = withPricelist.getLanguage();

                    withData.lang = with_lang;

                    // pricelist id
                    if (typeof with_slug == "undefined" || with_slug.length == 0) {
                        pricelist_id = with_id;
                    } else {
                        pricelist_id = with_slug;
                    }
                    withData.id = pricelist_id;


                    withData.check_inout = $('.checkin', bs_datepicker).val() + '-' + $('.checkout').val();

                    withPricelist.clog('4.3 - Datapicker data: ');
                    console.info(withData);
                    withPricelist.getPricelist(withPricelist.pricelist, withData);
                    return false;
                });
            }
        },

        setLanguage: function (lang) {
            if (!lang.length) {
                lang = 'auto';
            }

            if (lang == 'auto') {
                lang = $('html').attr('lang');

                if (!lang.length) {
                    browserLocale = navigator.language || navigator.userLanguage;
                    lang = browserLocale.split('-')[0];
                }
            }

            if (!lang.length) {
                if (!withPricelist.lang.length) {
                    withPricelist.lang = 'it';
                }
            } else {
                withPricelist.lang = lang;
            }

            return withPricelist.lang;
        },

        getLanguage: function () {
            if (withPricelist.lang.length) {
                return withPricelist.lang;
            } else {
                return withPricelist.setLanguage('');
            }
        },
    };

    return withPricelist;
});