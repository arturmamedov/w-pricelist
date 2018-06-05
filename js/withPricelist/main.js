requirejs.config({
    paths: {
        bootstrap: 'bower_components/bootstrap/dist/js/bootstrap',
        jquery: 'bower_components/jquery/dist/jquery.min',
        number: 'bower_components/jquery-number/jquery.number.min',
        datepicker: 'bower_components/bootstrap-datepicker/dist/js/bootstrap-datepicker.min',
        handlebars: 'bower_components/handlebars/handlebars.amd',
        text: 'bower_components/text/text',
    },
    "shim": {
        "bootstrap": {exports: 'bootstrap', deps: ['jquery']},
        "datepicker": {exports: 'datepicker', deps: ['jquery', 'bootstrap']},
        "number": {exports: 'number', deps: ['jquery']}
    }
});
var withBaseUrl = requirejs.toUrl(''),
    requirecss = [
        withBaseUrl + 'bower_components/bootstrap/dist/css/bootstrap.min.css', // @todo: split into dependencies that are used here
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

        for (var css in requirecss) {
            loadCss(requirecss[css]);
        }

        // all the pricelist on page
        $pricelists = $('.withPricelist');
        $pricelists.html('<img src="' + withBaseUrl + 'img/loader.svg" class="loader" />');

        var p = 1, _wp = [];
        $pricelists.each(function () {
            var pricelist = $(this);
            _wp[p] = new withPricelist(pricelist);
            // @todo: callbacks
            _wp[p].initPricelist();
            p++;
        });
    }
);