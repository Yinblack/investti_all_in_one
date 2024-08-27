<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Ubicacion extends Model
{
    use HasFactory;

    protected $primaryKey = 'id';
    protected $keyType = 'string';
    public $incrementing = false;

    protected $fillable = [
        'id',
        'title',
        'area',
        'layer',
        'action',
        'type',
        'disable',
        'desc',
        'ubicacion',
        'superficie_frente',
        'ubicacion_ne',
        'ubicacion_se',
        'ubicacion_so',
        'ubicacion_no',
        'manzana',
        'lote',
        'fecha_entrega',
        'precio_m2_contado',
        'precio_contado',
        'precio_m2_6meses',
        'precio_6meses',
        'precio_m2_12meses',
        'precio_12meses',
        'precio_m2_18meses',
        'precio_18meses',
        'precio_m2_24meses',
        'precio_24meses',
        'precio_m2_36meses',
        'precio_36meses',
        'dto_contado',
        'dto_6meses',
        'dto_12meses',
        'dto_18meses',
        'dto_24meses',
        'dto_36meses',
        'estatus',
        'activo',
        'coord',
        'showButton',
        'style',
        'group',
        'capa_id'
    ];

    public function capa()
    {
        return $this->belongsTo(Capa::class, 'capa_id');
    }
}
