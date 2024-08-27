<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Interaccion extends Model
{
    use HasFactory;

    protected $fillable = [
        'tipo',
        'asesor_id',
        'cliente_id',
    ];

    /**
     * Obtener el asesor asociado con la interacción.
     */
    public function asesor()
    {
        return $this->belongsTo(Asesor::class);
    }

    /**
     * Obtener el cliente asociado con la interacción.
     */
    public function cliente()
    {
        return $this->belongsTo(Cliente::class);
    }

    /**
     * Obtener los documentos asociados con la interacción.
     */
    public function documentos()
    {
        return $this->hasMany(Documento::class);
    }
    
}
