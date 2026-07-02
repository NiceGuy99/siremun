<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('remunerasi_details', function (Blueprint $table) {
            $table->id();

            $table->foreignId('remunerasi_period_id')
                ->constrained('remunerasi_periods')
                ->cascadeOnDelete();

            $table->foreignId('pegawai_id')
                ->constrained('pegawais')
                ->cascadeOnDelete();

            $table->decimal('gaji', 18, 2)->default(0);
            $table->decimal('honorarium', 18, 2)->default(0);
            $table->decimal('tunjangan_tetap', 18, 2)->default(0);
            $table->decimal('insentif_kerja', 18, 2)->default(0);
            $table->decimal('jasa_pelayanan', 18, 2)->default(0);
            $table->decimal('ffs', 18, 2)->default(0);
            $table->decimal('uang_makan', 18, 2)->default(0);
            $table->decimal('thr', 18, 2)->default(0);
            $table->decimal('gaji_13', 18, 2)->default(0);

            $table->decimal('potongan', 18, 2)->default(0);
            $table->decimal('pajak', 18, 2)->default(0);

            $table->decimal('total_bruto', 18, 2)->default(0);
            $table->decimal('total_potongan', 18, 2)->default(0);
            $table->decimal('total_diterima', 18, 2)->default(0);

            $table->text('keterangan')->nullable();

            $table->enum('status', [
                'draft',
                'verified',
                'approved',
                'published',
                'revised',
            ])->default('draft');

            $table->foreignId('verified_by')
                ->nullable()
                ->constrained('users')
                ->nullOnDelete();

            $table->foreignId('approved_by')
                ->nullable()
                ->constrained('users')
                ->nullOnDelete();

            $table->timestamp('verified_at')->nullable();
            $table->timestamp('approved_at')->nullable();
            $table->timestamp('published_at')->nullable();

            $table->timestamps();

            $table->unique(['remunerasi_period_id', 'pegawai_id'], 'uniq_period_pegawai');

            $table->index('status');
            $table->index('total_diterima');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('remunerasi_details');
    }
};