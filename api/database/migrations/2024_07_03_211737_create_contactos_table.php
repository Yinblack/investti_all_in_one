<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('contactos', function (Blueprint $table) {
            $table->id();
            $table->enum('indice', [
                'email',
                'telefono',
                'celular',
                'whatsapp',
                'direccion_fisica',
                'telegram',
                'skype',
                'facebook',
                'twitter',
                'instagram',
                'wechat',
                'signal',
                'line',
                'discord'
            ]);
            $table->string('valor');
            $table->foreignId('cliente_id')->constrained('clientes')->onDelete('cascade');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('contactos');
    }
};
