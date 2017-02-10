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

## Methods

##### initPricelist()
Initialize the pricelist and show it the first time to page.
Bind to `pricelist` property the container object.

##### ~~getPricelist()~~
~~Ajax call trough `request.php` to the API end point for get the pricelist json data~~

##### updatePricelist()
Update pricelist content, called on change of the params of search ex: periods in picker

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

## Events

