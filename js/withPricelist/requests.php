<?php
$id = rawurlencode($_GET['id']);
$lang = (isset($_GET['lang'])) ? $_GET['lang'] : 'it';
$fallback_lang = (isset($_GET['fallback_lang'])) ? $_GET['fallback_lang'] : 'it';

// # GET #
// endpoint for only show table (changed if isset(check_in/out) below)
$endpoint = "pricelist/pricelist/table/{$id}";
$method = 'GET';

// array with params to send
$params = [
    'lang' => $lang,
    'fallback_lang' => $fallback_lang,
];

// if only_services is passed so add it to GET endpoint, otherwise it yet passed in $_GET array
if (isset($_GET['only_services']) && strlen($_GET['only_services'])) {
    $endpoint .= "?only_services={$_GET['only_services']}";
}

// # POST #
if (isset($_GET['check_inout'])) {
    $endpoint = "pricelist/pricelist/table/search/{$id}";
    $method = 'POST';
} elseif (isset($_GET['check_in']) && isset($_GET['check_out'])) {
    $endpoint = "pricelist/pricelist/table/search/{$id}";
    $method = 'POST';
}

/**
 * Include file with
 * @var $config
 */
require_once 'config.php';
require_once 'api.php';
$my_api = new MyApi('Bearer', $config['access_token']);

$response = $my_api->http($endpoint, $method, $_GET, $params);

if ($response === false) {
    $response = json_encode([ 'success' => false, 'message' => 'API ERROR (C)' ]);
}

header('Content-Type: application/json');
echo $response;