<?php

namespace App\Http\Controllers;

use App\Models\Ubicacion;
use Illuminate\Http\Request;

class UbicacionController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        return Ubicacion::all();
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $this->validateRequest($request);

        $ubicacion = Ubicacion::create($request->all());

        return response()->json($ubicacion, 201);
    }

    /**
     * Display the specified resource.
     */
    public function show($id)
    {
        return Ubicacion::findOrFail($id);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, $id)
    {
        $this->validateRequest($request, $id);

        $ubicacion = Ubicacion::findOrFail($id);
        $ubicacion->update($request->all());

        return response()->json($ubicacion, 200);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy($id)
    {
        $ubicacion = Ubicacion::findOrFail($id);
        $ubicacion->delete();

        return response()->json(null, 204);
    }

    /**
     * Get all ubicaciones related to a specific capa.
     */
    public function getUbicacionesByCapa($capaId)
    {
        $ubicaciones = Ubicacion::where('capa_id', $capaId)->get();

        return response()->json($ubicaciones, 200);
    }

    /**
     * Validate the request data.
     */
    protected function validateRequest(Request $request, $id = null)
    {
        $uniqueRule = $id ? 'unique:ubicacions,id,' . $id : 'unique:ubicacions,id';

        $request->validate([
            'id' => 'required|string|' . $uniqueRule,
            'title' => 'required|string',
            'area' => 'required|string',
            'layer' => 'required|string',
            'action' => 'required|string',
            'type' => 'required|string',
            'disable' => 'boolean',
            'desc' => 'nullable|string',
            'ubicacion' => 'required|string',
            'superficie_frente' => 'nullable|string',
            'ubicacion_ne' => 'nullable|string',
            'ubicacion_se' => 'nullable|string',
            'ubicacion_so' => 'nullable|string',
            'ubicacion_no' => 'nullable|string',
            'manzana' => 'required|string',
            'lote' => 'required|string',
            'fecha_entrega' => 'required|string',
            'precio_m2_contado' => 'nullable|numeric',
            'precio_contado' => 'nullable|numeric',
            'precio_m2_6meses' => 'nullable|numeric',
            'precio_6meses' => 'nullable|numeric',
            'precio_m2_12meses' => 'nullable|numeric',
            'precio_12meses' => 'nullable|numeric',
            'precio_m2_18meses' => 'nullable|numeric',
            'precio_18meses' => 'nullable|numeric',
            'precio_m2_24meses' => 'nullable|numeric',
            'precio_24meses' => 'nullable|numeric',
            'precio_m2_36meses' => 'nullable|numeric',
            'precio_36meses' => 'nullable|numeric',
            'dto_contado' => 'nullable|numeric',
            'dto_6meses' => 'nullable|numeric',
            'dto_12meses' => 'nullable|numeric',
            'dto_18meses' => 'nullable|numeric',
            'dto_24meses' => 'nullable|numeric',
            'dto_36meses' => 'nullable|numeric',
            'estatus' => 'required|string',
            'activo' => 'boolean',
            'coord' => 'nullable|json',
            'showButton' => 'boolean',
            'style' => 'nullable|string',
            'group' => 'nullable|json',
            'capa_id' => 'required|string|exists:capas,id'
        ]);
    }
}
