/**
 * PriceList view page scripts
 */
define(['jquery', 'number', 'datepicker'], function ($, number, datepicker) {
    var withPricelist = {
        debug: false,
        lang: 'it',

        clog: function (text) {
            if (withPricelist.debug) {
                console.info(text);
            }
        },

        getPricelist: function (pricelist, withData) {
            pricelist.find(".btnSearch").prop('disabled', true);
            pricelist.find("tbody").addClass('table_loader_center').hide('slow', function () {
                $(this).html('<tr><td colspan="' + pricelist.find('thead  th').length + '"><img src="' + withBaseUrl + 'img/loader.svg" class="loader_table" /></td></tr>').show();
            });

            $.ajax({
                url: requirejs.toUrl('') + 'requests.php',
                method: 'GET',
                dataType: 'json',
                data: withData,
                success: function (json) {
                    // // json = $.parseJSON(json);// return right response and not deal with itman! // //
                    if (json.success) {
                        pricelist.find(".btnSearch").prop('disabled', false);
                        pricelist.find("tbody").removeClass('table_loader_center')
                        if (pricelist.find('table').length) {
                            pricelist.find('table').html(json.html.table);
                        } else {
                            pricelist.html(json.html.table + json.html.datepicker + json.html.description);
                        }
                        withPricelist.clog('1 - Pricelist generated');

                        if (json.opt.opt_pricelist_search) {
                            withPricelist.clog('2 - Pricelist search opt enabled');
                            // if its a search request init Prices
                            if (typeof withData.check_inout != 'undefined' || typeof withData.with_check_in != 'undefined') {
                                withPricelist.clog('3 - Pricelist totals counter');
                                withPricelist.initPricelistTotals();
                            }
                            // show datepicker
                            withPricelist.clog('4 - Pricelist datepicker');
                            withPricelist.datePicker(pricelist);
                        }
                    } else {
                        if (pricelist.find('table').length) {
                            pricelist.find('table').html('<span class="help-block alert alert-danger">' + json.message + '</span>');
                        } else {
                            pricelist.html('<span class="help-block alert alert-danger">' + json.message + '</span>');
                        }
                    }
                },
                error: function () {
                    pricelist.html('<span class="help-block alert alert-danger">Pricelist Error! Errore durante la generazione del listino prezzi :(</span>');
                }
            });
        },

        /*
         * Calculate the totals of pricelist for booking
         */
        pricelistTotals: function (id, num) {
            // get all priods total
            var period_total = parseFloat($(".pt-total-all-periods-" + id).data('amount')),
                grand_total = 0;

            // write the addition of all periods total per num of services
            var apt = num * period_total, services_periods_total = apt || 0;

            $(".pt-grand-total-all-periods-" + id).number(services_periods_total, 2, ',', ' ');

            // sum all totals of periods and services and write the grand total sum
            $(".pt-grand-total-all-periods").each(function () {
                var ap_totals = parseFloat($(this).text().replace(',', '.')); // todo: intarnationalization
                grand_total = grand_total + ap_totals;
            });

            // grand total sum
            $(".pt-grand-total").number(grand_total, 2, ',', ' ');
        },

        initPricelistTotals: function () {
            /*
             * Fire the calculation on change of num input
             */
            $(".withPricelist").on('change', '.pt-num-cell input.num', function () {
                // get num of service
                // get id of service
                var n = parseInt($(this).val()),
                    num = n || 0,
                    id = parseInt($(this).data('id'));

                withPricelist.pricelistTotals(id, num);
            });
            // if isset yet something in input num get the total immediately
            $(".pt-num-cell input.num").each(function () {
                // get num of service
                // get id of service
                var num = parseInt($(this).val()),
                    id = parseInt($(this).data('id'));

                withPricelist.pricelistTotals(id, num);
            });
        },

        datePicker: function (pricelist) {
            if (pricelist.find('.period').hasClass("dp_enabled")) {
                // datapicker yet here
                withPricelist.clog('4.2 - Datapicker yet here');
            } else {
                withPricelist.clog('4.1 - Datapicker init');
                var bs_datepicker = pricelist.find('.period');
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
                        with_slug = pricelist.attr('data-with-slug'),
                        with_id = pricelist.attr('data-with-id'),
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
                    withPricelist.getPricelist(pricelist, withData);
                    return false;
                });

                // datepicker
                /*dtrp = $('.withDatepicker').daterangepicker({
                 autoApply: true
                 });

                 dtrp.on('apply.daterangepicker', function (e, picker) {
                 var withData = {},
                 pricelist_id,
                 with_slug = pricelist.attr('data-with-slug'),
                 with_id = pricelist.attr('data-with-id'),
                 with_lang = $('html').attr('lang');
                 ;

                 // lang of request
                 if (with_lang.length == 0) {
                 with_lang = 'it';
                 }
                 withData.lang = with_lang;

                 // pricelist id
                 if (typeof with_slug == "undefined" || with_slug.length == 0) {
                 pricelist_id = with_id;
                 } else {
                 pricelist_id = with_slug;
                 }
                 withData.id = pricelist_id;

                 withData.check_inout = picker.startDate.format('DD/MM/YYYY') + '-' + picker.endDate.format('DD/MM/YYYY');

                 withPricelist.getPricelist(pricelist, withData);
                 });*/
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