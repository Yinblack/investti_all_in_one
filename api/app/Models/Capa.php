<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Capa extends Model
{
    use HasFactory;

    protected $primaryKey = 'id';
    protected $keyType = 'string';
    public $incrementing = false;

    protected $fillable = [
        'id',
        'name',
        'file',
        'mapa_id',
    ];

    public function mapa()
    {
        return $this->belongsTo(Mapa::class, 'mapa_id');
    }

    public function ubicaciones()
    {
        return $this->hasMany(Ubicacion::class, 'capa_id');
    }
}
