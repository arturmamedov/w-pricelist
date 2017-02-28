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
    'text!templates/modal_items.html'
], function ($, number, datepicker, handlebars, bootstrap, master_layout, cart_layout, cart_items_layout, modal_layout, modal_items_layout) {
    var withPricelist = {
        // debug for show log message
        debug: true,
        // default language 'auto' (if it not set in html attr, or not found in browser = 'it')
        lang: 'auto',
        // current pricelist item
        pricelist: {},
        // data for perform request FORM data, and need to be shorter as possible
        withData: {},
        // all data that application collect from first to last request
        withAllData: {
            urls: {
                privacy: '/privacy-policy'
            }
        },
        // cartData, with grand_total etc.
        cartData: {},
        // cartItems, all selected services
        cartItems: {},

        clog: function (text) {
            if (withPricelist.debug) {
                console.info(text);
            }
        },

        // getPricelist: function (withData) {}, maybe with callback method showPricelist() ... but for the moment need ajax callback, success

        setPageData: function () {
            var pricelist_id,
                with_slug = withPricelist.pricelist.attr('data-with-slug'),
                with_id = withPricelist.pricelist.attr('data-with-id'),
                with_checkinout = withPricelist.pricelist.attr('data-checkinout'),
                with_check_in = withPricelist.pricelist.attr('data-checkin'),
                with_check_out = withPricelist.pricelist.attr('data-checkout');

            // lang of request
            withPricelist.withData.lang = withPricelist.getLanguage();

            // pricelist id
            if (typeof with_slug == "undefined" || with_slug.length == 0) {
                pricelist_id = with_id;
            } else {
                pricelist_id = with_slug;
            }
            withPricelist.withData.id = pricelist_id;

            // if isset check_in/out
            if (typeof with_check_in != 'undefined' && with_check_in.length > 0 && typeof with_check_out != 'undefined' && with_check_out.length > 0) {
                withPricelist.withData.check_in = with_check_in;
                withPricelist.withData.check_out = with_check_out;
            }
            else if (typeof with_checkinout != 'undefined' && with_checkinout.length > 0) {
                withPricelist.withData.check_inout = with_checkinout;
            }

            // adults, children, children_age on pricelist data
            var with_adults = withPricelist.pricelist.attr('data-with-adults'),
                with_children = withPricelist.pricelist.attr('data-with-children'),
                with_children_age = withPricelist.pricelist.attr('data-with-children-age');

            withPricelist.withData.adults = (typeof with_adults == "undefined" || with_adults.length == 0) ? 1 : with_adults;
            withPricelist.withData.children = (typeof with_children == "undefined" || with_children.length == 0) ? 0 : with_children;
            withPricelist.withData.children_age = (typeof with_children_age == "undefined" || with_children_age.length == 0) ? [] : with_children_age.split(',');

            withPricelist.clog('setPageData');
            withPricelist.clog(withPricelist.withData);
        },

        setFormData: function (formSelector) {
            if (typeof formSelector.length == 'undefined' || formSelector.length > 0) {
                formSelector = $('.period', withPricelist.pricelist);
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
            jQuery.extend(withPricelist.withData, formData);

            withPricelist.clog('setFormData');
            withPricelist.clog(withPricelist.withData);
        },

        initPricelist: function (pricelist) {
            withPricelist.pricelist = pricelist;

            withPricelist.setPageData();

            $.ajax({
                url: requirejs.toUrl('') + 'requests.php',
                method: 'GET',
                dataType: 'json',
                data: withPricelist.withData,
                success: function (json) {
                    if (json.success) {
                        // remove loader
                        withPricelist.pricelist.find(".btnSearch").prop('disabled', false);

                        // disable cart at this point if search not yet performed
                        // @todo: here we need a control to option to, and it may be override from client js
                        if (typeof withPricelist.withData.check_inout != 'undefined' || typeof withPricelist.withData.with_check_in != 'undefined') {
                            json.opt.opt_pricelist_cart_modal = true;
                        } else {
                            json.opt.opt_pricelist_cart_modal = false;
                        }

                        // render pricelist with all layouts
                        withPricelist.renderPricelist(json);
                        withPricelist.clog('1 - Pricelist generated');
                    } else {
                        withPricelist.pricelist.html('<span class="help-block alert alert-danger">' + json.message + '</span>');
                    }
                },
                error: function () {
                    withPricelist.pricelist.html('<span class="help-block alert alert-danger">Pricelist Error! Errore durante la generazione del listino prezzi :(</span>');
                }
            });
        },

        updatePricelist: function () {
            // add loader
            withPricelist.pricelist.find(".btnSearch").prop('disabled', true);
            // loader for table body
            $(".pricelistTable", withPricelist.pricelist).find(".pricelistResult").addClass('table_loader_center').hide('fast', function () {
                $(this).html('<tr><td colspan="' + $(".pricelistTable", withPricelist.pricelist).find('thead th').length + '"><img src="' + requirejs.toUrl('') + 'img/loader.svg" class="loader_table" /></td></tr>').show();
            });

            withPricelist.setFormData($('.period', withPricelist.pricelist));

            $.ajax({
                url: requirejs.toUrl('') + 'requests.php',
                method: 'GET',
                dataType: 'json',
                data: withPricelist.withData,
                success: function (json) {
                    if (json.success) {
                        // remove loader
                        withPricelist.pricelist.find(".btnSearch").prop('disabled', false);
                        $(".pricelistTable", withPricelist.pricelist).find("tbody").removeClass('table_loader_center');

                        // @todo: cart and modal need own option
                        json.opt.opt_pricelist_cart_modal = json.opt.opt_pricelist_search;

                        // render pricelist with all layouts
                        withPricelist.renderPricelist(json);
                        withPricelist.clog('6 - Pricelist updated');

                        withPricelist.clog('3 - Pricelist totals counter');
                        withPricelist.initCart();
                    } else {
                        // remove loader
                        withPricelist.pricelist.find(".btnSearch").prop('disabled', false);

                        withPricelist.pricelist.find('.pricelistTable').html('<span class="help-block alert alert-danger">' + json.message + '</span>');
                    }
                },
                error: function () {
                    // remove loader
                    withPricelist.pricelist.find(".btnSearch").prop('disabled', false);

                    withPricelist.pricelist.find('.pricelistTable').html('<span class="help-block alert alert-danger">Pricelist Error! Errore durante la generazione del listino prezzi :(</span>');
                }
            });
        },

        renderPricelist: function (data) {
            withPricelist.clog('renderData');
            withPricelist.clog(data);

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
            withPricelist.withAllData = $.extend(data, withPricelist.withData);
            withPricelist.pricelist.html(html_tpl(withPricelist.withAllData));

            if (data.opt.opt_pricelist_search) {
                withPricelist.clog('2 - Pricelist search opt enabled');
                // if its a search request init Prices
                if (typeof withPricelist.withData.check_inout != 'undefined' || typeof withPricelist.withData.with_check_in != 'undefined') {
                    withPricelist.clog('3 - Pricelist totals counter');
                    withPricelist.initCart();
                }
                // show datepicker
                withPricelist.clog('4 - Pricelist datepicker');
                withPricelist.initDatepicker();
            }
        },

        submitModal: function (modalForm) {
            // add loader
            withPricelist.pricelist.find(".btnModal").prop('disabled', true);

            var serializedData = modalForm.serialize();
            if (typeof withPricelist.withData.children_age != 'undefined' && withPricelist.withData.children_age.length > 0) {
                serializedData = serializedData + '&params[children_age]=' + withPricelist.withData.children_age.toString();
            }

            $.ajax({
                url: requirejs.toUrl('') + 'post_requests.php',
                method: 'POST',
                dataType: 'json',
                data: serializedData,
                success: function (json) {
                    if (json.success) {
                        // GAT - ga('send', 'pageview', '/email-form-preventivo');

                        // remove loader
                        withPricelist.pricelist.find(".btnModal").prop('disabled', false);

                        // success message
                        //withPricelist.pricelist.find(".modal-body").html('<h3 class="text-success text-center">' + json.message + '</h3><h1 class="text-center"><i class="glyphicon glyphicon-ok text-success"></i></h1>');

                        withPricelist.clog('5 - Modal Form Submitted');
                    } else {
                        // remove loader
                        withPricelist.pricelist.find(".btnModal").prop('disabled', false);

                        // error message
                        withPricelist.pricelist.find(".btnModal").after('<p class="text-danger text-center">' + json.message + ' <i class="glyphicon glyphicon-remove text-danger"></i></p>');
                    }
                },
                error: function () {
                    // general error message
                    withPricelist.pricelist.find(".btnModal").after('<p class="text-danger text-center">Email error! Errore durante l\'invio, per favore riprova! <i class="glyphicon glyphicon-remove text-danger"></i></p>');
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
                    withPricelist.cartItems[id + '-' + i] = ({
                        id: id,
                        num: i,
                        service_name: service_name,
                        period_total: period_total,
                        readable_period_total: readable_period_total
                    });
                    withPricelist.clog('3.3 - Aggiunto: ' + id + '/' + num + ' name: ' + service_name + ' price: ' + period_total);

                    grand_total = grand_total + period_total;
                    withPricelist.clog('3.4 - Calcolo: ' + period_total + ' +');
                }
            });
            withPricelist.clog(withPricelist.cartItems);

            // grand total show
            $(".pt-grand-total", withPricelist.pricelist).number(grand_total, 2, ',', ' ');
            withPricelist.clog('3.5 - Totale: ' + grand_total);
            // Total to cartData
            withPricelist.cartData.grand_total = grand_total;
            withPricelist.cartData.readable_grand_total = $(".pt-grand-total", withPricelist.pricelist).first().text();

            // update Cart items
            withPricelist.updateCartItems();
        },

        addToCart: function (id) {
            var value = parseInt($(".service" + id + " .pt-num-cell .num", withPricelist.pricelist).val()), quantity;
            value = (isNaN(value)) ? 0 : value;
            quantity = value + 1
            $(".service" + id + " .pt-num-cell .num", withPricelist.pricelist).val(quantity);

            withPricelist.cartTotals();
        },

        removeFromCart: function (index, id) {
            delete withPricelist.cartItems[index];

            var quantity, value = parseInt($(".service" + id + " .pt-num-cell .num", withPricelist.pricelist).val());
            quantity = ((value - 1) <= 0) ? 0 : value - 1;
            $(".service" + id + " .pt-num-cell .num", withPricelist.pricelist).val(quantity);

            withPricelist.cartTotals();
        },

        updateCartItems: function () {
            withPricelist.cartData.cartItems = withPricelist.cartItems;

            // in cart
            var cart_items_tpl = handlebars.compile(cart_items_layout);
            $('.withCart .withCartContent', withPricelist.pricelist).html(cart_items_tpl(withPricelist.cartData));

            // in modal
            var modal_items_tpl = handlebars.compile(modal_items_layout);
            $(".modal", withPricelist.pricelist).find('.modal-list').html(modal_items_tpl(withPricelist.cartData));
        },

        initCart: function () {
            // if (withPricelist.pricelist.find('.withCart').hasClass("cart_enabled")) {
            if (withPricelist.pricelist.hasClass("cart_enabled")) {
                // cart events yet enabled
                withPricelist.clog('3.2 - Cart yet here');

                $('.withCartBox', withPricelist.pricelist).affix({
                    offset: {
                        top: $('.withCart', withPricelist.pricelist).offset().top,
                        bottom: $(document).height() - withPricelist.pricelist.offset().top - withPricelist.pricelist.height()
                    }
                }).css({
                    "width": $('.withCartBox', withPricelist.pricelist).outerWidth() + 'px'
                    //, "left": $('.withCartBox', withPricelist.pricelist).offset().left
                });
            } else {
                // withPricelist.pricelist.find('.withCart').addClass('cart_enabled');
                withPricelist.pricelist.addClass('cart_enabled');
                withPricelist.clog('3.1 - Cart events enabled');

                // Fire the calculation on change of num input
                withPricelist.pricelist.on('change', '.pt-num-cell input.num', function () {
                    withPricelist.cartTotals();
                });

                // attach event on modal open
                // $(".modal", withPricelist.pricelist).on('show.bs.modal', function () {
                //     var modal_items_tpl = handlebars.compile(modal_items_layout);
                //     $(this).find('.modal-list').html(modal_items_tpl(withPricelist.cartData));
                // });

                // attach event on modal form submit
                $(withPricelist.pricelist).on('submit', ".modal-form", function () {
                    withPricelist.submitModal($(this));
                    return false;
                });

                withPricelist.pricelist.on('click', '.add-service', function () {
                    withPricelist.addToCart($(this).attr('data-service-id'));
                });

                $(withPricelist.pricelist).on('click', '.withCartBox .remove', function () {
                    withPricelist.removeFromCart($(this).attr('data-service-index'), $(this).attr('data-service-id'));
                });
            }

            // if isset yet something in input num get the total immediately
            withPricelist.cartTotals();
        },

        initDatepicker: function () {
            if (withPricelist.pricelist.find('.period').hasClass("dp_enabled")) {
                // datapicker yet here
                withPricelist.clog('4.2 - Datapicker yet here');
            } else {
                withPricelist.clog('4.1 - Datapicker init');
                var bs_datepicker = withPricelist.pricelist.find('.period');
                bs_datepicker.addClass('dp_enabled');

                var date = new Date(),
                    start_date = new Date(withPricelist.withAllData.iso_start_date),
                    end_date = new Date(withPricelist.withAllData.iso_end_date),
                    bsdp_lang_code = bs_datepicker.attr('data-lang');

                if (typeof bsdp_lang_code == 'undefined' || bsdp_lang_code.length == 0) {
                    bsdp_lang_code = $("html").attr('lang');
                }
                if (typeof bsdp_lang_code == 'undefined' || bsdp_lang_code.length == 0) {
                    bsdp_lang_code = 'en-GB';
                }

                if (date.getTime() > start_date.getTime()) {
                    start_date = date;
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
                    // GAT - ga('send', 'event', 'preventivo', 'calcola', 'sito-web', '5');
                    withPricelist.clog('4.3 - Datapicker send new request');

                    // update pricelist
                    withPricelist.updatePricelist();

                    // reset cart
                    withPricelist.cartItems = {};
                    withPricelist.updateCartItems();
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
                 * @todo: keep values of yet insterted children ages
                 * @type {any}
                 */
                // $(".children_age_form", withPricelist.pricelist).each(function () {
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
                //             $('body').gdivMessage('No more then 4 childs / Non più di 4 bambini', 'warning', {hidetime: 7000});
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
                //             childClone.find('input').prop("disabled", false).removeProp('disabled').val(parseInt(withPricelist.withData.children_age[_cN - 1]));
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
                //             childClone.find('input').prop("disabled", false).removeProp('disabled').val(parseInt(withPricelist.withData.children_age[_childNum - 1]));
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
            if (withPricelist.lang.length > 0 && withPricelist.lang != 'auto') {
                return withPricelist.lang;
            } else {
                return withPricelist.setLanguage('auto');
            }
        },
    };

    return withPricelist;
});