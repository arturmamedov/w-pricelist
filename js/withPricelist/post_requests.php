<?php
$id = $_POST['id'];
$lang = (isset($_POST['lang'])) ? $_POST['lang'] : 'it';

// endpoint for only show table (changed if isset(check_in/out) below)
$endpoint = "pricelist/pricelist/table/{$id}";
$method = 'POST';

// array with params to send
$params = [ 'lang' => $lang ];

if (isset($_POST['check_inout'])) {
    $endpoint = "pricelist/pricelist/table/search/{$id}";
} elseif (isset($_POST['check_in']) && isset($_POST['check_out'])) {
    $endpoint = "pricelist/pricelist/table/search/{$id}";
}

// IF its a form submition
if (isset($_POST['submit'])) {
    $endpoint = "pricelist/pricelist/table/submit/{$id}";
}

require_once 'api.php';
$my_api = new MyApi('Bearer', '***REMOVED***');

$response = $my_api->http($endpoint, $method, $_POST, $params);

if ($response === false) {
    $response = json_encode([ 'success' => false, 'message' => 'API ERROR (C)' ]);
}

header('Content-Type: application/json');
echo $response;