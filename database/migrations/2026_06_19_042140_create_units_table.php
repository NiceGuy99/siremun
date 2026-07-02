<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('units', function (Blueprint $table) {
            $table->id();
            $table->string('kode', 30)->nullable()->unique();
            $table->string('nama', 150);
            $table->foreignId('parent_id')->nullable()->constrained('units')->nullOnDelete();
            $table->boolean('status')->default(true);
            $table->timestamps();

            $table->index('nama');
            $table->index('status');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('units');
    }
};