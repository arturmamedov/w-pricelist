<?php

$id = $_GET['id'];
$lang = (isset($_GET['lang'])) ? $_GET['lang'] : 'it';

$endpoint = "pricelist/pricelist/table/{$id}";

require_once 'api.php';
$my_api = new MyApi('Bearer', '***REMOVED***');

$response = $my_api->http($endpoint, 'GET', null, [ 'lang' => $lang ]);

if ($response === false) {
    $response = json_encode([ 'success' => false, 'message' => 'API ERROR (C)' ]);
}

header('Content-Type: application/json');
echo $response;