<?php

namespace App\Http\Controllers;

use App\Models\Mapa;
use Illuminate\Http\Request;

class MapaController extends Controller
{
    public function index()
    {
        return Mapa::all();
    }

    public function store(Request $request)
    {
        $this->validateMapa($request);

        $mapa = Mapa::create($request->all());

        return response()->json($mapa, 201);
    }

    public function show($id)
    {
        return Mapa::findOrFail($id);
    }

    public function update(Request $request, $id)
    {
        $this->validateMapa($request, $id);

        $mapa = Mapa::findOrFail($id);
        $mapa->update($request->all());

        return response()->json($mapa, 200);
    }

    public function destroy($id)
    {
        $mapa = Mapa::findOrFail($id);
        $mapa->delete();

        return response()->json(null, 204);
    }

    private function validateMapa(Request $request, $id = null)
    {
        $rules = [
            'id' => 'required|string|unique:mapas,id' . ($id ? ",$id" : ''),
            'title' => 'required|string',
            'mapWidth' => 'nullable|string',
            'mapHeight' => 'nullable|integer',
            'maxZoom' => 'nullable|string',
            'hoverTooltip' => 'nullable|boolean',
            'sidebar' => 'nullable|boolean',
            'layerSwitcher' => 'nullable|string',
            'resetButton' => 'nullable|string',
            'zoomButtons' => 'nullable|string',
            'height' => 'nullable|string',
            'filters' => 'nullable|boolean',
            'thumbnails' => 'nullable|boolean',
            'ordered' => 'nullable|boolean',
            'csv' => 'nullable|string',
            'sidebarWidth' => 'nullable|string',
            'layer' => 'nullable|string',
            'portrait' => 'nullable|string',
            'zoom' => 'nullable|boolean',
            'toggleSidebar' => 'nullable|boolean',
            'sidebarClosed' => 'nullable|boolean',
            'primaryColor' => 'nullable|string',
            'portraitMinHeight' => 'nullable|string',
            'fullscreen' => 'nullable|string',
            'moreText' => 'nullable|string',
            'csvEnabled' => 'nullable|boolean',
            'rightSidebar' => 'nullable|boolean',
            'import_url' => 'nullable|string|url'
        ];

        $request->validate($rules);
    }
}
