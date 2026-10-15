<?php

namespace App\Http\Controllers;

use App\Models\Order;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;

class PaymentController extends Controller
{
    public function checkout(Request $request)
    {
        $d = $request->validate([
            'items' => 'required|array|min:1',
            'items.*.id' => 'required|integer',
            'items.*.quantity' => 'required|integer|min:1|max:99',
        ]);

        $key = config('services.paymongo.secret_key');
        if (! $key) {
            return response()->json(['message' => 'PayMongo test key is not configured.'], 500);
        }

        // Never trust prices from the browser: look up each product on the product API.
        $items = [];
        foreach ($d['items'] as $i) {
            $r = Http::timeout(10)->get(config('services.product_api') . '/' . $i['id']);
            if ($r->failed()) {
                return response()->json(['message' => 'A product in your cart could not be verified.'], 422);
            }
            $p = $r->json();
            $items[] = [
                'id'       => $p['id'],
                'title'    => $p['title'],
                'price'    => ProductController::toPeso($p['price']),
                'quantity' => (int) $i['quantity'],
            ];
        }
        $items = collect($items);

        $line = $items->map(fn ($i) => [
            'currency'    => 'PHP',
            'amount'      => (int) round($i['price'] * 100),
            'description' => $i['title'],
            'name'        => $i['title'],
            'quantity'    => $i['quantity'],
        ])->values()->all();

        $response = Http::withBasicAuth($key, '')
            ->post('https://api.paymongo.com/v1/checkout_sessions', [
                'data' => ['attributes' => [
                    'line_items' => $line,
                    'payment_method_types' => ['card', 'gcash', 'paymaya'],
                    'description' => 'ShopSphere Order',
                    'success_url' => config('services.frontend_url') . '/success',
                    'cancel_url'  => config('services.frontend_url') . '/failed',
                ]],
            ]);

        if ($response->failed()) {
            return response()->json([
                'message' => 'PayMongo checkout creation failed.',
                'details' => $response->json(),
            ], 502);
        }

        $sessionId   = $response->json('data.id');
        $checkoutUrl = $response->json('data.attributes.checkout_url');
        $user        = $request->user();

        $order = Order::create([
            'user_id'             => $user->id,
            'paymongo_session_id' => $sessionId,
            'amount'              => $items->sum(fn ($i) => $i['price'] * $i['quantity']),
            'status'              => 'pending',
            'items'               => $items->all(),
            'shipping_name'       => $user->name,
            'shipping_contact'    => $user->contact,
            'shipping_address'    => $user->address,
        ]);

        return [
            'checkout_url' => $checkoutUrl,
            'session_id'   => $sessionId,
            'order_id'     => $order->id,
        ];
    }
}