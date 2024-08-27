<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class UserController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        return User::all();
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $this->validateRequest($request);

        $user = User::create([
            'type' => $request->type,
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
        ]);

        return response()->json($user, 201);
    }

    /**
     * Display the specified resource.
     */
    public function show($id)
    {
        return User::findOrFail($id);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, $id)
    {
        $this->validateRequest($request, $id);

        $user = User::findOrFail($id);

        $user->update([
            'type' => $request->type,
            'name' => $request->name,
            'email' => $request->email,
            'password' => $request->filled('password') ? Hash::make($request->password) : $user->password,
        ]);

        return response()->json($user, 200);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy($id)
    {
        $user = User::findOrFail($id);
        $user->delete();

        return response()->json(null, 204);
    }

    /**
     * Validate the request data.
     */
    protected function validateRequest(Request $request, $id = null)
    {
        $uniqueEmailRule = 'unique:users,email';

        if ($id) {
            $uniqueEmailRule .= ',' . $id;
        }

        $request->validate([
            'type' => 'required|in:admin,sales,client',
            'name' => 'required|string|max:255',
            'email' => ['required', 'string', 'email', 'max:255', $uniqueEmailRule],
            'password' => $id ? 'sometimes|required|string|min:8|confirmed' : 'required|string|min:8|confirmed',
        ]);
    }
}
