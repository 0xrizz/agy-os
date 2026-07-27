# Patch Staging Directory

Direktori ini digunakan khusus untuk menampung file patch (`.patch` atau `.diff`) hasil usulan modifikasi pada Target Repo [`website`](file:///d:/CLAUDE-PROJECT/website).

---

## 📌 Aturan Format Patch

1. Setiap file patch harus diberi nama deskriptif dengan tanggal atau ID spesifikasi:
   `YYYY-MM-DD-short-description.patch` (contoh: `2026-07-26-add-auth-middleware.patch`).
2. Gunakan format unified diff standar (`git diff` / `patch`).
3. Dilarang mengedit file target repositori langsung secara eksplisit tanpa menghasilkan file patch terlebih dahulu.

---

## 🧪 Menguji Patch

Untuk memverifikasi patch sebelum diterapkan pada repositori target:
```powershell
git apply --check harness/patches/2026-07-26-short-description.patch
```
