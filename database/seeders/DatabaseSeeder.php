<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        if (! User::where('email', 'transource.hr@gmail.com')->exists()) {
            User::create([
                'name' => 'Admin User',
                'email' => 'transource.hr@gmail.com',
                'role' => 'admin',
                'password' => bcrypt('Bagauchi@9836'),
                'email_verified_at' => now(),
            ]);
        }

        if (! User::where('email', 'admin@example.com')->exists()) {
            User::create([
                'name' => 'System Admin',
                'email' => 'admin@example.com',
                'role' => 'admin',
                'password' => bcrypt('admin123'),
                'email_verified_at' => now(),
            ]);
        }
    }
}
