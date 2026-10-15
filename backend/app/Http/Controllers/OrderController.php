<?php

namespace App\Http\Controllers;

use App\Models\Order;
use Illuminate\Http\Request;

class OrderController extends Controller
{
    public function index(Request $request)
    {
        $orders = Order::with('shipment')
            ->where('user_id', $request->user()->id)
            ->latest()
            ->get();

        return response()->json($orders);
    }

    public function show(Request $request, Order $order)
    {
        if ($order->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Not found.'], 404);
        }

        $order->load('shipment');

        return response()->json($order);
    }

    public function advance(Request $request, Order $order)
    {
        if ($order->user_id !== $request->user()->id || ! $order->shipment) {
            return response()->json(['message' => 'Not found.'], 404);
        }

        $steps = ['preparing', 'shipped', 'in_transit', 'out_for_delivery', 'delivered'];
        $i = array_search($order->shipment->status, $steps, true);

        if ($i !== false && $i < count($steps) - 1) {
            $order->shipment->update(['status' => $steps[$i + 1]]);
        }

        return response()->json($order->fresh('shipment'));
    }
}