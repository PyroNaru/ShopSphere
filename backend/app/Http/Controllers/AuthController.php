<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class AuthController extends Controller
{
    public function register(Request $r)
    {
        $d = $r->validate([
            'name'     => 'required|string|max:100',
            'email'    => 'required|email|unique:users,email',
            'password' => 'required|string|min:8',
            'contact'  => 'required|string|max:30',
            'address'  => 'required|string|max:255',
        ]);

        $u = User::create($d);

        return response()->json(['message' => 'Registered successfully.', 'user' => $u], 201);
    }

    public function login(Request $r)
    {
        $d = $r->validate([
            'email'    => 'required|email',
            'password' => 'required|string',
        ]);

        $u = User::where('email', $d['email'])->first();
        if (! $u || ! Hash::check($d['password'], $u->password)) {
            return response()->json(['message' => 'Invalid credentials.'], 401);
        }

        $u->tokens()->delete();

        return [
            'token' => $u->createToken('shopshpere')->plainTextToken,
            'user'  => $u,
        ];
    }

    public function me(Request $r)
    {
        return $r->user();
    }

    public function logout(Request $r)
    {
        $r->user()->currentAccessToken()->delete();
        return ['message' => 'Logged out.'];
    }
}