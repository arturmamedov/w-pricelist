<?php
$id = $_GET['id'];
$lang = (isset($_GET['lang'])) ? $_GET['lang'] : 'it';

// endpoint for only show table (changed if isset(check_in/out) below)
$endpoint = "pricelist/pricelist/table/{$id}";
$method = 'GET';

// array with params to send
$params = [ 'lang' => $lang ];

if (isset($_GET['check_inout'])) {
    $check_inout = $_GET['check_inout'];
    $params['check_inout'] = $check_inout;

    $endpoint = "pricelist/pricelist/table/search/{$id}";
    $method = 'POST';
} elseif (isset($_GET['check_in']) && isset($_GET['check_out'])) {
    $check_in = $_GET['check_in'];
    $check_out = $_GET['check_out'];

    $params['check_in'] = $check_in;
    $params['check_out'] = $check_out;

    $endpoint = "pricelist/pricelist/table/search/{$id}";
    $method = 'POST';
}

require_once 'api.php';
$my_api = new MyApi('Bearer', '03b24089-YOUR-API-KEY-0137ab01b71b');

$response = $my_api->http($endpoint, $method, $params, $params);

if ($response === false) {
    $response = json_encode([ 'success' => false, 'message' => 'API ERROR (C)' ]);
}

header('Content-Type: application/json');
echo $response;