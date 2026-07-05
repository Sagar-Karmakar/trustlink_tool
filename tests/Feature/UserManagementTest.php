<?php

use App\Models\User;
use Illuminate\Support\Facades\Auth;

test('non-admin users cannot access user management', function () {
    $user = User::factory()->create(['role' => 'user']);

    $response = $this->actingAs($user)->get('/users');

    $response->assertStatus(403);
});

test('admin users can access user management list', function () {
    $admin = User::factory()->create(['role' => 'admin']);

    $response = $this->actingAs($admin)->get('/users');

    $response->assertStatus(200);
});

test('admin can create a new user', function () {
    $admin = User::factory()->create(['role' => 'admin']);

    $response = $this->actingAs($admin)->post('/users', [
        'name' => 'New User',
        'email' => 'newuser@example.com',
        'role' => 'user',
        'password' => 'password123',
    ]);

    $response->assertRedirect('/users');
    $this->assertDatabaseHas('users', [
        'email' => 'newuser@example.com',
        'role' => 'user',
    ]);
});

test('admin can suspend a user', function () {
    $admin = User::factory()->create(['role' => 'admin']);
    $user = User::factory()->create(['role' => 'user', 'is_suspended' => false]);

    $response = $this->actingAs($admin)->patch("/users/{$user->id}/suspend");

    $response->assertRedirect('/users');
    $this->assertTrue($user->fresh()->is_suspended);
});

test('admin cannot suspend themselves', function () {
    $admin = User::factory()->create(['role' => 'admin', 'is_suspended' => false]);

    $response = $this->actingAs($admin)->patch("/users/{$admin->id}/suspend");

    $this->assertFalse($admin->fresh()->is_suspended);
});

test('admin cannot delete themselves', function () {
    $admin = User::factory()->create(['role' => 'admin']);

    $response = $this->actingAs($admin)->delete("/users/{$admin->id}");

    $this->assertDatabaseHas('users', ['id' => $admin->id]);
});

test('suspended users are logged out', function () {
    $user = User::factory()->create(['role' => 'user', 'is_suspended' => false]);

    $this->actingAs($user);
    $this->assertTrue(Auth::check());

    // Suspend the user
    $user->update(['is_suspended' => true]);

    // Send a request to dashboard which is protected by RedirectIfSuspended
    $response = $this->get('/dashboard');

    $response->assertRedirect('/login');
    $this->assertFalse(Auth::check());
});
