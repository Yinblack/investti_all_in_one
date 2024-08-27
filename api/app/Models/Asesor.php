<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Asesor extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
    ];

    /**
     * Obtener el usuario asociado con el cliente.
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function empresas()
    {
        return $this->belongsToMany(Empresa::class, 'asesor_empresa');
    }

    /**
     * Obtener las interacciones del asesor.
     */
    public function interacciones()
    {
        return $this->hasMany(Interaccion::class);
    }
    
}
