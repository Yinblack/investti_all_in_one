<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Cliente extends Model
{
    use HasFactory;

    protected $fillable = [
        'names',
        'lastnames',
        'user_id',
    ];

    /**
     * Obtener las interacciones del cliente.
     */
    public function interacciones()
    {
        return $this->hasMany(Interaccion::class);
    }

    /**
     * Obtener los contactos del cliente.
     */
    public function contactos()
    {
        return $this->hasMany(Contacto::class);
    }
    
}
