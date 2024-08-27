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
        Schema::create('mapas', function (Blueprint $table) {
            $table->string('id')->primary();
            $table->string('title');
            $table->string('mapWidth')->nullable();
            $table->integer('mapHeight')->nullable();
            $table->string('maxZoom')->nullable();
            $table->boolean('hoverTooltip')->nullable();
            $table->boolean('sidebar')->nullable();
            $table->string('layerSwitcher')->nullable();
            $table->string('resetButton')->nullable();
            $table->string('zoomButtons')->nullable();
            $table->string('height')->nullable();
            $table->boolean('filters')->nullable();
            $table->boolean('thumbnails')->nullable();
            $table->boolean('ordered')->nullable();
            $table->string('csv')->nullable();
            $table->string('sidebarWidth')->nullable();
            $table->string('layer')->nullable();
            $table->string('portrait')->nullable();
            $table->boolean('zoom')->nullable();
            $table->boolean('toggleSidebar')->nullable();
            $table->boolean('sidebarClosed')->nullable();
            $table->string('primaryColor')->nullable();
            $table->string('portraitMinHeight')->nullable();
            $table->string('fullscreen')->nullable();
            $table->string('moreText')->nullable();
            $table->boolean('csvEnabled')->nullable();
            $table->boolean('rightSidebar')->nullable();
            $table->string('import_url')->nullable();
            $table->unsignedBigInteger('empresa_id')->nullable();
            $table->timestamps();

            $table->foreign('empresa_id')->references('id')->on('empresas')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('mapas');
    }
};
