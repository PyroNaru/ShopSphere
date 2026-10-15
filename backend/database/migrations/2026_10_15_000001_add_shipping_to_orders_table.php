<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('orders', function (Blueprint $t) {
            $t->string('shipping_name')->nullable();
            $t->string('shipping_contact')->nullable();
            $t->string('shipping_address')->nullable();
        });
    }

    public function down(): void
    {
        Schema::table('orders', function (Blueprint $t) {
            $t->dropColumn(['shipping_name', 'shipping_contact', 'shipping_address']);
        });
    }
};