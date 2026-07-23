USE remunerasi_app;

DROP PROCEDURE IF EXISTS SimpanDataFarmasiRemunerasi;

DELIMITER $$
CREATE DEFINER=`admin`@`%` PROCEDURE `SimpanDataFarmasiRemunerasi`(
    IN p_tgl_awal   DATETIME,
    IN p_tgl_akhir  DATETIME,
    IN p_ruangan    VARCHAR(255),
    IN p_jaminan    INT
)
    SQL SECURITY INVOKER
BEGIN
    SELECT
        f.TANGGAL                                   AS TANGGAL,
        p.NORM                                      AS NORM,
        tp.PENDAFTARAN                              AS NOPEN,
        p2.NOMOR                                    AS SEP,
        ref_jaminan.ID                              AS ID_PENJAMIN,
        ref_jaminan.DESKRIPSI                       AS JAMINAN,
        master.getNamaLengkap(p.NORM)               AS NAMA_PASIEN,
        master.getNamaLengkapPegawai(d.NIP)         AS NAMA_DPJP,
        r.DESKRIPSI                                 AS JENIS_RINCIAN,
        b.ID                                        AS ID_BARANG,
        b.NAMA                                      AS NAMA_BARANG,
        rt.TARIF                                    AS HARGA_SATUAN,
        rt.JUMLAH                                   AS JUMLAH_OBAT,
        (rt.TARIF * rt.JUMLAH)                      AS TOTAL,
        k_f.RUANGAN                                 AS ID_RUANGAN,
        mr.DESKRIPSI                                AS NAMA_RUANGAN
    FROM pembayaran.pembayaran_tagihan pt
    INNER JOIN pembayaran.tagihan_pendaftaran tp
        ON pt.TAGIHAN = tp.TAGIHAN AND tp.UTAMA = 1
    INNER JOIN pembayaran.rincian_tagihan rt
        ON pt.TAGIHAN = rt.TAGIHAN
    LEFT JOIN pendaftaran.pendaftaran p
        ON tp.PENDAFTARAN = p.NOMOR
    LEFT JOIN pendaftaran.penjamin p2
        ON tp.PENDAFTARAN = p2.NOPEN
    LEFT JOIN master.referensi ref_jaminan
        ON p2.JENIS = ref_jaminan.ID AND ref_jaminan.JENIS = '10'
    LEFT JOIN pendaftaran.tujuan_pasien tp2
        ON tp.PENDAFTARAN = tp2.NOPEN
    LEFT JOIN master.dokter d
        ON tp2.DOKTER = d.ID
    LEFT JOIN master.referensi r
        ON rt.JENIS = r.ID AND r.JENIS = '30'
    LEFT JOIN layanan.farmasi f
        ON rt.REF_ID = f.ID AND rt.JENIS = 4
    LEFT JOIN inventory.barang b
        ON f.FARMASI  = b.ID
    LEFT JOIN pendaftaran.kunjungan k_f
        ON f.KUNJUNGAN = k_f.NOMOR
    LEFT JOIN master.ruangan mr
        ON mr.ID = k_f.RUANGAN
    WHERE f.TANGGAL BETWEEN p_tgl_awal AND p_tgl_akhir
      AND rt.JENIS = 4
      AND rt.JUMLAH != 0
      AND (p_ruangan IS NULL OR p_ruangan = '' OR k_f.RUANGAN = p_ruangan)
      AND (p_jaminan IS NULL OR p_jaminan = 0 OR ref_jaminan.ID = p_jaminan);
END$$
DELIMITER ;
