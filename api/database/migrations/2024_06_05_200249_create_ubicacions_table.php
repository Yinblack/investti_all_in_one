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
        Schema::create('ubicacions', function (Blueprint $table) {
            $table->string('id')->primary();
            $table->string('title');
            $table->string('area');
            $table->string('layer');
            $table->string('action');
            $table->string('type');
            $table->boolean('disable')->default(false);
            $table->text('desc')->nullable();
            $table->string('ubicacion');
            $table->string('superficie_frente')->nullable();
            $table->text('ubicacion_ne')->nullable();
            $table->text('ubicacion_se')->nullable();
            $table->text('ubicacion_so')->nullable();
            $table->text('ubicacion_no')->nullable();
            $table->string('manzana');
            $table->string('lote');
            $table->string('fecha_entrega');
            $table->decimal('precio_m2_contado', 10, 2)->nullable();
            $table->decimal('precio_contado', 10, 2)->nullable();
            $table->decimal('precio_m2_6meses', 10, 2)->nullable();
            $table->decimal('precio_6meses', 10, 2)->nullable();
            $table->decimal('precio_m2_12meses', 10, 2)->nullable();
            $table->decimal('precio_12meses', 10, 2)->nullable();
            $table->decimal('precio_m2_18meses', 10, 2)->nullable();
            $table->decimal('precio_18meses', 10, 2)->nullable();
            $table->decimal('precio_m2_24meses', 10, 2)->nullable();
            $table->decimal('precio_24meses', 10, 2)->nullable();
            $table->decimal('precio_m2_36meses', 10, 2)->nullable();
            $table->decimal('precio_36meses', 10, 2)->nullable();
            $table->decimal('dto_contado', 5, 2)->nullable();
            $table->decimal('dto_6meses', 5, 2)->nullable();
            $table->decimal('dto_12meses', 5, 2)->nullable();
            $table->decimal('dto_18meses', 5, 2)->nullable();
            $table->decimal('dto_24meses', 5, 2)->nullable();
            $table->decimal('dto_36meses', 5, 2)->nullable();
            $table->string('estatus');
            $table->boolean('activo')->default(false);
            $table->json('coord')->nullable();
            $table->boolean('showButton')->default(true);
            $table->string('style')->nullable();
            $table->json('group')->nullable();
            $table->string('capa_id'); // Agregar columna para la llave foránea
            $table->timestamps();

            $table->foreign('capa_id')->references('id')->on('capas')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('ubicacions');
    }
};
