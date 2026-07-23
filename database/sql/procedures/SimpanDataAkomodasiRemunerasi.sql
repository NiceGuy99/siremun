USE remunerasi_app;

DROP PROCEDURE IF EXISTS SimpanDataAkomodasiRemunerasi;

DELIMITER $$
CREATE DEFINER=`admin`@`%` PROCEDURE `SimpanDataAkomodasiRemunerasi`(
    IN p_tgl_awal   DATETIME,
    IN p_tgl_akhir  DATETIME,
    IN p_ruangan    VARCHAR(255),
    IN p_jaminan    INT
)
    SQL SECURITY INVOKER
BEGIN
    SELECT
        k_rt.MASUK                                  AS TANGGAL,
        p.NORM                                      AS NORM,
        tp.PENDAFTARAN                              AS NOPEN,
        p2.NOMOR                                    AS NO_SEP,
        ref_jaminan.ID                              AS ID_PENJAMIN,
        master.getNamaLengkap(p.NORM)               AS NAMA_PASIEN,
        master.getNamaLengkapPegawai(d.NIP)         AS NAMA_DPJP,
        ref_jaminan.DESKRIPSI                       AS JAMINAN,
        r.DESKRIPSI                                 AS JENIS_RINCIAN,
        rt.JUMLAH                                   AS TOTAL_HARI,
        k_rt.RUANGAN                                AS ID_RUANGAN,
        k_rt.MASUK                                  AS MASUK,
        k_rt.KELUAR                                 AS KELUAR,
        mr.DESKRIPSI                                AS NAMA_RUANGAN,
        rt.TARIF                                    AS TARIF,
        (rt.TARIF * rt.JUMLAH)                      AS SUB_TOTAL
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
    LEFT JOIN pendaftaran.kunjungan k_rt
        ON rt.REF_ID = k_rt.NOMOR
    LEFT JOIN master.ruangan mr
        ON mr.ID = k_rt.RUANGAN
    WHERE k_rt.MASUK BETWEEN p_tgl_awal AND p_tgl_akhir
      AND rt.JENIS = 2
      AND rt.JUMLAH != 0
      AND pt.STATUS = 2
      AND pt.JENIS = 1
      AND pt.JENIS_LAYANAN_ID = 1
      AND (p_ruangan IS NULL OR p_ruangan = '' OR k_rt.RUANGAN = p_ruangan)
      AND (p_jaminan IS NULL OR p_jaminan = 0 OR ref_jaminan.ID = p_jaminan);
END$$
DELIMITER ;
