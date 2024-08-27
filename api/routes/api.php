<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\MapaController;
use App\Http\Controllers\CapaController;
use App\Http\Controllers\UbicacionController;
use App\Http\Controllers\EmpresaController;
use App\Http\Controllers\AuthController;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

Route::apiResource('mapas', MapaController::class);
Route::apiResource('capas', CapaController::class);
Route::apiResource('ubicaciones', UbicacionController::class);
Route::get('/mapas/{mapaId}/capas', [CapaController::class, 'getCapasByMapa']);
Route::get('/ubicaciones/capa/{capaId}', [UbicacionController::class, 'getUbicacionesByCapa']);
Route::resource('empresas', EmpresaController::class);
Route::get('/empresas/{empresaId}/mapas', [EmpresaController::class, 'getMapasByEmpresa']);

Route::post('login', [AuthController::class, 'login']);
Route::post('logout', [AuthController::class, 'logout'])->middleware('auth:sanctum');
Route::post('register', [AuthController::class, 'register']);