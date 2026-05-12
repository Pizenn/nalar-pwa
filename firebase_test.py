import firebase_admin
from firebase_admin import credentials
from firebase_admin import db
from datetime import datetime

# =================================
# FIREBASE SETUP
# =================================

cred = credentials.Certificate("serviceAccountKey.json")

firebase_admin.initialize_app(cred, {
    'databaseURL': 'https://nalar-pwa-default-rtdb.asia-southeast1.firebasedatabase.app'
})

firebase_ref = db.reference("history")

# =================================
# DATA DETEKSI
# =================================

masker = False
sarung_tangan = True
jas_lab = True

pelanggaran_masker = True
pelanggaran_sarung_tangan = False
pelanggaran_jas_lab = False

# =================================
# HITUNG PELANGGARAN
# =================================

pelanggaran_list = []

if pelanggaran_masker:
    pelanggaran_list.append("Masker")

if pelanggaran_sarung_tangan:
    pelanggaran_list.append("Sarung Tangan")

if pelanggaran_jas_lab:
    pelanggaran_list.append("Jas Lab")

total_pelanggaran = len(pelanggaran_list)

# =================================
# KIRIM HANYA JIKA ADA PELANGGARAN
# =================================

if total_pelanggaran > 0:

    data = {
        "timestamp": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
        "masker": masker,
        "sarung_tangan": sarung_tangan,
        "jas_lab": jas_lab,

        "pelanggaran_masker": pelanggaran_masker,
        "pelanggaran_sarung_tangan": pelanggaran_sarung_tangan,
        "pelanggaran_jas_lab": pelanggaran_jas_lab,

        "total_pelanggaran": total_pelanggaran,
        "status": "PELANGGARAN",
    }

    firebase_ref.push(data)

    print("DATA PELANGGARAN DIKIRIM KE FIREBASE")

else:
    print("AMAN - TIDAK ADA PELANGGARAN (TIDAK DIKIRIM)")