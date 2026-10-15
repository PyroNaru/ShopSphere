<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Shipment extends Model
{
    protected $fillable = [
        'order_id',
        'tracking_number',
        'carrier',
        'status',
        'estimated_delivery',
    ];

    protected $casts = [
        'estimated_delivery' => 'datetime',
    ];

    public function order()
    {
        return $this->belongsTo(Order::class);
    }
}