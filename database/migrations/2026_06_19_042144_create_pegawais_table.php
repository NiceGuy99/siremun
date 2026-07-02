<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('pegawais', function (Blueprint $table) {
            $table->id();

            $table->foreignId('user_id')
                ->nullable()
                ->constrained('users')
                ->nullOnDelete();

            $table->unsignedSmallInteger('source_pegawai_id')->unique();

            $table->string('nip', 30)->unique();
            $table->string('nama', 75);
            $table->string('panggilan', 15)->nullable();

            $table->string('gelar_depan', 25)->nullable();
            $table->string('gelar_belakang', 35)->nullable();

            $table->string('tempat_lahir', 35)->nullable();
            $table->dateTime('tanggal_lahir')->nullable();

            $table->tinyInteger('jenis_kelamin')->default(1);
            $table->tinyInteger('profesi')->nullable();
            $table->tinyInteger('smf')->nullable();

            $table->string('alamat', 150)->nullable();
            $table->char('rt', 3)->nullable();
            $table->char('rw', 3)->nullable();
            $table->char('kodepos', 5)->nullable();
            $table->char('wilayah', 10)->nullable();

            $table->boolean('non_pegawai')->default(false);
            $table->boolean('status_aktif')->default(true);

            $table->foreignId('unit_id')
                ->nullable()
                ->constrained('units')
                ->nullOnDelete();

            $table->foreignId('jabatan_id')
                ->nullable()
                ->constrained('jabatans')
                ->nullOnDelete();

            $table->foreignId('grade_id')
                ->nullable()
                ->constrained('grades')
                ->nullOnDelete();

            $table->string('bank', 100)->nullable();
            $table->string('rekening', 100)->nullable();

            $table->timestamp('source_updated_at')->nullable();

            $table->timestamps();

            $table->index('nama');
            $table->index('nip');
            $table->index('jenis_kelamin');
            $table->index('status_aktif');
            $table->index('non_pegawai');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('pegawais');
    }
};