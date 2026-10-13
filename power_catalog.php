<?php
declare(strict_types=1);

header('Content-Type: application/json; charset=utf-8');
header('X-Content-Type-Options: nosniff');

$cacheFile = sys_get_temp_dir() . DIRECTORY_SEPARATOR . 'bakugan-power-catalog-v1-' . hash('sha256', __DIR__) . '.json';
if (is_file($cacheFile) && filemtime($cacheFile) > time() - 86400) {
    readfile($cacheFile);
    exit;
}

if (!function_exists('curl_init')) {
    http_response_code(500);
    echo json_encode(['error' => 'La extensión cURL de PHP no está habilitada.']);
    exit;
}

function requestBakuganWiki(array $parameters): ?array
{
    $url = 'https://bakugan.fandom.com/api.php?' . http_build_query($parameters);
    $curl = curl_init($url);
    curl_setopt_array($curl, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_FOLLOWLOCATION => true,
        CURLOPT_CONNECTTIMEOUT => 10,
        CURLOPT_TIMEOUT => 30,
        CURLOPT_USERAGENT => 'BakuganTeamBuilder/1.0 (catalogue attribution: bakugan.fandom.com)',
        CURLOPT_ENCODING => ''
    ]);
    $body = curl_exec($curl);
    $statusCode = (int) curl_getinfo($curl, CURLINFO_RESPONSE_CODE);
    curl_close($curl);

    if (!is_string($body) || $statusCode < 200 || $statusCode >= 300) {
        return null;
    }
    $data = json_decode($body, true);
    return is_array($data) ? $data : null;
}

$categories = [
    'Red_Ability_Cards' => 'red',
    'Green_Ability_Cards' => 'green'
];
$cardsById = [];

foreach ($categories as $category => $color) {
    $continueToken = null;
    do {
        $parameters = [
            'action' => 'query',
            'list' => 'categorymembers',
            'cmtitle' => 'Category:' . $category,
            'cmnamespace' => 0,
            'cmlimit' => 'max',
            'format' => 'json'
        ];
        if ($continueToken !== null) {
            $parameters['cmcontinue'] = $continueToken;
        }
        $response = requestBakuganWiki($parameters);
        if (!isset($response['query']['categorymembers'])) {
            http_response_code(502);
            echo json_encode(['error' => 'No se pudo consultar el archivo de cartas Bakugan.', 'category' => $category]);
            exit;
        }

        foreach ($response['query']['categorymembers'] as $member) {
            if (($member['ns'] ?? -1) !== 0 || empty($member['pageid']) || empty($member['title'])) {
                continue;
            }
            $pageId = (int) $member['pageid'];
            $cardsById[$pageId] = [
                'pageId' => $pageId,
                'name' => (string) $member['title'],
                'color' => $color
            ];
        }
        $continueToken = $response['continue']['cmcontinue'] ?? null;
    } while ($continueToken !== null);
}

$cards = [];
$pageIds = array_keys($cardsById);
foreach (array_chunk($pageIds, 50) as $pageIdBatch) {
    $response = requestBakuganWiki([
        'action' => 'query',
        'prop' => 'pageimages',
        'piprop' => 'original',
        'pageids' => implode('|', $pageIdBatch),
        'format' => 'json'
    ]);
    if (!isset($response['query']['pages'])) {
        http_response_code(502);
        echo json_encode(['error' => 'No se pudieron consultar las imágenes de las cartas.']);
        exit;
    }

    foreach ($response['query']['pages'] as $pageId => $page) {
        $image = $page['original']['source'] ?? null;
        if (!is_string($image) || $image === '' || !isset($cardsById[(int) $pageId])) {
            continue;
        }
        $card = $cardsById[(int) $pageId];
        $cards[] = [
            'id' => 'power-wiki-' . $card['pageId'],
            'name' => $card['name'],
            'image' => $image,
            'color' => $card['color'],
            'detail' => ($card['color'] === 'red' ? 'Roja' : 'Verde') . ' / Ability Card'
        ];
    }
}

if (count($cards) <= 500) {
    http_response_code(502);
    echo json_encode(['error' => 'El catálogo disponible no devolvió más de 500 cartas con imagen.', 'count' => count($cards)]);
    exit;
}

$payload = json_encode([
    'source' => 'https://bakugan.fandom.com/wiki/Bakugan_Wiki:Bakugan_Card_Archive',
    'count' => count($cards),
    'items' => $cards
], JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);

if (!is_string($payload)) {
    http_response_code(500);
    echo json_encode(['error' => 'No se pudo preparar el catálogo de cartas.']);
    exit;
}

file_put_contents($cacheFile, $payload, LOCK_EX);
echo $payload;