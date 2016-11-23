<?php

$id = $_GET['id'];
$lang = (isset($_GET['lang'])) ? $_GET['lang'] : 'it';

$endpoint = "pricelist/pricelist/table/{$id}";

require_once 'api.php';
$my_api = new MyApi('Bearer', 'c31aa911-2919-4a7e-ba54-....');

$response = $my_api->http($endpoint, 'GET', null, [ 'lang' => $lang ]);

if ($response === false) {
    $profile = [ 'status' => false, 'error' => 'CURL_ERR' ];
    exit(print_r($profile));
} else {
    //$profile = json_decode($response);
    echo $response;
}
//$json_response = $profile;
//echo $json_response;