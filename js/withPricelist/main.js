requirejs.config({
    paths: {
        jquery: 'bower_components/jquery/dist/jquery.min',
        number: 'bower_components/jquery-number/jquery.number.min',
        datepicker: 'bower_components/bootstrap-datepicker/dist/js/bootstrap-datepicker.min'
    }
});
var withBaseUrl = requirejs.toUrl(''),
    requirecss = [
        withBaseUrl + 'bower_components/bootstrap/dist/css/bootstrap.min.css',
        withBaseUrl + 'bower_components/bootstrap-datepicker/dist/css/bootstrap-datepicker3.min.css',
        withBaseUrl + 'css/main.css'
    ];
requirejs(['withPricelist'],
    function (withPricelist) {
        /**
         * Helper for load css and append it to <head>
         * @param srting url
         */
        function loadCss(url) {
            var link = document.createElement("link");
            link.type = "text/css";
            link.rel = "stylesheet";
            link.href = url;
            document.getElementsByTagName("head")[0].appendChild(link);
        }

        for (css in requirecss) {
            loadCss(requirecss[css]);
        }


        // all the pricelist on page
        $pricelists = $('.withPricelist');

        $pricelists.each(function () {
            $pricelists.html('<img src="' + withBaseUrl + 'img/loader.svg" class="loader" />')

            var $elem = $(this),
                withData = {},
                pricelist,
                pricelist_id,
                with_slug = $elem.attr('data-with-slug'),
                with_id = $elem.attr('data-with-id'),
                with_checkinout = $elem.attr('data-checkinout'),
                with_check_in = $elem.attr('data-checkin'),
                with_check_out = $elem.attr('data-checkout');

            // lang of request
            withData.lang = withPricelist.getLanguage();

            // pricelist id
            if (typeof with_slug == "undefined" || with_slug.length == 0) {
                pricelist_id = with_id;
                pricelist = $elem; //$(".withPricelist[data-with-id=" + with_id + "]");
            } else {
                pricelist_id = with_slug;
                pricelist = $elem; //$(".withPricelist[data-with-slug=" + with_slug + "]");
            }
            withData.id = pricelist_id;

            // if isset check_in/out
            if (typeof with_check_in != 'undefined' && with_check_in.length > 0 && typeof with_check_out != 'undefined' && with_check_out.length > 0) {
                withData.check_in = with_check_in;
                withData.check_out = with_check_out;
            }
            else if (typeof with_checkinout != 'undefined' && with_checkinout.length > 0) {
                withData.check_inout = with_checkinout;
            }

            withPricelist.getPricelist(pricelist, withData);
        });
    }
);