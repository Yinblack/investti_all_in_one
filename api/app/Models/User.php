<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'type',
        'name',
        'email',
        'password',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var array<int, string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * The attributes that should be cast to native types.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'email_verified_at' => 'datetime',
    ];

    /**
     * A user can have multiple sessions.
     */
    public function sessions()
    {
        return $this->hasMany(Session::class);
    }

    /**
     * A user can belong to many empresas (if necessary).
     */
    public function empresas()
    {
        return $this->belongsToMany(Empresa::class);
    }

    /**
     * A user has one administrador.
     */
    public function administrador()
    {
        return $this->hasOne(Administrador::class);
    }
    
    /**
     * A user has one asesor.
     */
    public function asesor()
    {
        return $this->hasOne(Asesor::class);
    }
    
}
