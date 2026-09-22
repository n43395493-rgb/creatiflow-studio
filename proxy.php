<?php
/**
 * SuDownloader - Suno AI Direct Song Extractor & Audio Proxy
 * Fetches authentic metadata, real song title, real creator name, lyrics, direct audio,
 * FLAC & 24-bit WAV encoding, Multi-link batching, and Suno Workspace & Library Explorer.
 */

// Disable output buffering for real-time streaming
while (ob_get_level()) {
    ob_end_clean();
}

// Enable CORS
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, HEAD, OPTIONS");
header("Access-Control-Allow-Headers: Range, Content-Type, Authorization, X-Requested-With");
header("Access-Control-Expose-Headers: Content-Length, Content-Range, Accept-Ranges");

if (($_SERVER['REQUEST_METHOD'] ?? '') === 'OPTIONS') {
    http_response_code(200);
    exit;
}

if (isset($_GET['ping'])) {
    header("Content-Type: application/json");
    echo json_encode(["status" => "ok", "message" => "PHP Proxy Active"]);
    exit;
}

$action = $_GET['action'] ?? ($_POST['action'] ?? '');
$url = $_GET['url'] ?? ($_POST['url'] ?? '');
$id = $_GET['id'] ?? ($_POST['id'] ?? '');

// --- HELPER: Extract & Resolve Suno UUID ---
function resolveSunoId($input) {
    if (empty($input)) return '';
    $input = trim($input);

    // 1. Direct UUID
    if (preg_match('/([a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12})/i', $input, $m)) {
        return strtolower($m[1]);
    }

    // 2. Short Share Link (/s/[code])
    if (preg_match('/\/s\/([a-zA-Z0-9_-]{4,50})/i', $input, $sm)) {
        $shareCode = $sm[1];
        $chResolve = curl_init("https://suno.com/s/{$shareCode}");
        curl_setopt($chResolve, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($chResolve, CURLOPT_FOLLOWLOCATION, true);
        curl_setopt($chResolve, CURLOPT_MAXREDIRS, 5);
        curl_setopt($chResolve, CURLOPT_USERAGENT, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36');
        curl_setopt($chResolve, CURLOPT_TIMEOUT, 6);
        curl_setopt($chResolve, CURLOPT_SSL_VERIFYPEER, false);
        $resolvedHtml = curl_exec($chResolve);
        $finalUrl = curl_getinfo($chResolve, CURLINFO_EFFECTIVE_URL);
        curl_close($chResolve);

        if ($finalUrl && preg_match('/([a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12})/i', $finalUrl, $um)) {
            return strtolower($um[1]);
        } elseif ($resolvedHtml && preg_match('/([a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12})/i', $resolvedHtml, $um)) {
            return strtolower($um[1]);
        }
    }

    return '';
}

if (empty($id) && !empty($url)) {
    $id = resolveSunoId($url);
}

// --- HELPER: Fetch Authentic Metadata for Single Clip ---
function fetchSunoMetadataById($clipId) {
    if (empty($clipId)) return null;

    $songData = [
        'id' => $clipId,
        'title' => '',
        'artist' => 'Suno Artist',
        'displayName' => 'Suno Artist',
        'display_name' => 'Suno Artist',
        'handle' => '',
        'imageUrl' => "https://cdn2.suno.ai/image_large_{$clipId}.jpeg",
        'imageLargeUrl' => "https://cdn2.suno.ai/image_large_{$clipId}.jpeg",
        'audioUrl' => "https://d2lwuy8qc234o3.cloudfront.net/1/clip/{$clipId}.m4a",
        'audioCandidates' => [
            "https://d2lwuy8qc234o3.cloudfront.net/1/clip/{$clipId}.m4a",
            "https://d2lwuy8qc234o3.cloudfront.net/0/clip/{$clipId}.m4a",
            "https://cdn1.suno.ai/{$clipId}.mp3",
            "https://cdn2.suno.ai/{$clipId}.mp3",
            "https://audiopipe.suno.ai/?item_id={$clipId}"
        ],
        'videoUrl' => "https://cdn1.suno.ai/{$clipId}.mp4",
        'lyrics' => '',
        'tags' => 'AI Music',
        'model' => 'v5.5',
        'duration' => 180,
        'createdAt' => date('c')
    ];

    // Priority 1: Query Suno Studio API directly
    $chApi = curl_init("https://studio-api.prod.suno.com/api/clip/{$clipId}");
    curl_setopt($chApi, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($chApi, CURLOPT_TIMEOUT, 6);
    curl_setopt($chApi, CURLOPT_SSL_VERIFYPEER, false);
    curl_setopt($chApi, CURLOPT_USERAGENT, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36');
    $apiJson = curl_exec($chApi);
    $apiHttpCode = curl_getinfo($chApi, CURLINFO_HTTP_CODE);
    curl_close($chApi);

    if ($apiJson && $apiHttpCode === 200) {
        $clip = json_decode($apiJson, true);
        if (!empty($clip['title'])) {
            $songData['title'] = $clip['title'];
            $artistName = !empty($clip['display_name']) ? $clip['display_name'] :
                (!empty($clip['displayName']) ? $clip['displayName'] :
                (!empty($clip['artist']) ? $clip['artist'] :
                (!empty($clip['user_display_name']) ? $clip['user_display_name'] :
                (!empty($clip['user']['display_name']) ? $clip['user']['display_name'] :
                (!empty($clip['user']['handle']) ? ('@' . ltrim($clip['user']['handle'], '@')) :
                (!empty($clip['handle']) ? ('@' . ltrim($clip['handle'], '@')) :
                (!empty($clip['metadata']['display_name']) ? $clip['metadata']['display_name'] : '')))))));

            if (!empty($artistName)) {
                $songData['artist'] = $artistName;
                $songData['displayName'] = $artistName;
                $songData['display_name'] = $artistName;
            }
            if (!empty($clip['handle'])) {
                $songData['handle'] = $clip['handle'];
            } elseif (!empty($clip['user']['handle'])) {
                $songData['handle'] = $clip['user']['handle'];
            }
            if (!empty($clip['image_large_url'])) {
                $songData['imageUrl'] = $clip['image_large_url'];
                $songData['imageLargeUrl'] = $clip['image_large_url'];
            } elseif (!empty($clip['image_url'])) {
                $songData['imageUrl'] = $clip['image_url'];
                $songData['imageLargeUrl'] = $clip['image_url'];
            }
            if (!empty($clip['media_urls']) && is_array($clip['media_urls'])) {
                foreach ($clip['media_urls'] as $m) {
                    if (!empty($m['url'])) {
                        array_unshift($songData['audioCandidates'], $m['url']);
                    }
                }
                $songData['audioCandidates'] = array_values(array_unique($songData['audioCandidates']));
            }
            if (!empty($clip['metadata']['prompt'])) {
                $songData['lyrics'] = $clip['metadata']['prompt'];
            }
            if (!empty($clip['metadata']['tags'])) {
                $songData['tags'] = $clip['metadata']['tags'];
            } elseif (!empty($clip['display_tags'])) {
                $songData['tags'] = $clip['display_tags'];
            }
            if (!empty($clip['metadata']['duration'])) {
                $songData['duration'] = floatval($clip['metadata']['duration']);
            }
            if (!empty($clip['major_model_version'])) {
                $songData['model'] = $clip['major_model_version'];
            }
            if (!empty($clip['created_at'])) {
                $songData['createdAt'] = $clip['created_at'];
            }
        }
    }

    // Priority 2: HTML Page Scraper Fallback
    if (empty($songData['title'])) {
        $targetSongUrl = "https://suno.com/song/{$clipId}";
        $ch = curl_init($targetSongUrl);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
        curl_setopt($ch, CURLOPT_MAXREDIRS, 5);
        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
        curl_setopt($ch, CURLOPT_TIMEOUT, 8);
        curl_setopt($ch, CURLOPT_USERAGENT, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36');
        $html = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);

        if ($html && $httpCode === 200) {
            if (preg_match('/<meta[^>]*name=["\']description["\'][^>]*content=["\']([^"\']+)["\']/i', $html, $m)) {
                $desc = html_entity_decode($m[1], ENT_QUOTES | ENT_HTML5);
                if (preg_match('/^(.*?)\s+by\s+(.*?)\s+\(@([^)]+)\)/i', $desc, $dm)) {
                    $songData['title'] = trim($dm[1]);
                    $songData['artist'] = trim($dm[2]);
                    $songData['displayName'] = trim($dm[2]);
                    $songData['display_name'] = trim($dm[2]);
                    $songData['handle'] = trim($dm[3]);
                }
            }
            if (empty($songData['title']) && preg_match('/<title>([^<]+)<\/title>/i', $html, $m)) {
                $rawTitle = html_entity_decode($m[1], ENT_QUOTES | ENT_HTML5);
                if (preg_match('/^(.*?)\s+by\s+(.*?)\s*\|\s*Suno/i', $rawTitle, $tm)) {
                    $songData['title'] = trim($tm[1]);
                    $songData['artist'] = trim($tm[2]);
                    $songData['displayName'] = trim($tm[2]);
                    $songData['display_name'] = trim($tm[2]);
                }
            }
            if (preg_match('/<meta[^>]*property=["\']og:image["\'][^>]*content=["\']([^"\']+)["\']/i', $html, $m)) {
                $songData['imageUrl'] = $m[1];
                $songData['imageLargeUrl'] = $m[1];
            }
            if (preg_match('/\\"prompt\\":\\"([^\\"]+)\\"/', $html, $m)) {
                $rawL = str_replace(['\\r\\n', '\\r', '\\n'], "\n", $m[1]);
                $songData['lyrics'] = trim(str_replace('\\"', '"', $rawL));
            }
            if (preg_match('/\\"display_tags\\":\\"([^\\"]+)\\"/', $html, $m) || preg_match('/\\"tags\\":\\"([^\\"]+)\\"/', $html, $m)) {
                $songData['tags'] = $m[1];
            }
            if (preg_match('/\\"duration\\":([0-9.]+)/', $html, $m)) {
                $songData['duration'] = floatval($m[1]);
            }
            if (preg_match('/\\"major_model_version\\":\\"([^\\"]+)\\"/', $html, $m)) {
                $songData['model'] = $m[1];
            }
        }
    }

    if (empty($songData['title'])) {
        return null;
    }

    if (empty($songData['lyrics'])) {
        $songData['lyrics'] = "[Instrumental / Lirik Khusus]\n(Lagu ini adalah instrumental atau lirik dibuat khusus tanpa teks vokal publik.)";
    }

    return $songData;
}

// --- ACTION: Fetch Single Song Metadata ---
if ($action === 'suno' || !empty($_GET['fetch_song'])) {
    if (empty($id)) {
        http_response_code(404);
        header("Content-Type: application/json; charset=utf-8");
        echo json_encode([
            "error" => "Tautan Share Tidak Ditemukan",
            "message" => "Tautan share Suno (/s/...) ini tidak valid atau diarahkan ke halaman beranda. Coba gunakan format link lagu: https://suno.com/song/[ID-lagu]."
        ], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
        exit;
    }

    $songData = fetchSunoMetadataById($id);
    if (!$songData) {
        http_response_code(404);
        header("Content-Type: application/json; charset=utf-8");
        echo json_encode([
            "error" => "Lagu Tidak Ditemukan",
            "message" => "Lagu dengan ID {$id} tidak ditemukan di server Suno AI. Pastikan lagu berstatus publik dan link yang dimasukkan benar."
        ], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
        exit;
    }

    header("Content-Type: application/json; charset=utf-8");
    echo json_encode($songData, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
    exit;
}

// --- ACTION: Batch Song Info Extractor ---
if ($action === 'batch_info') {
    $rawInputs = [];
    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        $jsonInput = file_get_contents('php://input');
        $parsed = json_decode($jsonInput, true);
        if (is_array($parsed) && !empty($parsed['urls'])) {
            $rawInputs = $parsed['urls'];
        } elseif (is_array($parsed) && !empty($parsed['items'])) {
            $rawInputs = $parsed['items'];
        } elseif (!empty($_POST['urls'])) {
            $rawInputs = is_array($_POST['urls']) ? $_POST['urls'] : explode("\n", $_POST['urls']);
        }
    } elseif (!empty($_GET['urls'])) {
        $rawInputs = explode(',', $_GET['urls']);
    }

    $results = [];
    foreach ($rawInputs as $entry) {
        $entry = trim($entry);
        if (empty($entry)) continue;
        $clipId = resolveSunoId($entry);
        if (!$clipId) {
            $results[] = [
                'input' => $entry,
                'error' => 'Format URL atau ID Suno tidak valid'
            ];
            continue;
        }

        $meta = fetchSunoMetadataById($clipId);
        if ($meta) {
            $results[] = [
                'input' => $entry,
                'id' => $clipId,
                'data' => $meta
            ];
        } else {
            $results[] = [
                'input' => $entry,
                'id' => $clipId,
                'error' => 'Lagu tidak ditemukan atau bersifat privat'
            ];
        }
    }

    header("Content-Type: application/json; charset=utf-8");
    echo json_encode([
        'total' => count($results),
        'items' => $results
    ], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

// --- HELPER: Parse Any Cookie Format (JSON array, Key-Value JSON, Netscape, Header string, Raw Bearer) ---
function parseRawCookieInput($input) {
    $input = trim($input);
    if (empty($input)) return ['cookie' => '', 'token' => '', 'pairs' => []];

    $cookiePairs = [];
    $token = '';

    // Check if input is a raw Bearer token or JWT
    if (preg_match('/^(?:Bearer\s+)?(eyJ[a-zA-Z0-9_\-\.]+)$/i', $input, $m)) {
        $token = $m[1];
        $cookiePairs['__session'] = $token;
    }
    // Check if user pasted JSON (from Cookie-Editor, EditThisCookie, etc.)
    elseif (str_starts_with($input, '[') || str_starts_with($input, '{')) {
        $json = json_decode($input, true);
        if (is_array($json)) {
            if (isset($json[0]) && is_array($json[0])) {
                foreach ($json as $c) {
                    if (!empty($c['name']) && isset($c['value'])) {
                        $name = trim($c['name']);
                        $val = trim($c['value']);
                        $cookiePairs[$name] = $val;
                        // ONLY '__session' or 'session_token' is a valid user JWT, NEVER '__client'!
                        if (in_array($name, ['__session', 'session_token', 'session']) && str_starts_with($val, 'eyJ')) {
                            $token = $val;
                        }
                    }
                }
            } else {
                foreach ($json as $k => $v) {
                    if (is_string($v)) {
                        $cookiePairs[$k] = $v;
                        if (in_array($k, ['__session', 'session_token', 'session']) && str_starts_with($v, 'eyJ')) {
                            $token = $v;
                        }
                    }
                }
            }
        }
    }
    // Netscape format (tab-separated)
    elseif (strpos($input, "\t") !== false) {
        $lines = explode("\n", $input);
        foreach ($lines as $line) {
            $line = trim($line);
            if (empty($line) || str_starts_with($line, '#')) continue;
            $parts = explode("\t", $line);
            if (count($parts) >= 7) {
                $name = trim($parts[5]);
                $val = trim($parts[6]);
                $cookiePairs[$name] = $val;
                if (in_array($name, ['__session', 'session_token', 'session']) && str_starts_with($val, 'eyJ')) {
                    $token = $val;
                }
            }
        }
    }
    // Standard Cookie string or HTTP header format (Cookie: ...)
    else {
        $cleanInput = preg_replace('/^Cookie:\s*/i', '', $input);
        // Look for Bearer or JWT
        if (preg_match('/(?:Bearer\s+|token=)(eyJ[a-zA-Z0-9_\-\.]+)/i', $cleanInput, $bm)) {
            $token = $bm[1];
        }

        $parts = explode(';', $cleanInput);
        foreach ($parts as $p) {
            $p = trim($p);
            if (empty($p)) continue;
            $eq = strpos($p, '=');
            if ($eq !== false) {
                $name = trim(substr($p, 0, $eq));
                $val = trim(substr($p, $eq + 1));
                $cookiePairs[$name] = $val;
                if (in_array($name, ['__session', 'session_token', 'session']) && str_starts_with($val, 'eyJ') && empty($token)) {
                    $token = $val;
                }
            }
        }
    }

    $cookieHeaderArr = [];
    foreach ($cookiePairs as $k => $v) {
        $cookieHeaderArr[] = "{$k}={$v}";
    }
    $cookieHeader = implode('; ', $cookieHeaderArr);

    return [
        'cookie' => $cookieHeader,
        'token' => $token,
        'pairs' => $cookiePairs
    ];
}

// --- HELPER: Auto-Exchange Clerk Session Token for Suno Studio API JWT ---
function getClerkSessionJwt($cookieHeader) {
    if (empty($cookieHeader)) return null;

    $ch = curl_init("https://clerk.suno.com/v1/client?_is_native=false");
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_TIMEOUT, 8);
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        'User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36',
        'Origin: https://suno.com',
        'Referer: https://suno.com/',
        'Accept: application/json',
        'Cookie: ' . $cookieHeader
    ]);
    $res = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);

    if ($httpCode === 200 && $res) {
        $json = json_decode($res, true);
        $resp = $json['response'] ?? $json;
        if (!empty($resp['sessions'][0]['last_active_token']['jwt'])) {
            return $resp['sessions'][0]['last_active_token']['jwt'];
        }

        $sessionId = $resp['last_active_session_id'] ?? ($resp['sessions'][0]['id'] ?? '');
        if (!empty($sessionId)) {
            $ch2 = curl_init("https://clerk.suno.com/v1/client/sessions/{$sessionId}/tokens?_is_native=false");
            curl_setopt($ch2, CURLOPT_RETURNTRANSFER, true);
            curl_setopt($ch2, CURLOPT_POST, true);
            curl_setopt($ch2, CURLOPT_POSTFIELDS, "");
            curl_setopt($ch2, CURLOPT_TIMEOUT, 8);
            curl_setopt($ch2, CURLOPT_SSL_VERIFYPEER, false);
            curl_setopt($ch2, CURLOPT_HTTPHEADER, [
                'User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36',
                'Origin: https://suno.com',
                'Referer: https://suno.com/',
                'Accept: application/json',
                'Cookie: ' . $cookieHeader
            ]);
            $res2 = curl_exec($ch2);
            $httpCode2 = curl_getinfo($ch2, CURLINFO_HTTP_CODE);
            curl_close($ch2);

            if ($httpCode2 === 200 && $res2) {
                $json2 = json_decode($res2, true);
                if (!empty($json2['jwt'])) {
                    return $json2['jwt'];
                }
            }
        }
    }
    return null;
}

// --- HELPER: Send Authenticated Request to Suno Studio API ---
function sendSunoAuthRequest($endpointUrl, $cookie = '', $token = '') {
    $parsed = parseRawCookieInput($cookie ?: $token);
    $cookieHeader = $parsed['cookie'];
    $jwt = $token ?: $parsed['token'];

    // If no JWT found directly in cookies, auto-exchange via clerk.suno.com
    if (empty($jwt) && !empty($cookieHeader)) {
        $jwt = getClerkSessionJwt($cookieHeader);
    }

    $execCurl = function($bearerToken) use ($endpointUrl, $cookieHeader) {
        $ch = curl_init($endpointUrl);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_TIMEOUT, 12);
        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
        
        $headers = [
            'User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36',
            'Origin: https://suno.com',
            'Referer: https://suno.com/',
            'Accept: application/json, text/plain, */*'
        ];

        if (!empty($cookieHeader)) {
            $headers[] = 'Cookie: ' . $cookieHeader;
        }
        if (!empty($bearerToken)) {
            $cleanBearer = preg_replace('/^Bearer\s+/i', '', trim($bearerToken));
            $headers[] = 'Authorization: Bearer ' . $cleanBearer;
        }

        curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
        $res = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);

        return [
            'code' => $httpCode,
            'body' => $res,
            'jwt'  => $bearerToken,
            'data' => ($res && $httpCode >= 200 && $httpCode < 300) ? json_decode($res, true) : null
        ];
    };

    $result = $execCurl($jwt);

    // If 401 and we have cookie header, try exchanging fresh JWT via Clerk
    if ($result['code'] === 401 && !empty($cookieHeader)) {
        $freshJwt = getClerkSessionJwt($cookieHeader);
        if (!empty($freshJwt) && $freshJwt !== $jwt) {
            $result = $execCurl($freshJwt);
        }
    }

    return $result;
}

// --- ACTION: Sync Active Session to Local Cache ---
if ($action === 'sync_session') {
    $rawCreds = $_POST['cookie'] ?? ($_POST['token'] ?? ($_GET['cookie'] ?? ''));
    if (!empty($rawCreds)) {
        $cacheDir = __DIR__ . '/cache';
        if (!is_dir($cacheDir)) @mkdir($cacheDir, 0777, true);
        file_put_contents($cacheDir . '/active_session.json', json_encode([
            'cookie' => $rawCreds,
            'updated_at' => date('c')
        ]));
        header("Content-Type: application/json; charset=utf-8");
        echo json_encode(['success' => true, 'message' => 'Sesi Suno tersimpan di cache lokal']);
        exit;
    }
    http_response_code(400);
    header("Content-Type: application/json; charset=utf-8");
    echo json_encode(['error' => 'Data cookie/token tidak boleh kosong']);
    exit;
}

// --- ACTION: Get Active Session from Local Cache ---
if ($action === 'get_saved_session') {
    $sessionFile = __DIR__ . '/cache/active_session.json';
    if (file_exists($sessionFile)) {
        $data = json_decode(file_get_contents($sessionFile), true);
        if ($data && !empty($data['cookie'])) {
            header("Content-Type: application/json; charset=utf-8");
            echo json_encode([
                'success' => true,
                'cookie' => $data['cookie'],
                'updated_at' => $data['updated_at'] ?? ''
            ]);
            exit;
        }
    }
    header("Content-Type: application/json; charset=utf-8");
    echo json_encode(['success' => false, 'message' => 'Belum ada sesi tersimpan di server']);
    exit;
}

// --- ACTION: Suno Workspace & Library Explorer (Projects, Playlists, Feed) ---
if ($action === 'workspace') {
    $rawCreds = $_POST['cookie'] ?? ($_POST['token'] ?? ($_GET['cookie'] ?? ''));

    // Fallback: Check local saved session cache if not provided in request
    if (empty($rawCreds)) {
        $sessionFile = __DIR__ . '/cache/active_session.json';
        if (file_exists($sessionFile)) {
            $saved = json_decode(file_get_contents($sessionFile), true);
            if (!empty($saved['cookie'])) {
                $rawCreds = $saved['cookie'];
            }
        }
    }

    if (empty($rawCreds)) {
        http_response_code(400);
        header("Content-Type: application/json; charset=utf-8");
        echo json_encode([
            "error" => "Kredensial Dibutuhkan",
            "message" => "Harap masukkan Suno Cookie atau gunakan tombol '⚡ Konek Otomatis' dengan ekstensi browser Suno."
        ], JSON_UNESCAPED_UNICODE);
        exit;
    }

    // Helper to calculate total clip count across different Suno API versions
    $extractClipCount = function($item) {
        if (!is_array($item)) return 0;
        if (isset($item['clip_count']) && is_numeric($item['clip_count'])) {
            return intval($item['clip_count']);
        }
        if (isset($item['num_total_clips']) && is_numeric($item['num_total_clips'])) {
            return intval($item['num_total_clips']);
        }
        if (isset($item['total_clips']) && is_numeric($item['total_clips'])) {
            return intval($item['total_clips']);
        }
        if (isset($item['num_clips']) && is_numeric($item['num_clips'])) {
            return intval($item['num_clips']);
        }
        if (isset($item['count']) && is_numeric($item['count'])) {
            return intval($item['count']);
        }
        if (!empty($item['clips']) && is_array($item['clips'])) {
            return count($item['clips']);
        }
        if (!empty($item['project_clips']) && is_array($item['project_clips'])) {
            return count($item['project_clips']);
        }
        if (!empty($item['playlist_clips']) && is_array($item['playlist_clips'])) {
            return count($item['playlist_clips']);
        }
        return 0;
    };

    // 1. Fetch User Projects / Workspace Folders
    // Suno uses /api/project/me?page=1&show_trashed=false or /api/project/me
    $projResp = sendSunoAuthRequest("https://studio-api.prod.suno.com/api/project/me?page=1&show_trashed=false", $rawCreds);
    if (empty($projResp['data']) || $projResp['code'] === 404) {
        $projResp = sendSunoAuthRequest("https://studio-api.prod.suno.com/api/project/me", $rawCreds);
    }

    // 2. Fetch User Playlists
    $playResp = sendSunoAuthRequest("https://studio-api.prod.suno.com/api/playlist/me?page=1&show_trashed=false&show_sharelist=false", $rawCreds);
    if (empty($playResp['data']) || $playResp['code'] === 404) {
        $playResp = sendSunoAuthRequest("https://studio-api.prod.suno.com/api/playlist/me", $rawCreds);
    }

    // 3. Fetch User Main Feed (All recent clips)
    $feedResp = sendSunoAuthRequest("https://studio-api.prod.suno.com/api/feed/v2?page=0", $rawCreds);
    if (empty($feedResp['data']) || $feedResp['code'] === 404) {
        $feedResp = sendSunoAuthRequest("https://studio-api.prod.suno.com/api/feed/", $rawCreds);
    }

    // If all unauthorized, return clear diagnostic message
    if ($projResp['code'] === 401 && $playResp['code'] === 401 && $feedResp['code'] === 401) {
        http_response_code(401);
        header("Content-Type: application/json; charset=utf-8");
        echo json_encode([
            "error" => "Autentikasi Gagal (Status 401)",
            "message" => "Server Suno menolak sesi ini. Pastikan Anda telah login ke suno.com, lalu gunakan salah satu cara:\n1. Copy seluruh cookies (JSON dari ekstensi Cookie-Editor atau string Cookie).\n2. ATAU buka DevTools (F12) > tab Network > klik salah satu request ke 'studio-api.prod.suno.com' > copy baris 'Authorization: Bearer eyJ...' dan paste di sini."
        ], JSON_UNESCAPED_UNICODE);
        exit;
    }

    // Unwrap Projects
    $rawProjects = [];
    if (!empty($projResp['data'])) {
        if (isset($projResp['data']['projects']) && is_array($projResp['data']['projects'])) {
            $rawProjects = $projResp['data']['projects'];
        } elseif (isset($projResp['data']['items']) && is_array($projResp['data']['items'])) {
            $rawProjects = $projResp['data']['items'];
        } elseif (isset($projResp['data']['data']) && is_array($projResp['data']['data'])) {
            $rawProjects = $projResp['data']['data'];
        } elseif (is_array($projResp['data']) && !isset($projResp['data']['id']) && isset($projResp['data'][0])) {
            $rawProjects = $projResp['data'];
        } elseif (is_array($projResp['data']) && isset($projResp['data']['id'])) {
            $rawProjects = [$projResp['data']];
        }
    }

    // Unwrap Playlists
    $rawPlaylists = [];
    if (!empty($playResp['data'])) {
        if (isset($playResp['data']['playlists']) && is_array($playResp['data']['playlists'])) {
            $rawPlaylists = $playResp['data']['playlists'];
        } elseif (isset($playResp['data']['items']) && is_array($playResp['data']['items'])) {
            $rawPlaylists = $playResp['data']['items'];
        } elseif (isset($playResp['data']['data']) && is_array($playResp['data']['data'])) {
            $rawPlaylists = $playResp['data']['data'];
        } elseif (is_array($playResp['data']) && !isset($playResp['data']['id']) && isset($playResp['data'][0])) {
            $rawPlaylists = $playResp['data'];
        } elseif (is_array($playResp['data']) && isset($playResp['data']['id'])) {
            $rawPlaylists = [$playResp['data']];
        }
    }

    // Unwrap Feed
    $feedClips = [];
    if (!empty($feedResp['data']['clips']) && is_array($feedResp['data']['clips'])) {
        $feedClips = $feedResp['data']['clips'];
    } elseif (!empty($feedResp['data']['items']) && is_array($feedResp['data']['items'])) {
        $feedClips = $feedResp['data']['items'];
    } elseif (is_array($feedResp['data']) && isset($feedResp['data'][0])) {
        $feedClips = $feedResp['data'];
    }

    // Normalize Projects list
    $normalizedProjects = [];
    foreach ($rawProjects as $p) {
        if (!is_array($p)) continue;
        $id = $p['id'] ?? ($p['project_id'] ?? '');
        if (empty($id)) continue;
        $name = $p['name'] ?? ($p['title'] ?? ($p['project_name'] ?? 'Folder Tanpa Judul'));
        $count = $extractClipCount($p);

        $normalizedProjects[] = [
            'id' => $id,
            'name' => $name,
            'title' => $name,
            'type' => 'project',
            'clip_count' => $count,
            'num_total_clips' => $count,
            'is_default' => !empty($p['is_default']),
            'description' => $p['description'] ?? '',
            'created_at' => $p['created_at'] ?? '',
            'updated_at' => $p['updated_at'] ?? ''
        ];
    }

    // Normalize Playlists list
    $normalizedPlaylists = [];
    foreach ($rawPlaylists as $pl) {
        if (!is_array($pl)) continue;
        $id = $pl['id'] ?? ($pl['playlist_id'] ?? '');
        if (empty($id)) continue;
        $name = $pl['name'] ?? ($pl['title'] ?? ($pl['playlist_name'] ?? 'Playlist Tanpa Judul'));
        $count = $extractClipCount($pl);

        $normalizedPlaylists[] = [
            'id' => $id,
            'name' => $name,
            'title' => $name,
            'type' => 'playlist',
            'clip_count' => $count,
            'num_total_clips' => $count,
            'description' => $pl['description'] ?? '',
            'created_at' => $pl['created_at'] ?? '',
            'updated_at' => $pl['updated_at'] ?? '',
            'image_url' => $pl['image_url'] ?? ''
        ];
    }

    // Auto-save successful session to local cache
    $cacheDir = __DIR__ . '/cache';
    if (!is_dir($cacheDir)) @mkdir($cacheDir, 0777, true);
    file_put_contents($cacheDir . '/active_session.json', json_encode([
        'cookie' => $rawCreds,
        'updated_at' => date('c')
    ]));

    header("Content-Type: application/json; charset=utf-8");
    echo json_encode([
        "success" => true,
        "tokenFound" => !empty($projResp['jwt'] ?: ($playResp['jwt'] ?: $feedResp['jwt'])),
        "projects" => $normalizedProjects,
        "playlists" => $normalizedPlaylists,
        "feed" => array_slice($feedClips, 0, 50)
    ], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

// --- ACTION: Fetch Specific Workspace Folder / Project / Playlist Items ---
if ($action === 'workspace_folder') {
    $folderId = $_GET['folder_id'] ?? ($_POST['folder_id'] ?? '');
    $folderType = $_GET['folder_type'] ?? ($_POST['folder_type'] ?? 'project');
    $rawCreds = $_POST['cookie'] ?? ($_POST['token'] ?? ($_GET['cookie'] ?? ''));
    $page = intval($_GET['page'] ?? ($_POST['page'] ?? 0));

    // Fallback: Check local saved session cache if not provided in request
    if (empty($rawCreds)) {
        $sessionFile = __DIR__ . '/cache/active_session.json';
        if (file_exists($sessionFile)) {
            $saved = json_decode(file_get_contents($sessionFile), true);
            if (!empty($saved['cookie'])) {
                $rawCreds = $saved['cookie'];
            }
        }
    }

    if (empty($folderId) && $folderType !== 'feed') {
        http_response_code(400);
        header("Content-Type: application/json; charset=utf-8");
        echo json_encode(["error" => "ID folder/proyek/playlist diperlukan"]);
        exit;
    }

    $resp = null;
    if ($folderType === 'playlist') {
        $endpoint = "https://studio-api.prod.suno.com/api/playlist/{$folderId}?page={$page}&show_trashed=false";
        $resp = sendSunoAuthRequest($endpoint, $rawCreds);
        if ($resp['code'] === 404 || empty($resp['data'])) {
            $resp = sendSunoAuthRequest("https://studio-api.prod.suno.com/api/playlist/{$folderId}", $rawCreds);
        }
    } elseif ($folderType === 'project') {
        $endpoint = "https://studio-api.prod.suno.com/api/project/{$folderId}";
        $resp = sendSunoAuthRequest($endpoint, $rawCreds);
        if ($resp['code'] === 404 || empty($resp['data'])) {
            $resp = sendSunoAuthRequest("https://studio-api.prod.suno.com/api/project/{$folderId}?page=1&show_trashed=false", $rawCreds);
        }
        if ($resp['code'] === 404 || empty($resp['data'])) {
            $resp = sendSunoAuthRequest("https://studio-api.prod.suno.com/api/playlist/{$folderId}", $rawCreds);
        }
    } else {
        $endpoint = "https://studio-api.prod.suno.com/api/feed/v2?page={$page}";
        $resp = sendSunoAuthRequest($endpoint, $rawCreds);
        if ($resp['code'] === 404 || empty($resp['data'])) {
            $resp = sendSunoAuthRequest("https://studio-api.prod.suno.com/api/feed/?page={$page}", $rawCreds);
        }
    }

    if (!$resp || $resp['code'] !== 200 || !$resp['data']) {
        http_response_code($resp ? ($resp['code'] ?: 500) : 500);
        header("Content-Type: application/json; charset=utf-8");
        echo json_encode([
            "error" => "Gagal mengambil folder",
            "message" => "Gagal memuat isi folder dari Suno API. Status: " . ($resp ? $resp['code'] : 'No Response')
        ], JSON_UNESCAPED_UNICODE);
        exit;
    }

    $data = $resp['data'];
    $folderTitle = $data['name'] ?? ($data['title'] ?? '');
    $rawClips = [];

    if (!empty($data['project_clips']) && is_array($data['project_clips'])) {
        foreach ($data['project_clips'] as $pc) {
            if (!empty($pc['clip']) && is_array($pc['clip'])) {
                $rawClips[] = $pc['clip'];
            } elseif (is_array($pc) && (!empty($pc['id']) || !empty($pc['clip_id']))) {
                $rawClips[] = $pc;
            }
        }
    } elseif (!empty($data['playlist_clips']) && is_array($data['playlist_clips'])) {
        foreach ($data['playlist_clips'] as $pc) {
            if (!empty($pc['clip']) && is_array($pc['clip'])) {
                $rawClips[] = $pc['clip'];
            } elseif (is_array($pc) && (!empty($pc['id']) || !empty($pc['clip_id']))) {
                $rawClips[] = $pc;
            }
        }
    } elseif (!empty($data['clips']) && is_array($data['clips'])) {
        $rawClips = $data['clips'];
    } elseif (!empty($data['items']) && is_array($data['items'])) {
        $rawClips = $data['items'];
    } elseif (is_array($data) && isset($data[0]) && is_array($data[0])) {
        $rawClips = $data;
    }

    $folderArtist = !empty($data['user_display_name']) ? $data['user_display_name'] :
        (!empty($data['display_name']) ? $data['display_name'] :
        (!empty($data['handle']) ? ('@' . ltrim($data['handle'], '@')) :
        (!empty($data['user']['display_name']) ? $data['user']['display_name'] : '')));

    $clips = [];
    foreach ($rawClips as $c) {
        if (!is_array($c)) continue;
        $clipId = $c['id'] ?? ($c['clip_id'] ?? '');
        if (empty($clipId)) continue;

        $title = $c['title'] ?? 'Suno Song';
        $artist = !empty($c['display_name']) ? $c['display_name'] :
            (!empty($c['displayName']) ? $c['displayName'] :
            (!empty($c['artist']) ? $c['artist'] :
            (!empty($c['user_display_name']) ? $c['user_display_name'] :
            (!empty($c['user_name']) ? $c['user_name'] :
            (!empty($c['user']['display_name']) ? $c['user']['display_name'] :
            (!empty($c['user']['handle']) ? ('@' . ltrim($c['user']['handle'], '@')) :
            (!empty($c['user']['username']) ? $c['user']['username'] :
            (!empty($c['handle']) ? ('@' . ltrim($c['handle'], '@')) :
            (!empty($c['metadata']['display_name']) ? $c['metadata']['display_name'] :
            (!empty($c['metadata']['artist']) ? $c['metadata']['artist'] :
            (!empty($folderArtist) ? $folderArtist : 'Suno Artist')))))))))));

        $handle = !empty($c['handle']) ? $c['handle'] : (!empty($c['user']['handle']) ? $c['user']['handle'] : '');
        $duration = floatval($c['metadata']['duration'] ?? ($c['duration'] ?? 180));
        $model = $c['major_model_version'] ?? ($c['model'] ?? 'v5.5');
        $img = $c['image_large_url'] ?? ($c['image_url'] ?? "https://cdn2.suno.ai/image_large_{$clipId}.jpeg");
        $audio = "https://d2lwuy8qc234o3.cloudfront.net/1/clip/{$clipId}.m4a";
        $lyrics = $c['metadata']['prompt'] ?? ($c['prompt'] ?? '[Instrumental]');
        $tags = $c['metadata']['tags'] ?? ($c['display_tags'] ?? ($c['tags'] ?? 'AI Music'));

        $clips[] = [
            'id' => $clipId,
            'title' => $title,
            'artist' => $artist,
            'displayName' => $artist,
            'display_name' => $artist,
            'handle' => $handle,
            'duration' => $duration,
            'model' => $model,
            'imageUrl' => $img,
            'imageLargeUrl' => $img,
            'audioUrl' => $audio,
            'audioCandidates' => [
                $audio,
                "https://cdn1.suno.ai/{$clipId}.mp3",
                "https://cdn2.suno.ai/{$clipId}.mp3"
            ],
            'lyrics' => $lyrics,
            'tags' => $tags,
            'createdAt' => $c['created_at'] ?? ''
        ];
    }

    header("Content-Type: application/json; charset=utf-8");
    echo json_encode([
        "success" => true,
        "folderId" => $folderId,
        "folderType" => $folderType,
        "folderTitle" => $folderTitle,
        "total" => count($clips),
        "clips" => $clips
    ], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

// --- HELPER: Decrypt Suno Mango DRM Encrypted Audio Stream ---
function decryptSunoMangoAudio($id, $encryptedData) {
    if (empty($encryptedData) || strlen($encryptedData) < 32) return false;

    // Check if already an unencrypted MP4 / audio stream
    if (substr($encryptedData, 4, 4) === 'ftyp' || substr($encryptedData, 0, 3) === 'ID3') {
        return $encryptedData;
    }

    // 1. Fetch license rights from Suno Mango API
    $ch = curl_init("https://studio-api.prod.suno.com/api/mango/rights");
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_TIMEOUT, 6);
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        'Content-Type: application/json',
        'Origin: https://suno.com',
        'Referer: https://suno.com/',
        'User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36'
    ]);
    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode([
        'content_params' => [
            'content_id' => $id,
            'content_type' => 'clip'
        ]
    ]));
    $res = curl_exec($ch);
    $code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);

    if ($code !== 200 || !$res) return false;

    $rights = json_decode($res, true);
    $glt = $rights['glt'] ?? '';
    $keyBase64 = $rights['key'] ?? '';
    $ivBase64 = $rights['iv'] ?? '';

    if (empty($glt) || empty($keyBase64) || empty($ivBase64)) return false;

    // 2. Derive User Key: SHA-256 of Guest License Token (GLT)
    $userKey = hash('sha256', $glt, true);

    // 3. Unwrap Content Key (AES-256-GCM)
    $wrappedKey = base64_decode($keyBase64);
    $ivGcm = substr($wrappedKey, 0, 12);
    $tagGcm = substr($wrappedKey, -16);
    $cipherGcm = substr($wrappedKey, 12, -16);
    $contentKey = openssl_decrypt($cipherGcm, 'aes-256-gcm', $userKey, OPENSSL_RAW_DATA, $ivGcm, $tagGcm, $id);

    // 4. Unwrap Content IV (AES-256-GCM)
    $wrappedIv = base64_decode($ivBase64);
    $ivGcm2 = substr($wrappedIv, 0, 12);
    $tagGcm2 = substr($wrappedIv, -16);
    $cipherGcm2 = substr($wrappedIv, 12, -16);
    $contentIv = openssl_decrypt($cipherGcm2, 'aes-256-gcm', $userKey, OPENSSL_RAW_DATA, $ivGcm2, $tagGcm2, $id);

    if (!$contentKey || !$contentIv) return false;

    // 5. Decrypt Audio Stream (AES-CTR)
    $cipherAlgo = (strlen($contentKey) === 16) ? 'aes-128-ctr' : 'aes-256-ctr';
    $decrypted = openssl_decrypt($encryptedData, $cipherAlgo, $contentKey, OPENSSL_RAW_DATA, $contentIv);

    return ($decrypted && strlen($decrypted) > 1000) ? $decrypted : false;
}

// --- HELPER: Cache & FFmpeg Audio Processor (FLAC & 24-bit WAV Supported with Studio Mastering Filter) ---
function getCachedMediaFile($id, $format, $masteringParams = null) {
    $cacheDir = __DIR__ . DIRECTORY_SEPARATOR . 'cache';
    if (!is_dir($cacheDir)) {
        @mkdir($cacheDir, 0777, true);
    }

    $format = strtolower($format);
    $isMastered = !empty($masteringParams['active']);
    $hash = '';
    if ($isMastered) {
        $hash = substr(md5(json_encode($masteringParams)), 0, 10);
        $cacheFile = $cacheDir . DIRECTORY_SEPARATOR . "{$id}_mastered_{$hash}.{$format}";
    } else {
        $cacheFile = $cacheDir . DIRECTORY_SEPARATOR . "{$id}.{$format}";
    }

    if (file_exists($cacheFile) && filesize($cacheFile) > 1000) {
        return $cacheFile;
    }

    // Step A: Ensure Master M4A file exists (unencrypted, pure audio master)
    $masterM4a = $cacheDir . DIRECTORY_SEPARATOR . "{$id}_master.m4a";
    if (!file_exists($masterM4a) || filesize($masterM4a) < 1000) {
        // 1. Check if unencrypted MP4 video exists on Suno CDN
        $videoSource = "https://cdn1.suno.ai/{$id}.mp4";
        $chCheck = curl_init($videoSource);
        curl_setopt($chCheck, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($chCheck, CURLOPT_RANGE, '0-10');
        curl_setopt($chCheck, CURLOPT_TIMEOUT, 3);
        curl_setopt($chCheck, CURLOPT_SSL_VERIFYPEER, false);
        curl_setopt($chCheck, CURLOPT_USERAGENT, 'Mozilla/5.0');
        curl_exec($chCheck);
        $checkCode = curl_getinfo($chCheck, CURLINFO_HTTP_CODE);
        curl_close($chCheck);

        if ($checkCode === 200 || $checkCode === 206) {
            shell_exec("ffmpeg -y -i " . escapeshellarg($videoSource) . " -vn -c:a copy " . escapeshellarg($masterM4a) . " 2>&1");
        } else {
            // 2. Fallback to CloudFront audio stream and decrypt Mango DRM
            $rawCandidates = [
                "https://d2lwuy8qc234o3.cloudfront.net/1/clip/{$id}.m4a",
                "https://d2lwuy8qc234o3.cloudfront.net/0/clip/{$id}.m4a"
            ];
            foreach ($rawCandidates as $rawUrl) {
                $ch = curl_init($rawUrl);
                curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
                curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
                curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
                curl_setopt($ch, CURLOPT_TIMEOUT, 60);
                curl_setopt($ch, CURLOPT_USERAGENT, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36');
                $rawData = curl_exec($ch);
                $rawCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
                curl_close($ch);

                if ($rawCode === 200 && $rawData && strlen($rawData) > 1000) {
                    $decrypted = decryptSunoMangoAudio($id, $rawData);
                    if ($decrypted && strlen($decrypted) > 1000) {
                        file_put_contents($masterM4a, $decrypted);
                        break;
                    }
                }
            }
        }
    }

    if (!file_exists($masterM4a) || filesize($masterM4a) < 1000) {
        return false;
    }

    // Construct Audio Filters if mastering is active
    $afArg = '';
    if ($isMastered) {
        $filters = [];
        $freqs = [32, 64, 125, 250, 500, 1000, 2000, 4000, 8000, 16000];
        $gains = $masteringParams['gains'] ?? [];
        foreach ($freqs as $idx => $freq) {
            $gain = isset($gains[$idx]) ? floatval($gains[$idx]) : 0;
            if (abs($gain) > 0.05) {
                $filters[] = "equalizer=f={$freq}:width_type=q:w=1.2:g={$gain}";
            }
        }

        // Stereo Spatial Width (100% - 180%)
        $width = floatval($masteringParams['width'] ?? 100);
        if ($width > 105) {
            $mCoeff = round(($width - 100) / 100 * 1.5, 2);
            $filters[] = "extrastereo=m={$mCoeff}";
        }

        // Warmth / Saturation (dynamic soft knee compressor)
        $warmth = floatval($masteringParams['warmth'] ?? 0);
        $compThresh = -16 - ($warmth * 0.06);
        $compRatio = 2.2 + ($warmth * 0.015);
        $compMakeup = 1.0 + ($warmth * 0.02);
        $filters[] = "acompressor=threshold={$compThresh}dB:ratio={$compRatio}:attack=15:release=120:makeup={$compMakeup}dB";

        // Master Gain
        $masterGain = floatval($masteringParams['gain'] ?? 0);
        if (abs($masterGain) > 0.05) {
            $filters[] = "volume={$masterGain}dB";
        }

        // Brickwall limiter protection
        $filters[] = "alimiter=limit=0.98";

        if (!empty($filters)) {
            $afArg = " -af " . escapeshellarg(implode(',', $filters)) . " ";
        }
    }

    // Step B: Generate requested format using local FFmpeg
    if ($format === 'm4a') {
        if ($isMastered && !empty($afArg)) {
            $cmd = "ffmpeg -y -i " . escapeshellarg($masterM4a) . " -vn {$afArg}-c:a aac -b:a 256k " . escapeshellarg($cacheFile) . " 2>&1";
            shell_exec($cmd);
        } else {
            copy($masterM4a, $cacheFile);
        }
    } elseif ($format === 'mp3') {
        $cmd = "ffmpeg -y -i " . escapeshellarg($masterM4a) . " -vn {$afArg}-c:a libmp3lame -b:a 320k " . escapeshellarg($cacheFile) . " 2>&1";
        shell_exec($cmd);
    } elseif ($format === 'wav') {
        // High-Resolution 24-bit Studio PCM WAV (48,000 Hz stereo)
        $cmd = "ffmpeg -y -i " . escapeshellarg($masterM4a) . " -vn {$afArg}-c:a pcm_s24le -ar 48000 -ac 2 " . escapeshellarg($cacheFile) . " 2>&1";
        shell_exec($cmd);
    } elseif ($format === 'flac') {
        // Pure Lossless FLAC with maximum compression level 8
        $cmd = "ffmpeg -y -i " . escapeshellarg($masterM4a) . " -vn {$afArg}-c:a flac -compression_level 8 " . escapeshellarg($cacheFile) . " 2>&1";
        shell_exec($cmd);
    }

    if (file_exists($cacheFile) && filesize($cacheFile) > 1000) {
        return $cacheFile;
    }
    return false;
}

// --- ACTION: Direct Download with Attachment Content-Disposition ---
if ($action === 'download' || isset($_GET['download'])) {
    $format = strtolower($_GET['format'] ?? '');
    $filename = $_GET['filename'] ?? '';

    if (empty($format) && !empty($filename)) {
        $ext = pathinfo($filename, PATHINFO_EXTENSION);
        if ($ext) $format = strtolower($ext);
    }
    if (empty($format)) $format = 'mp3';

    // Parse Mastering Parameters if Active
    $masteringActive = intval($_GET['mastering_active'] ?? ($_POST['mastering_active'] ?? 0));
    $masteringParams = null;
    if ($masteringActive) {
        $rawMastering = $_GET['mastering_data'] ?? ($_POST['mastering_data'] ?? '');
        if (!empty($rawMastering)) {
            $parsed = is_array($rawMastering) ? $rawMastering : json_decode($rawMastering, true);
            if ($parsed && is_array($parsed)) {
                $masteringParams = $parsed;
                $masteringParams['active'] = true;
            }
        }
    }

    // A. Audio formats (mp3, wav, m4a, flac) via local high-speed FFmpeg conversion
    if (in_array($format, ['mp3', 'wav', 'm4a', 'flac']) && !empty($id)) {
        $filePath = getCachedMediaFile($id, $format, $masteringParams);
        if ($filePath && file_exists($filePath)) {
            $fsize = filesize($filePath);
            $mimeMap = [
                'mp3'  => 'audio/mpeg',
                'wav'  => 'audio/wav',
                'm4a'  => 'audio/mp4',
                'flac' => 'audio/flac'
            ];
            $mime = $mimeMap[$format] ?? 'application/octet-stream';
            $safeName = !empty($filename) ? preg_replace('/[^\w\s\.-]/i', '_', $filename) : "suno_{$id}.{$format}";

            header("Content-Type: {$mime}");
            header('Content-Disposition: attachment; filename="' . $safeName . '"');
            header("Content-Length: {$fsize}");
            header('Accept-Ranges: bytes');
            header('Cache-Control: must-revalidate, post-check=0, pre-check=0');
            header('Pragma: public');
            readfile($filePath);
            exit;
        }
    }

    // B. MP4 Video Download
    if ($format === 'mp4' && !empty($id)) {
        $videoUrl = "https://cdn1.suno.ai/{$id}.mp4";
        $safeName = !empty($filename) ? preg_replace('/[^\w\s\.-]/i', '_', $filename) : "suno_{$id}.mp4";
        header("Content-Type: video/mp4");
        header('Content-Disposition: attachment; filename="' . $safeName . '"');
        header('Cache-Control: must-revalidate, post-check=0, pre-check=0');
        header('Pragma: public');

        $ch = curl_init($videoUrl);
        curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
        curl_setopt($ch, CURLOPT_USERAGENT, 'Mozilla/5.0');
        curl_exec($ch);
        curl_close($ch);
        exit;
    }

    http_response_code(404);
    echo "Audio file tidak dapat didekripsi dari server Suno CDN.";
    exit;
}

// --- ACTION: Audio Stream with Byte-Ranges (HTTP 206 Partial Content) ---
if ($action === 'stream' || !empty($_GET['stream'])) {
    @set_time_limit(0);
    @ignore_user_abort(true);
    if (!empty($id)) {
        $filePath = getCachedMediaFile($id, 'm4a');
        if ($filePath && file_exists($filePath)) {
            $fsize = filesize($filePath);
            $start = 0;
            $end = $fsize - 1;
            $length = $fsize;

            header("Content-Type: audio/mp4");
            header("Accept-Ranges: bytes");

            if (isset($_SERVER['HTTP_RANGE'])) {
                $range = $_SERVER['HTTP_RANGE'];
                if (preg_match('/bytes=\h*(\d+)-(\d*)[\D.*]?/i', $range, $matches)) {
                    $start = intval($matches[1]);
                    if (!empty($matches[2])) {
                        $end = intval($matches[2]);
                    }
                }
                $length = ($end - $start) + 1;
                http_response_code(206);
                header("Content-Range: bytes {$start}-{$end}/{$fsize}");
            } else {
                http_response_code(200);
            }

            header("Content-Length: {$length}");

            $fp = fopen($filePath, 'rb');
            fseek($fp, $start);
            $bytesRemaining = $length;
            while ($bytesRemaining > 0 && !feof($fp)) {
                if (connection_aborted()) break;
                $readSize = min(65536, $bytesRemaining);
                $buffer = fread($fp, $readSize);
                echo $buffer;
                flush();
                $bytesRemaining -= strlen($buffer);
            }
            fclose($fp);
            exit;
        }
    }

    if (!empty($_GET['url'])) {
        $url = $_GET['url'];
    } elseif (!empty($id)) {
        $url = "https://cdn1.suno.ai/{$id}.mp4";
    }
}

// --- ACTION: Generic Proxy Fallback ---
if (empty($url)) {
    http_response_code(400);
    header("Content-Type: application/json");
    echo json_encode(["error" => "Parameter url atau id diperlukan"]);
    exit;
}

$ch = curl_init($url);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
curl_setopt($ch, CURLOPT_MAXREDIRS, 5);
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
curl_setopt($ch, CURLOPT_USERAGENT, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36');
curl_setopt($ch, CURLOPT_TIMEOUT, 30);

$data = curl_exec($ch);
$contentType = curl_getinfo($ch, CURLINFO_CONTENT_TYPE);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

if ($httpCode >= 200 && $httpCode < 300) {
    header("Content-Type: " . ($contentType ?: 'application/octet-stream'));
    echo $data;
} else {
    http_response_code($httpCode ?: 500);
    echo "Error fetching media: HTTP {$httpCode}";
}
