<?php

namespace App\Http\Controllers;

use Illuminate\Support\Facades\Http;

class ProductController extends Controller
{
    // dummyjson prices are in USD. We convert to PHP for display and checkout.
    public const USD_TO_PHP = 56;

    public static function toPeso($usd): float
    {
        return round($usd * self::USD_TO_PHP, 2);
    }

    public function index()
    {
        $r = Http::timeout(10)->get(config('services.product_api'));
        if ($r->failed()) {
            return response()->json(['message' => 'Product API unavailable.'], 502);
        }

        $data = $r->json();
        $data['products'] = collect($data['products'] ?? [])->map(function ($p) {
            $p['price'] = self::toPeso($p['price']);
            return $p;
        })->all();

        return $data;
    }
}