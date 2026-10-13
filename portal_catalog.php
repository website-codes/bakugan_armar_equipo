<?php
declare(strict_types=1);

header('Content-Type: application/json; charset=utf-8');
header('X-Content-Type-Options: nosniff');

$cacheFile = sys_get_temp_dir() . DIRECTORY_SEPARATOR . 'bakugan-portal-catalog-v3-' . hash('sha256', __DIR__) . '.json';
if (is_file($cacheFile) && filemtime($cacheFile) > time() - 86400) {
    readfile($cacheFile);
    exit;
}

if (!function_exists('curl_init')) {
    http_response_code(500);
    echo json_encode(['error' => 'La extensión cURL de PHP no está habilitada.']);
    exit;
}

function requestPortalWiki(array $parameters): ?array
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

function requestPortalCategoryMembers(string $category): ?array
{
    $members = [];
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
        $response = requestPortalWiki($parameters);
        if (!isset($response['query']['categorymembers'])) {
            return null;
        }
        foreach ($response['query']['categorymembers'] as $member) {
            if (($member['ns'] ?? -1) === 0 && !empty($member['pageid']) && !empty($member['title'])) {
                $members[(int) $member['pageid']] = [
                    'pageId' => (int) $member['pageid'],
                    'name' => (string) $member['title']
                ];
            }
        }
        $continueToken = $response['continue']['cmcontinue'] ?? null;
    } while ($continueToken !== null);

    return $members;
}

$tierCategories = [
    'Copper_Gate_Cards' => 'bronce',
    'Silver_Gate_Cards' => 'plata',
    'Gold_Gate_Cards' => 'oro'
];
$tiersByPageId = [];
$members = [];
$categories = ['Gate_Cards' => null] + $tierCategories;
foreach ($categories as $category => $tier) {
    $categoryMembers = requestPortalCategoryMembers($category);
    if ($categoryMembers === null) {
        http_response_code(502);
        echo json_encode(['error' => 'No se pudo consultar el catálogo de cartas portal.']);
        exit;
    }
    foreach ($categoryMembers as $pageId => $member) {
        $members[$pageId] = $member;
        if ($tier !== null) {
            $tiersByPageId[$pageId] = $tier;
        }
    }
}

$portals = [];
$pageIds = array_keys($members);
foreach (array_chunk($pageIds, 50) as $pageIdBatch) {
    $response = requestPortalWiki([
        'action' => 'query',
        'prop' => 'pageimages|categories',
        'piprop' => 'original',
        'cllimit' => 'max',
        'pageids' => implode('|', $pageIdBatch),
        'format' => 'json'
    ]);
    if (!isset($response['query']['pages'])) {
        http_response_code(502);
        echo json_encode(['error' => 'No se pudieron consultar las imágenes de las cartas portal.']);
        exit;
    }

    foreach ($response['query']['pages'] as $pageId => $page) {
        $pageId = (int) $pageId;
        $image = $page['original']['source'] ?? null;
        if (!is_string($image) || $image === '' || !isset($members[$pageId])) {
            continue;
        }
        $categories = array_column($page['categories'] ?? [], 'title');
        $tier = $tiersByPageId[$pageId] ?? null;
        $series = 'Serie no especificada';
        foreach ($categories as $categoryTitle) {
            if (preg_match('/^Category:Bakugan: (.+?)(?: cards)?$/i', $categoryTitle, $match)) {
                $series = trim($match[1]);
                break;
            }
            if (strcasecmp($categoryTitle, 'Category:Bakugan Battle Brawlers') === 0) {
                $series = 'Battle Brawlers';
                break;
            }
            if (strcasecmp($categoryTitle, 'Category:BakuTech') === 0) {
                $series = 'BakuTech';
                break;
            }
        }

        if ($tier === null) {
            $normalizedSeries = strtolower($series);
            if (str_contains($normalizedSeries, 'battle brawlers') || str_contains($normalizedSeries, 'new vestroia')) {
                $tier = 'bronce';
            } elseif (str_contains($normalizedSeries, 'gundalian') || str_contains($normalizedSeries, 'mechtanium')) {
                $tier = 'plata';
            } elseif (str_contains($normalizedSeries, 'bakutech')) {
                $tier = 'oro';
            } else {
                $tier = 'bronce';
            }
        }

        $tierLabel = ['bronce' => 'Bronce', 'plata' => 'Plata', 'oro' => 'Oro'][$tier];
        $portals[] = [
            'id' => 'portal-wiki-' . $pageId,
            'name' => $members[$pageId]['name'],
            'image' => $image,
            'tier' => $tier,
            'detail' => $tierLabel . ' / ' . $series . ' / Gate Card'
        ];
    }
}

if (!$portals) {
    http_response_code(502);
    echo json_encode(['error' => 'El catálogo no devolvió cartas portal con imágenes.', 'count' => 0]);
    exit;
}

$payload = json_encode([
    'source' => 'https://bakugan.fandom.com/wiki/Category:Gate_Cards',
    'count' => count($portals),
    'items' => $portals
], JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);

if (!is_string($payload)) {
    http_response_code(500);
    echo json_encode(['error' => 'No se pudo preparar el catálogo de cartas portal.']);
    exit;
}

file_put_contents($cacheFile, $payload, LOCK_EX);
echo $payload;