$(document).ready(function () {
    $pricelist = $('.withPricelist');

    $pricelist.each(function () {
        var $elem = $(this),
            pricelist,
            pricelist_id,
            with_slug = $elem.attr('data-with-slug'),
            with_id = $elem.attr('data-with-id'),
            with_lang = $('html').attr('lang');

        if (with_lang.length == 0) {
            with_lang = 'it';
        }
        if (with_slug.length == 0) {
            pricelist_id = with_id;
            pricelist = $(".withPricelist[data-with-id=" + with_id + "]");
        } else {
            pricelist_id = with_slug;
            pricelist = $(".withPricelist[data-with-slug=" + with_slug + "]");
        }

        $.ajax({
            url: '/js/withPricelist/requests.php',
            method: 'GET',
            dataType: 'json',
            data: {id: pricelist_id, lang: with_lang},
            success: function (json) {
                // // json = $.parseJSON(json);// return right response and not deal with itman! // //
                if (json.success) {
                    pricelist.html(json.html);
                } else {
                    pricelist.html('<span class="help-block alert alert-danger">' + json.message + '</span>');
                }
            },
            error: function () {
                pricelist.html('<span class="help-block alert alert-danger">Pricelist Error! Errore durante la generazione del listino prezzi :(</span>');
            }
        });
    });
});