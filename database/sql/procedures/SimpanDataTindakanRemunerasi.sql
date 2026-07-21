USE remunerasi_app;

DROP PROCEDURE IF EXISTS SimpanDataTindakanRemunerasi;

DELIMITER $$
CREATE DEFINER=`admin`@`%` PROCEDURE `SimpanDataTindakanRemunerasi`(
    IN p_tgl_awal   DATETIME,
    IN p_tgl_akhir  DATETIME,
    IN p_ruangan    VARCHAR(255),
    IN p_jaminan    INT
)
    SQL SECURITY INVOKER
BEGIN
    SELECT
        pt.TANGGAL                                                              AS TANGGAL_PEMBAYARAN,
        p.NORM                                                                  AS NORM,
        tp.PENDAFTARAN                                                          AS NOPEN,
        p2.NOMOR                                                                AS NO_SEP,
        ref_jaminan.ID                                                          AS ID_PENJAMIN,
        master.getNamaLengkap(p.NORM)                                           AS NAMA_PASIEN,
        master.getNamaLengkapPegawai(d.NIP)                                    AS DOKTER_DPJP,
        ref_jaminan.DESKRIPSI                                                   AS JAMINAN,
        r.DESKRIPSI                                                             AS JENIS_RINCIAN,
        tm.TANGGAL                                                              AS TANGGAL_TINDAKAN,
        t.ID                                                                    AS ID_TINDAKAN,
        t.NAMA                                                                  AS NAMA_TINDAKAN,
        COALESCE(k_tm.RUANGAN, k_ruang.RUANGAN)                                AS ID_RUANGAN,
        mr.DESKRIPSI                                                            AS NAMA_RUANGAN,
        rt.TARIF                                                                AS TARIF,
        CASE WHEN rt.JENIS = 3
            THEN master.getPetugasMedisTindakanJSON(tm.ID)
            ELSE NULL
        END                                                                     AS TIM_PETUGAS_MEDIS,
        (rt.TARIF * rt.JUMLAH)                                                  AS SUB_TOTAL,
        tm.KUNJUNGAN                                                            AS KUNJUNGAN
    FROM pembayaran.pembayaran_tagihan pt
    INNER JOIN pembayaran.tagihan_pendaftaran tp
        ON pt.TAGIHAN = tp.TAGIHAN AND tp.UTAMA = 1
    INNER JOIN pembayaran.rincian_tagihan rt
        ON pt.TAGIHAN = rt.TAGIHAN AND rt.STATUS != 0
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
    LEFT JOIN layanan.tindakan_medis tm
        ON rt.REF_ID = tm.ID AND rt.JENIS = 3 AND tm.STATUS = 1
    LEFT JOIN master.tindakan t
        ON tm.TINDAKAN = t.ID
    LEFT JOIN pendaftaran.kunjungan k_tm
        ON tm.KUNJUNGAN = k_tm.NOMOR
    LEFT JOIN (
        SELECT NOPEN, RUANGAN
        FROM (
            SELECT
                k.NOPEN,
                k.RUANGAN,
                ROW_NUMBER() OVER (
                    PARTITION BY k.NOPEN
                    ORDER BY k.MASUK DESC
                ) AS rn
            FROM pendaftaran.kunjungan k
            INNER JOIN master.ruangan mr2 ON mr2.ID = k.RUANGAN
            WHERE mr2.JENIS_KUNJUNGAN = 3
        ) ranked
        WHERE rn = 1
    ) k_ruang ON tp.PENDAFTARAN = k_ruang.NOPEN
    LEFT JOIN master.ruangan mr
        ON mr.ID = COALESCE(k_tm.RUANGAN, k_ruang.RUANGAN)
    WHERE pt.STATUS = 2
      AND pt.JENIS = 1
      AND pt.JENIS_LAYANAN_ID = 1
      AND rt.JENIS = 3
      AND tm.STATUS = 1
      AND pt.TANGGAL BETWEEN p_tgl_awal AND p_tgl_akhir
      AND (p_ruangan IS NULL OR p_ruangan = '' OR COALESCE(k_tm.RUANGAN, k_ruang.RUANGAN) = p_ruangan)
      AND (p_jaminan IS NULL OR p_jaminan = 0  OR ref_jaminan.ID = p_jaminan);
END$$
DELIMITER ;
