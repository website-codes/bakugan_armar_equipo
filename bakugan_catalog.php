<?php
declare(strict_types=1);

header('Content-Type: application/json; charset=utf-8');
header('X-Content-Type-Options: nosniff');

$cacheFile = sys_get_temp_dir() . DIRECTORY_SEPARATOR . 'bakugan-catalog-v7-' . hash('sha256', __DIR__) . '.json';

if (is_file($cacheFile) && filemtime($cacheFile) > time() - 86400) {
    readfile($cacheFile);
    exit;
}

if (!function_exists('curl_init')) {
    http_response_code(500);
    echo json_encode(['error' => 'La extensión cURL de PHP no está habilitada.']);
    exit;
}

$eras = [
    'Battle Brawlers' => 'battle-brawlers',
    'Battle Planet' => 'battle-planet',
    'New Vestroia' => 'new-vestroia',
    'Armored Alliance' => 'armored-alliance',
    'Gundalian Invaders' => 'gundalian-invaders',
    'Geogan Rising' => 'geogan-rising',
    'Mechtanium Surge' => 'mechtanium-surge',
    'Evolutions' => 'evolutions',
    'BakuTech' => 'bakutech',
    'Legends' => 'legends'
];
$items = [];
$seenNames = [];
$attributeNames = ['pyrus', 'aquos', 'darkus', 'haos', 'ventus', 'subterra', 'aurelus'];

