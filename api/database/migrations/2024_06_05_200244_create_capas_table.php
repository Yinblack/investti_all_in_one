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
        Schema::create('capas', function (Blueprint $table) {
            $table->string('id')->primary();
            $table->string('name');
            $table->string('file')->nullable();
            $table->string('mapa_id');
            $table->timestamps();
            
            $table->foreign('mapa_id')->references('id')->on('mapas')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('capas');
    }
};