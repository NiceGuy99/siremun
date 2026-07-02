<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('remunerasi_periods', function (Blueprint $table) {
            $table->id();

            $table->unsignedTinyInteger('bulan');
            $table->unsignedSmallInteger('tahun');
            $table->string('nama_periode', 100);

            $table->enum('status', [
                'draft',
                'imported',
                'verified',
                'approved',
                'published',
                'closed',
            ])->default('draft');

            $table->foreignId('created_by')
                ->nullable()
                ->constrained('users')
                ->nullOnDelete();

            $table->foreignId('approved_by')
                ->nullable()
                ->constrained('users')
                ->nullOnDelete();

            $table->timestamp('published_at')->nullable();
            $table->timestamp('closed_at')->nullable();

            $table->timestamps();

            $table->unique(['bulan', 'tahun']);
            $table->index('status');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('remunerasi_periods');
    }
};