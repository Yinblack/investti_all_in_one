<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\User;
use App\Models\Administrador;
use App\Models\Empresa;
use App\Models\Mapa;
use App\Models\Capa;
use App\Models\Ubicacion;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class CreateTestUser extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'user:create-test';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Create a test user';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        // Crear usuario
        $user = User::create([
            'type' => 'admin',
            'name' => 'Test User',
            'email' => 'testuser@example.com',
            'password' => Hash::make('password'), // Puedes cambiar esto a cualquier contraseña deseada
        ]);

        // Crear administrador y enlazarlo con el usuario
        $administrador = Administrador::create([
            'user_id' => $user->id,
        ]);

        // Crear empresa y enlazarla con el administrador
        $empresa = Empresa::create([
            'name' => 'Test Empresa',
        ]);
        $administrador->empresas()->attach($empresa->id);

        // Crear mapa y enlazarlo con la empresa
        $mapa = Mapa::create([
            'id' => Str::uuid()->toString(),
            'title' => 'Residential lots',
            'mapWidth' => '1300',
            'mapHeight' => 1000,
            'maxZoom' => '3',
            'hoverTooltip' => true,
            'sidebar' => true,
            'layerSwitcher' => 'bottom-left',
            'resetButton' => 'bottom-right',
            'zoomButtons' => 'bottom-right',
            'height' => '',
            'filters' => true,
            'thumbnails' => true,
            'ordered' => false,
            'csv' => '',
            'sidebarWidth' => '30%',
            'layer' => 'lot-map',
            'portrait' => '600',
            'zoom' => true,
            'toggleSidebar' => true,
            'sidebarClosed' => false,
            'primaryColor' => '',
            'portraitMinHeight' => '400px',
            'fullscreen' => 'top-left',
            'moreText' => 'Reserve',
            'csvEnabled' => false,
            'rightSidebar' => true,
            'import_url' => 'https://www.canadaslaporta.com/lotificacion-info.php',
            'empresa_id' => $empresa->id,
        ]);

        // Crear capa y enlazarla con el mapa
        $capa = Capa::create([
            'id' => Str::uuid()->toString(), // Crear un ID único
            'name' => 'Mapa de lotes',
            'file' => 'assets/maps/lots.svg',
            'mapa_id' => $mapa->id,
        ]);

        // Crear ubicaciones y enlazarlas con la capa
        $ubicaciones = [
            [
                'id' => '1',
                'title' => 'Lote 1',
                'area' => '310.36',
                'layer' => 'lot-map',
                'action' => 'sidebar',
                'type' => 'circle',
                'disable' => false,
                'desc' => 'Manzana: 1, lote: 1',
                'ubicacion' => 'SANTA ANITA',
                'superficie_frente' => null,
                'ubicacion_ne' => 'EN LC 7.08m Y LC 16.46m LINDA CON LOTE 2 MANZANA 1',
                'ubicacion_se' => 'EN LINEA QUEBRADA 1.51m, 7 TRAMOS DE 3.00m Y 2.56m LINDA CON LOTE 48 DE',
                'ubicacion_so' => 'EN LC 27.94m LINDA CON VIALIDAD SAN CARLOS',
                'ubicacion_no' => 'EN LC 4.10m LINDA CON VIALIDAD SANTA ANITA',
                'manzana' => '1',
                'lote' => '1',
                'fecha_entrega' => 'FEB 2023',
                'precio_m2_contado' => '0.00',
                'precio_contado' => '0.00',
                'precio_m2_6meses' => null,
                'precio_6meses' => null,
                'precio_m2_12meses' => '0.00',
                'precio_12meses' => '0.00',
                'precio_m2_18meses' => '0.00',
                'precio_18meses' => '0.00',
                'precio_m2_24meses' => '0.00',
                'precio_24meses' => '0.00',
                'precio_m2_36meses' => '0.00',
                'precio_36meses' => '0.00',
                'estatus' => '0',
                'activo' => '0',
                'coord' => json_encode([0.05, 0.1]),
                'style' => 'reservado',
                'group' => json_encode(['Reservado']),
                'capa_id' => $capa->id
            ],
            [
                'id' => '2',
                'title' => 'Lote 2',
                'area' => '236.16',
                'layer' => 'lot-map',
                'action' => 'sidebar',
                'type' => 'circle',
                'disable' => false,
                'desc' => 'Manzana: 1, lote: 2',
                'ubicacion' => 'SANTA ANITA',
                'superficie_frente' => '12.02',
                'ubicacion_ne' => 'EN 20.04m LINDA CON LOTE 3 MANZANA 1',
                'ubicacion_se' => 'EN LINEA QUEBRADA 1.50m, 3.00m Y 1.48m LINDA CON LOTE 48 DE FRACCIONAMIENTO LA',
                'ubicacion_so' => 'EN LC 16.46m Y LC 7.08m LINDA CON LOTE 1 MANZANA 1',
                'ubicacion_no' => 'EN LC 12.02m LINDA CON VIALIDAD SANTA ANITA',
                'manzana' => '1',
                'lote' => '2',
                'fecha_entrega' => 'JUL 2024',
                'precio_m2_contado' => '8590.39',
                'precio_contado' => '2028706.50',
                'precio_m2_6meses' => null,
                'precio_6meses' => null,
                'precio_m2_12meses' => '9062.39',
                'precio_12meses' => '2140174.02',
                'precio_m2_18meses' => '9279.51',
                'precio_18meses' => '2191449.08',
                'precio_m2_24meses' => '9439.99',
                'precio_24meses' => '2229348.04',
                'precio_m2_36meses' => '9864.79',
                'precio_36meses' => '2329668.81',
                'estatus' => '2',
                'activo' => '1',
                'coord' => json_encode([0.05, 0.15]),
                'style' => 'vendido',
                'group' => json_encode(['Vendido']),
                'capa_id' => $capa->id
            ],
            [
                'id' => '3',
                'title' => 'Lote 3',
                'area' => '234.76',
                'layer' => 'lot-map',
                'action' => 'sidebar',
                'type' => 'circle',
                'disable' => false,
                'desc' => 'Manzana: 1, lote: 3',
                'ubicacion' => 'SANTA ANITA',
                'superficie_frente' => '12.02',
                'ubicacion_ne' => 'EN 20.67m LINDA CON LOTE 4 MANZANA 1',
                'ubicacion_se' => 'EN LINEA QUEBRADA 0.54m, 3 TRAMOS DE 3.00m Y 1.50m LINDA CON LOTE 48 DE',
                'ubicacion_so' => 'EN 20.04m LINDA CON LOTE 2 MANZANA 1',
                'ubicacion_no' => 'EN LC 12.02m LINDA CON VIALIDAD SANTA ANITA',
                'manzana' => '1',
                'lote' => '3',
                'fecha_entrega' => 'JUL 2024',
                'precio_m2_contado' => '8590.39',
                'precio_contado' => '2015993.08',
                'precio_m2_6meses' => null,
                'precio_6meses' => null,
                'precio_m2_12meses' => '9062.39',
                'precio_12meses' => '2126908.38',
                'precio_m2_18meses' => '9279.51',
                'precio_18meses' => '2177912.74',
                'precio_m2_24meses' => '9439.99',
                'precio_24meses' => '2215582.40',
                'precio_m2_36meses' => '9864.79',
                'precio_36meses' => '2315514.64',
                'estatus' => '0',
                'activo' => '1',
                'coord' => json_encode([0.1, 0.15]),
                'style' => 'libre',
                'group' => json_encode(['Libres']),
                'capa_id' => $capa->id
            ],
        ];

        foreach ($ubicaciones as $ubicacion) {
            Ubicacion::create($ubicacion);
        }

        $this->info('Test user, administrador, empresa, mapa, capa, and ubicaciones have been created successfully.');


    }
}
