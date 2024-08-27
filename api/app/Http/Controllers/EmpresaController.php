<?php

namespace App\Http\Controllers;

use App\Models\Empresa;
use Illuminate\Http\Request;

class EmpresaController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        return Empresa::all();
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $this->validateRequest($request);

        $empresa = Empresa::create($request->all());

        return response()->json($empresa, 201);
    }

    /**
     * Display the specified resource.
     */
    public function show($id)
    {
        return Empresa::findOrFail($id);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, $id)
    {
        $this->validateRequest($request, $id);

        $empresa = Empresa::findOrFail($id);
        $empresa->update($request->all());

        return response()->json($empresa, 200);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy($id)
    {
        $empresa = Empresa::findOrFail($id);
        $empresa->delete();

        return response()->json(null, 204);
    }

    /**
     * Get all mapas related to a specific empresa.
     */
    public function getMapasByEmpresa($empresaId)
    {
        $mapas = Empresa::findOrFail($empresaId)->mapas;

        return response()->json($mapas, 200);
    }

    /**
     * Validate the request data.
     */
    protected function validateRequest(Request $request)
    {
        $request->validate([
            'name' => 'required|string',
        ]);
    }
}
