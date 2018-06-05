({
    baseUrl: 'js/withPricelist',
    mainConfigFile: 'js/withPricelist/main.js',
    name: 'main',
    out: 'js/withPricelist/withPricelist.min.js',
    preserveLicenseComments: false
    // @todo: if i want include require to the miniefied script i must replace requirejs.toUrl("") function with a baseUrl var_
    // paths: {
    //     requireLib: 'bower_components/requirejs/require'
    // }
    // include: 'requireLib'
})