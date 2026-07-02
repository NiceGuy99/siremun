<?php

namespace App\Models\External;

use Illuminate\Database\Eloquent\Model;

class MasterPegawai extends Model
{
    protected $connection = 'mysql_master';

    protected $table = 'pegawai';

    protected $primaryKey = 'ID';

    public $timestamps = false;

    protected $keyType = 'int';

    public $incrementing = true;

    protected $guarded = [];

    protected $casts = [
        'ID' => 'integer',
        'JENIS_KELAMIN' => 'integer',
        'NON_PEGAWAI' => 'integer',
        'STATUS' => 'integer',
        'TANGGAL_LAHIR' => 'datetime',
        'TANGGAL' => 'datetime',
    ];
}
