<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\Shipment;
use Illuminate\Http\Request;

class PayMongoWebhookController extends Controller
{
    public function handle(Request $request)
    {
        $payload = $request->getContent();
        $signature = $request->header('Paymongo-Signature');

        if (! $this->verifySignature($payload, $signature)) {
            return response()->json(['error' => 'Invalid signature'], 401);
        }

        $event = json_decode($payload, true);
        $type = $event['data']['attributes']['type'] ?? null;

        if ($type === 'checkout_session.payment.paid') {
            $sessionId = $event['data']['attributes']['data']['id'] ?? null;

            $order = Order::where('paymongo_session_id', $sessionId)->first();

            if ($order && $order->status !== 'paid') {
                $order->update(['status' => 'paid']);

                Shipment::firstOrCreate(
                    ['order_id' => $order->id],
                    [
                        'status' => 'preparing',
                        'carrier' => collect(['J&T Express', 'LBC', 'Flash Express'])->random(),
                        'tracking_number' => 'SS' . strtoupper(\Illuminate\Support\Str::random(10)),
                        'estimated_delivery' => now()->addDays(3),
                    ]
                );
            }
        }

        return response()->json(['status' => 'success']);
    }

    private function verifySignature(string $payload, ?string $header): bool
    {
        if (! $header) {
            return false;
        }

        $secret = config('services.paymongo.webhook_secret');
        if (! $secret) {
            return false;
        }

        // Header format: t=timestamp,te=test_sig,li=live_sig
        $parts = [];
        foreach (explode(',', $header) as $pair) {
            if (str_contains($pair, '=')) {
                [$k, $v] = explode('=', $pair, 2);
                $parts[trim($k)] = trim($v);
            }
        }

        $timestamp = $parts['t'] ?? null;
        $testSig   = $parts['te'] ?? null;
        $liveSig   = $parts['li'] ?? null;

        $expected = hash_hmac('sha256', $timestamp . '.' . $payload, $secret);

        return ($testSig && hash_equals($expected, $testSig))
            || ($liveSig && hash_equals($expected, $liveSig));
    }
}