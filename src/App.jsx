import { useState, useEffect, useMemo } from "react";
import { db, auth } from "./config/firebase";
import * as XLSX from "xlsx";
import { onAuthStateChanged, signOut } from "firebase/auth";
import {
  collection,
  addDoc,
  deleteDoc,
  doc,
  onSnapshot,
  query,
  orderBy,
  writeBatch,
  updateDoc,
} from "firebase/firestore";
import { StatCard } from "./components/StatCard";
import { StockForm } from "./components/StockForm";
import { StockTable } from "./components/StockTable";
import { EditModal } from "./components/EditModal";
import { Login } from "./components/Login";
import {
  Coffee,
  Layers,
  ShieldAlert,
  Search,
  LogOut,
  User,
} from "lucide-react";
import { CategoryModal } from "./components/CategoryModal";

const stoklarKoleksiyonu = collection(db, "stoklar");
const kategorilerKoleksiyonu = collection(db, "kategoriler");

export default function App() {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [stoklar, setStoklar] = useState([]);
  const [kategoriler, setKategoriler] = useState([]);
  const [aramaSorgusu, setAramaSorgusu] = useState("");
  const [kategoriFiltresi, setKategoriFiltresi] = useState("Hepsi");
  const [isDataLoading, setIsDataLoading] = useState(true);
  const [isKategoriModalOpen, setIsKategoriModalOpen] = useState(false);

  const [duzenlenenUrunler, setDuzenlenenUrunler] = useState({});
  const [secilenUrun, setSecilenUrun] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setAuthLoading(false);
    });
    return () => unsubscribeAuth();
  }, []);

  // Ürünleri Dinleyen useEffect
  useEffect(() => {
    if (!user) return;
    const q = query(stoklarKoleksiyonu, orderBy("urun_adi", "asc"));

    const unsubscribeSnapshot = onSnapshot(
      q,
      (snapshot) => {
        const urunlerListesi = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setStoklar(urunlerListesi);
        setIsDataLoading(false);
      },
      (error) => {
        console.error("Firestore veri okuma hatası:", error);
        setIsDataLoading(false);
      },
    );

    return () => unsubscribeSnapshot();
  }, [user]);

  // Kategorileri Dinleyen useEffect
  useEffect(() => {
    if (!user) return;
    const q = query(kategorilerKoleksiyonu);

    const unsubscribeKategori = onSnapshot(
      q,
      (snapshot) => {
        const gelenKategoriler = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setKategoriler(gelenKategoriler);
      },
      (error) => {
        console.error("Kategoriler okunurken hata oluştu:", error);
      },
    );

    return () => unsubscribeKategori();
  }, [user]);

  // Kategorileri Türkçe karakterlere duyarlı (A-Z) olarak sıralayan useMemo 🎉
  const siraliKategoriler = useMemo(() => {
    return [...kategoriler].sort((a, b) =>
      (a.isim || "").localeCompare(b.isim || "", "tr", { sensitivity: "base" }),
    );
  }, [kategoriler]);

  // Yeni Kategori Ekleme
  const handleKategoriEkle = async (kategoriAdi) => {
    try {
      await addDoc(kategorilerKoleksiyonu, {
        isim: kategoriAdi,
        olusturulma_tarihi: new Date(),
      });
    } catch (error) {
      console.error("Kategori eklenirken hata oluştu: ", error);
    }
  };

  // Kategori Silme
  const handleKategoriSil = async (kategoriId) => {
    try {
      await deleteDoc(doc(db, "kategoriler", kategoriId));
    } catch (error) {
      console.error("Kategori silinirken hata oluştu: ", error);
    }
  };

  // Kategori Güncelleme
  const handleKategoriGuncelle = async (kategoriId, yeniKategoriAdi) => {
    try {
      const katRef = doc(db, "kategoriler", kategoriId);
      await updateDoc(katRef, { isim: yeniKategoriAdi });
    } catch (error) {
      console.error("Kategori güncellenirken hata oluştu: ", error);
    }
  };

  const handleSignOut = () => {
    if (confirm("Oturumu kapatmak istediğinize emin misiniz?")) signOut(auth);
  };

  const handleUrunEkle = async (yeniUrun) => {
    try {
      await addDoc(stoklarKoleksiyonu, yeniUrun);
    } catch (err) {
      console.error("Ekleme hatası:", err);
    }
  };

  const handleYerelGeciciKaydet = (id, guncelKartVerisi) => {
    setDuzenlenenUrunler((prev) => ({
      ...prev,
      [id]: guncelKartVerisi,
    }));
  };

  const handleDuzenleTikla = (urun) => {
    const guncelUrunVerisi =
      duzenlenenUrunler[urun.id] !== undefined
        ? { ...urun, ...duzenlenenUrunler[urun.id] }
        : urun;
    setSecilenUrun(guncelUrunVerisi);
    setIsModalOpen(true);
  };

  const handleTopluBatchKaydet = async () => {
    const degisenIdler = Object.keys(duzenlenenUrunler);
    if (degisenIdler.length === 0) return;

    setIsSaving(true);
    const batch = writeBatch(db);

    degisenIdler.forEach((id) => {
      const urunDokumaniRef = doc(db, "stoklar", id);
      batch.update(urunDokumaniRef, duzenlenenUrunler[id]);
    });

    try {
      await batch.commit();
      setDuzenlenenUrunler({});
    } catch (err) {
      console.error("Batch commit hatası:", err);
      alert("Değişiklikler buluta gönderilemedi.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleUrunSil = async (id) => {
    if (!confirm("Bu ürünü tamamen silmek istediğinize emin misiniz?")) return;
    try {
      const urunDokumani = doc(db, "stoklar", id);
      await deleteDoc(urunDokumani);
      if (duzenlenenUrunler[id] !== undefined) {
        const yeniDuzenlemeler = { ...duzenlenenUrunler };
        delete yeniDuzenlemeler[id];
        setDuzenlenenUrunler(yeniDuzenlemeler);
      }
    } catch (err) {
      console.error("Silme hatası:", err);
    }
  };

  const filtrelenmisStoklar = useMemo(() => {
    return stoklar.filter((urun) => {
      const isimEslesti = urun.urun_adi
        ?.toLowerCase()
        .includes(aramaSorgusu.toLowerCase());
      const kategoriEslesti =
        kategoriFiltresi === "Hepsi" || urun.kategori === kategoriFiltresi;
      return isimEslesti && kategoriEslesti;
    });
  }, [stoklar, aramaSorgusu, kategoriFiltresi]);

  const istatistikler = useMemo(() => {
    return stoklar.reduce(
      (acc, urun) => {
        const dMiktar =
          duzenlenenUrunler[urun.id] !== undefined
            ? duzenlenenUrunler[urun.id].depo_miktar
            : urun.depo_miktar || 0;
        const bMiktar =
          duzenlenenUrunler[urun.id] !== undefined
            ? duzenlenenUrunler[urun.id].bar_miktar
            : urun.bar_miktar || 0;
        const kritikEsik =
          duzenlenenUrunler[urun.id] !== undefined
            ? duzenlenenUrunler[urun.id].kritik_esik
            : urun.kritik_esik || 0;

        const toplamMiktar = dMiktar + bMiktar;

        acc.toplamUrun += 1;
        if (toplamMiktar <= kritikEsik) acc.kritikSeviye += 1;
        return acc;
      },
      { toplamUrun: 0, kritikSeviye: 0 },
    );
  }, [stoklar, duzenlenenUrunler]);

  const handleExcelFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();

    reader.onload = (event) => {
      try {
        const data = new Uint8Array(event.target.result);
        const workbook = XLSX.read(data, { type: "array" });
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];

        const hamSatirlar = XLSX.utils.sheet_to_json(worksheet, { defval: "" });

        if (hamSatirlar.length === 0) {
          alert("Excel dosyası boş.");
          return;
        }

        const düzenlenmişYüklemeListesi = [];
        let aktifKategori = "Genel";

        hamSatirlar.forEach((satir) => {
          const aciklama = String(satir["Açıklaması"] || "").trim();
          const anaBirim = String(satir["Ana Birim"] || "").trim();
          const gercekStok = satir["Gerçek Stok"];
          const kodu = String(satir["Kodu"] || "").trim();

          if (aciklama !== "" && anaBirim === "" && kodu === "") {
            aktifKategori = aciklama;
            return;
          }

          if (anaBirim !== "") {
            let finalStok = 0;
            if (
              gercekStok !== undefined &&
              gercekStok !== null &&
              gercekStok !== ""
            ) {
              finalStok = Number(gercekStok);
            }

            düzenlenmişYüklemeListesi.push({
              urun_adi: aciklama,
              kategoriAdi: aktifKategori,
              depo_miktar: finalStok,
              birim: anaBirim === "AD" ? "Adet (x)" : anaBirim,
            });
          }
        });

        handleTopluImport(düzenlenmişYüklemeListesi);
      } catch (error) {
        console.error("Excel ayrıştırma hatası:", error);
        alert("Excel okunurken bir hata oluştu.");
      }
    };

    reader.readAsArrayBuffer(file);
    e.target.value = "";
  };

  const handleTopluImport = async (aktarilacakVeri) => {
    if (!aktarilacakVeri || aktarilacakVeri.length === 0) {
      alert("Aktarılacak geçerli bir veri bulunamadı.");
      return;
    }

    if (
      !confirm(
        "Tüm eski verileri sildiyseniz, yeni kategori ve ürün listesini aktarmaya başlıyoruz. Emin misiniz?",
      )
    ) {
      return;
    }

    setIsSaving(true);

    try {
      const batch = writeBatch(db);

      const benzersizKategoriIsimleri = [
        ...new Set(aktarilacakVeri.map((item) => item.kategoriAdi)),
      ];

      const kategoriIdHaritasi = {};
      benzersizKategoriIsimleri.forEach((katIsmi) => {
        const yeniKatRef = doc(collection(db, "kategoriler"));
        kategoriIdHaritasi[katIsmi] = yeniKatRef.id;

        batch.set(yeniKatRef, {
          isim: katIsmi,
          olusturulma_tarihi: new Date(),
        });
      });

      aktarilacakVeri.forEach((urun) => {
        const urunRef = doc(collection(db, "stoklar"));
        const ilgiliKategoriId =
          kategoriIdHaritasi[urun.kategoriAdi] || "genel_id";

        batch.set(urunRef, {
          urun_adi: urun.urun_adi,
          kategori: ilgiliKategoriId,
          depo_miktar: urun.depo_miktar,
          bar_miktar: 0,
          kritik_esik: urun.kritik_esik || 5,
          birim: urun.birim,
          eklenme_tarihi: new Date(),
        });
      });

      await batch.commit();
      alert(
        "Kategoriler ve ürünler yeni mimariye göre başarıyla senkronize edildi!",
      );
    } catch (err) {
      console.error("Toplu aktarım hatası:", err);
      alert("Veritabanına yazılırken bir hata oluştu.");
    } finally {
      setIsSaving(false);
    }
  };

  if (authLoading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 text-xs">
        Yükleniyor...
      </div>
    );
  if (!user) return <Login />;

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 antialiased">
      <nav className="bg-white border-b border-gray-100 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-amber-800 p-2 rounded-xl text-white">
              <Coffee size={22} />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight text-gray-900">
                Addis Ababa Coffee
              </h1>
              <p className="text-xs text-gray-500 font-medium">
                Şube Depo Yönetimi
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-2 text-xs text-gray-600 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100 font-medium">
              <User size={14} className="text-gray-400" />
              {user.email}
            </div>
            <button
              onClick={handleSignOut}
              className="flex items-center gap-1.5 text-xs font-semibold text-red-600 bg-red-50 px-3 py-1.5 rounded-lg border border-red-100"
            >
              <LogOut size={14} /> Çıkış
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <StatCard
            title="Toplam Çeşit"
            value={istatistikler.toplamUrun}
            icon={<Layers size={20} className="text-blue-600" />}
            colorClass="bg-blue-50"
          />
          <StatCard
            title="Kritik Seviye"
            value={istatistikler.kritikSeviye}
            icon={<ShieldAlert size={20} className="text-red-600" />}
            colorClass={
              istatistikler.kritikSeviye > 0
                ? "bg-red-100 text-red-700"
                : "bg-gray-50"
            }
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          <div className="lg:col-span-1">
            {/* Form bileşenine sıralı kategoriler gönderildi 🎉 */}
            <StockForm
              onUrunEkle={handleUrunEkle}
              onUrunGuncelle={handleYerelGeciciKaydet}
              mevcutStoklar={stoklar}
              kategoriler={siraliKategoriler}
              onKategoriYonetimiAc={() => setIsKategoriModalOpen(true)}
            />
          </div>

          <div className="lg:col-span-2 space-y-4">
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col sm:flex-row gap-3 justify-between items-center">
              <div className="relative w-full sm:w-72">
                <Search
                  size={16}
                  className="absolute left-3 top-3.5 text-gray-400"
                />
                <input
                  type="text"
                  placeholder="Envanterde ara..."
                  value={aramaSorgusu}
                  onChange={(e) => setAramaSorgusu(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
              <div className="flex items-center gap-2">
                <label className="flex items-center gap-1.5 text-xs font-semibold text-emerald-800 bg-emerald-50 px-3 py-2 rounded-lg border border-emerald-200 cursor-pointer hover:bg-emerald-100 transition-all shadow-sm">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="text-emerald-700"
                  >
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="17 8 12 3 7 8" />
                    <line x1="12" y1="3" x2="12" y2="15" />
                  </svg>
                  <span>Excel İçe Aktar</span>
                  <input
                    type="file"
                    accept=".xlsx, .xls"
                    onChange={handleExcelFileChange}
                    className="hidden"
                  />
                </label>
              </div>

              {/* Filtre select alanı sıralı kategorileri kullanıyor 🎉 */}
              <select
                value={kategoriFiltresi}
                onChange={(e) => setKategoriFiltresi(e.target.value)}
                className="p-2 border border-gray-200 rounded-lg text-xs bg-white font-medium outline-none max-w-[160px] truncate"
              >
                <option value="Hepsi">Tüm Ürünler</option>
                {siraliKategoriler.map((kat) => (
                  <option key={kat.id} value={kat.id}>
                    {kat.isim}
                  </option>
                ))}
              </select>
            </div>

            {!isDataLoading && (
              <StockTable
                stoklar={filtrelenmisStoklar}
                onUrunSil={handleUrunSil}
                onDuzenleTikla={handleDuzenleTikla}
                duzenlenenUrunler={duzenlenenUrunler}
                onTopluKaydet={handleTopluBatchKaydet}
                isSaving={isSaving}
                kategoriler={siraliKategoriler}
              />
            )}
          </div>
        </div>
      </main>

      <EditModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSecilenUrun(null);
        }}
        urun={secilenUrun}
        onYerelGeciciKaydet={handleYerelGeciciKaydet}
        kategoriler={siraliKategoriler}
      />

      <CategoryModal
        isOpen={isKategoriModalOpen}
        onClose={() => setIsKategoriModalOpen(false)}
        kategoriler={siraliKategoriler}
        onKategoriEkle={handleKategoriEkle}
        onKategoriSil={handleKategoriSil}
        onKategoriGuncelle={handleKategoriGuncelle}
        mevcutStoklar={stoklar}
      />
    </div>
  );
}
