<?php

namespace App\Http\Controllers;

use App\Models\Capa;
use Illuminate\Http\Request;

class CapaController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        return Capa::all();
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $this->validateCapa($request);

        $capa = Capa::create($request->all());

        return response()->json($capa, 201);
    }

    /**
     * Display the specified resource.
     */
    public function show($id)
    {
        return Capa::findOrFail($id);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, $id)
    {
        $this->validateCapa($request, $id);

        $capa = Capa::findOrFail($id);
        $capa->update($request->all());

        return response()->json($capa, 200);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy($id)
    {
        $capa = Capa::findOrFail($id);
        $capa->delete();

        return response()->json(null, 204);
    }

    /**
     * Get all capas related to a specific mapa.
     */
    public function getCapasByMapa($mapaId)
    {
        $mapa = Mapa::findOrFail($mapaId);
        $capas = $mapa->capas;

        return response()->json($capas, 200);
    }

    private function validateCapa(Request $request, $id = null)
    {
        $rules = [
            'id' => 'required|string|unique:capas,id' . ($id ? ",$id" : ''),
            'name' => 'required|string',
            'file' => 'nullable|string',
            'mapa_id' => 'required|string|exists:mapas,id'
        ];

        $request->validate($rules);
    }
}
