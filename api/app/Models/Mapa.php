<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Mapa extends Model
{
    use HasFactory;

    protected $primaryKey = 'id';
    protected $keyType = 'string';
    public $incrementing = false;

    protected $fillable = [
        'id',
        'title',
        'mapWidth',
        'mapHeight',
        'maxZoom',
        'hoverTooltip',
        'sidebar',
        'layerSwitcher',
        'resetButton',
        'zoomButtons',
        'height',
        'filters',
        'thumbnails',
        'ordered',
        'csv',
        'sidebarWidth',
        'layer',
        'portrait',
        'zoom',
        'toggleSidebar',
        'sidebarClosed',
        'primaryColor',
        'portraitMinHeight',
        'fullscreen',
        'moreText',
        'csvEnabled',
        'rightSidebar',
        'import_url'
    ];

    public function empresa()
    {
        return $this->belongsTo(Empresa::class);
    }

    public function capas()
    {
        return $this->hasMany(Capa::class, 'mapa_id');
    }
}
