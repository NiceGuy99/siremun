<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('remunerasi_import_errors', function (Blueprint $table) {
            $table->id();

            $table->foreignId('remunerasi_import_batch_id')
                ->constrained('remunerasi_import_batches')
                ->cascadeOnDelete();

            $table->unsignedInteger('row_number');
            $table->text('error_message');
            $table->json('raw_data')->nullable();

            $table->timestamps();

            $table->index('row_number');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('remunerasi_import_errors');
    }
};