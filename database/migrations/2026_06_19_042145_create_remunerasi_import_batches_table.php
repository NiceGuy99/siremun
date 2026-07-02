<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('remunerasi_import_batches', function (Blueprint $table) {
            $table->id();

            $table->foreignId('remunerasi_period_id')
                ->constrained('remunerasi_periods')
                ->cascadeOnDelete();

            $table->string('filename');
            $table->unsignedInteger('total_rows')->default(0);
            $table->unsignedInteger('success_rows')->default(0);
            $table->unsignedInteger('failed_rows')->default(0);

            $table->enum('status', [
                'pending',
                'processing',
                'success',
                'partial_failed',
                'failed',
                'rolled_back',
            ])->default('pending');

            $table->foreignId('imported_by')
                ->nullable()
                ->constrained('users')
                ->nullOnDelete();

            $table->timestamp('imported_at')->nullable();

            $table->timestamps();

            $table->index('status');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('remunerasi_import_batches');
    }
};