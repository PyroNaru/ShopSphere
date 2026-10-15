<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Order extends Model
{
    protected $fillable = [
        'user_id',
        'paymongo_session_id',
        'amount',
        'status',
        'items',
        'shipping_name',
        'shipping_contact',
        'shipping_address',
    ];

    protected $casts = [
        'items' => 'array',
        'amount' => 'decimal:2',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function shipment()
    {
        return $this->hasOne(Shipment::class);
    }
}