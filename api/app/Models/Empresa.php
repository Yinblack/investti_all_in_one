<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Empresa extends Model
{
    use HasFactory;

    protected $fillable = [
        'name'
    ];

    public function mapas()
    {
        return $this->hasMany(Mapa::class);
    }

    public function administradores()
    {
        return $this->belongsToMany(Administrador::class, 'administrador_empresa');
    }

    public function asesores()
    {
        return $this->belongsToMany(Asesor::class, 'asesor_empresa');
    }
    
}
