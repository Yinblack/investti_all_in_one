<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Contacto extends Model
{
    use HasFactory;

    protected $fillable = [
        'indice',
        'valor',
        'cliente_id',
    ];

    /**
     * Obtener el cliente asociado con el contacto.
     */
    public function cliente()
    {
        return $this->belongsTo(Cliente::class);
    }
}
