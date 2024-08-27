<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Documento extends Model
{
    use HasFactory;

    protected $fillable = [
        'nombre',
        'descripcion',
        'archivo',
        'interaccion_id'
    ];

    /**
     * Obtener la interacción asociada con el documento.
     */
    public function interaccion()
    {
        return $this->belongsTo(Interaccion::class);
    }
}
