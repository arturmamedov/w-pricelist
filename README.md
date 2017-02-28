# #withPricelist JS API
 
Javascript module for work with Pricelists API
 
http://pricelist.buonsito.net/ 

__Author:__ Artur Mamedov <arturmamedov1993@gmail.com>


### Installation

1 - Include this js snippet on your page
 ```
 <script src="js/withPricelist/bower_components/requirejs/require.js" 
 data-main="/js/withPricelist/main.js"></script>
 ```
 `src` is the main require.js file, change folder to your
 
 `data-main` is the location of main.js script that init the modules


### Usage
Before you start you need to create a pricelist and generate an access token on http://pricelist.buonsito.net/

And after you can include this simple div on your page, where you want to show the pricelist
```html
<!-- selecting with 'slug' param -->
<div class="withPricelist" data-with-slug="your-pricelist"></div>

<!-- or selecting by 'id' -->
<div class="withPricelist" data-with-id="1"></div>

<!-- you can to show pricelist on specific dates by adding data-checkinout -->
<!-- ex: data-checkinout="01/08/2017 - 21/08/2017" -->
<div class="withPricelist" 
     data-with-slug="your-pricelist" 
     data-checkinout="01/08/2017 - 21/08/2017"></div>
     
```

Thats all! Enjoy :)

## Properties
```$xslt
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
```

## Methods

##### initPricelist()
Initialize Pricelist and do the first Ajax call trough `request.php` to the API end point for get the pricelist json data and show it the first time to page. 
Bind to `pricelist` property the container object.

##### setPageData()
set the data attributes that are on the `div.withPricelist`
```
* Mandatory one of this, `slug` or `id` of pricelist
data-with-slug="slug of pricelist"
data-with-id="id of pricelist"
* Optional
data-checkinout="dd/mm/yyyy - dd/mm/yyyy"
or
data-checkin="dd/mm/yyyy"
data-checkout="dd/mm/yyyy"

data-with-adults="2" // adults num
data-with-children="3" // children num
data-with-children-age="3, 5, 12" // children age in string format separated with `,` comma
```

##### setFormData()
Set the data that are passed on form `.period`
```
check_in/check_out or check_inout = "dd/mm/yyyy formatted dates"
adults = integer num of adults
children = integer num of children
children_age[] = array inputs with children age for any of the inputs
```


##### ~~getPricelist()~~
~~Ajax call trough `request.php` to the API end point for get the pricelist json data~~

##### updatePricelist()
Update pricelist content, called on change of the params of search ex: periods in picker

##### renderPricelist()
Render the templates of pricelist all merged into `master.layout` and merge form, page, and result json data into `withAllData` object. 

##### initDatepicker()
Initialize the datepicker if pricelist have a enabled search in settings 

##### initCart()
Init cart for view the details of choice, if search enabled in settings of pricelist
 
##### cartTotals()
Pass trough all selected pricelist service and sum for get the total amount in cart

##### addToCart() / removeFromCart()
Add and remove item from cart

##### submitModal()
Submit the modal form with email, name, message, check_in/out, params of search and the choice services in cart

##### setLanguage() / getLanguage()
Setter and getter for pricelist language, the get method will call setLanguage() if no language set. Language are kept from pricelist js settings passed on init, or from html lang attribute.

##### clog()
Debug method that show progress of app execution, if debug enabled, you can place it for debug or use console.info() directly.

## Events


## Custom Datepicker

For add custom datepicker and form inputs

In first place in `withPricelist.js` add or uncomment the dependencie for `'text!templates/datepicker.html'` and add it to passed to module by requirejs  dependency how `datepicker_layout` (remember the right order)

After in `renderPricelist()` add or uncomment the datepicker partials defdinition:

```$php
// custom datepicker - if search datepicker enabled add the needed partials templates to master
if (data.opt.opt_pricelist_search) {
    var datepicker_tpl = handlebars.compile(datepicker_layout);
    handlebars.registerPartial('withDatepicker', datepicker_tpl);
}
```

For last edit the `master.layout` and instead of integrated `{{{ html.datepicker }}}` insert the partials `{{> withDatepicker }}`

After if you wont to add other datepicker then the uxsolution/bootstrap-datepicker use the requirejs shim config, and work on initDatepicker() method.