foreach ($eras as $eraName => $slug) {
    $curl = curl_init('https://bakugandb.com/' . $slug);
    curl_setopt_array($curl, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_FOLLOWLOCATION => true,
        CURLOPT_CONNECTTIMEOUT => 10,
        CURLOPT_TIMEOUT => 25,
        CURLOPT_USERAGENT => 'BakuganTeamBuilder/1.0 (catalogue attribution: bakugandb.com)',
        CURLOPT_ENCODING => ''
    ]);
    $html = curl_exec($curl);
    $statusCode = (int) curl_getinfo($curl, CURLINFO_RESPONSE_CODE);
    $curlError = curl_error($curl);
    curl_close($curl);

    if (!is_string($html) || $statusCode < 200 || $statusCode >= 300) {
        http_response_code(502);
        echo json_encode(['error' => 'No se pudo consultar el catálogo de BakuganDB.', 'era' => $eraName, 'detail' => $curlError]);
        exit;
    }

    $document = new DOMDocument();
    $previousErrorMode = libxml_use_internal_errors(true);
    $loaded = $document->loadHTML($html);
    libxml_clear_errors();
    libxml_use_internal_errors($previousErrorMode);
    if (!$loaded) {
        continue;
    }

    $xpath = new DOMXPath($document);
    $containers = $xpath->query('//*[contains(concat(" ", normalize-space(@class), " "), " outer-container ")]');
    if ($containers === false) {
        continue;
    }

    foreach ($containers as $container) {
        $images = $xpath->query('.//img[@alt and @src]', $container);
        if ($images === false || $images->length === 0) {
            continue;
        }

        $imageNode = $images->item(0);
        $rawName = trim($imageNode->getAttribute('alt'));
        $name = preg_replace('/^\d+\s*[-.]\s*/u', '', $rawName);
        $image = trim($imageNode->getAttribute('src'));
        if (!is_string($name) || $name === '' || $image === '') {
            continue;
        }
        $normalizedName = strtolower(trim($name));
        if (!preg_match('~^https?://~i', $image)) {
            $image = 'https://bakugandb.com/' . ltrim($image, '/');
        }

        $summaries = $xpath->query('.//summary', $container);
        $variants = [];
        $attributes = [];
        $attributeImages = [];
        if ($summaries !== false) {
            foreach ($summaries as $summary) {
                $variant = trim(preg_replace('/\s+/u', ' ', $summary->textContent));
                if ($variant !== '') {
                    $variants[] = $variant;
                }
            }
        }

        $tables = $xpath->query('.//table', $container);
        if ($tables !== false) {
            foreach ($tables as $table) {
                $headerRow = $xpath->query('.//thead/tr[1]', $table)->item(0);
                if (!$headerRow) {
                    continue;
                }
                $headers = [];
                foreach ($headerRow->childNodes as $headerCell) {
                    if (!($headerCell instanceof DOMElement) || !in_array(strtolower($headerCell->tagName), ['th', 'td'], true)) {
                        continue;
                    }
                    $headerImage = $xpath->query('.//img', $headerCell)->item(0);
                    $headerName = $headerImage ? trim($headerImage->getAttribute('src')) : trim($headerCell->textContent);
                    if ($headerImage && preg_match('~/([^/]+?)(?:G2)?\.png(?:\?.*)?$~i', $headerName, $match)) {
                        $headerName = $match[1];
                    } elseif ($headerImage) {
                        $headerName = trim($headerImage->getAttribute('alt'));
                    }
                    $headers[] = strtolower($headerName);
                }

                $rows = $xpath->query('.//tbody/tr', $table);
                if ($rows === false) {
                    continue;
                }
                foreach ($rows as $row) {
                    $cells = [];
                    foreach ($row->childNodes as $cell) {
                        if ($cell instanceof DOMElement && in_array(strtolower($cell->tagName), ['th', 'td'], true)) {
                            $cells[] = $cell;
                        }
                    }
                    foreach ($cells as $index => $cell) {
                        $attribute = $headers[$index] ?? '';
                        if (!in_array($attribute, $attributeNames, true)) {
                            continue;
                        }
                        $cellImage = $xpath->query('.//img[@alt]', $cell)->item(0);
                        if (!$cellImage) {
                            continue;
                        }
                        $availability = strtolower(trim($cellImage->getAttribute('alt')));
                        if ($availability === '' || str_contains($availability, 'n/a') || str_contains($availability, 'null')) {
                            continue;
                        }
                        $attributes[$attribute] = true;
                        $imageLinks = $xpath->query('.//a[@data-image-src]', $cell);
                        if (!isset($attributeImages[$attribute]) && $imageLinks !== false && $imageLinks->length > 0) {
                            $variantImage = trim($imageLinks->item(0)->getAttribute('data-image-src'));
                            if ($variantImage !== '') {
                                $attributeImages[$attribute] = preg_match('~^https?://~i', $variantImage)
                                    ? $variantImage
                                    : 'https://bakugandb.com/' . ltrim($variantImage, '/');
                            }
                        }
                    }
                }
            }
        }

        $attributeList = array_values(array_filter($attributeNames, static fn(string $attribute): bool => isset($attributes[$attribute])));
        if (!$attributeList) {
            continue;
        }
        $detail = $eraName . ($variants ? ' / ' . implode(' · ', array_slice($variants, 0, 3)) : '');
        if (isset($seenNames[$normalizedName])) {
            $existingIndex = $seenNames[$normalizedName];
            $items[$existingIndex]['attributes'] = array_values(array_unique(array_merge($items[$existingIndex]['attributes'], $attributeList)));
            $items[$existingIndex]['attributeImages'] += $attributeImages;
            if (!str_contains($items[$existingIndex]['detail'], $detail)) {
                $items[$existingIndex]['detail'] .= ' · ' . $detail;
            }
            continue;
        }

        $items[] = [
            'id' => 'bakugan-' . $slug . '-' . str_pad((string) count($items), 3, '0', STR_PAD_LEFT) . '-' . substr(hash('sha256', $rawName . $image), 0, 8),
            'name' => $name,
            'image' => $image,
            'detail' => $detail,
            'attributes' => $attributeList,
            'attributeImages' => $attributeImages
        ];
        $seenNames[$normalizedName] = count($items) - 1;

    }
}

$payload = json_encode([
    'source' => 'https://bakugandb.com/bakudex',
    'count' => count($items),
    'items' => $items
], JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);

if (!is_string($payload)) {
    http_response_code(500);
    echo json_encode(['error' => 'No se pudo preparar el catálogo.']);
    exit;
}

file_put_contents($cacheFile, $payload, LOCK_EX);
echo $payload;