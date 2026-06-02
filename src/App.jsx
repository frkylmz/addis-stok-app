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
  Sun,
  Moon,
} from "lucide-react";
import { CategoryModal } from "./components/CategoryModal";

const stoklarKoleksiyonu = collection(db, "stoklar");
const kategorilerKoleksiyonu = collection(db, "kategoriler");

const ADMIN_EMAILS = ["admin@addis.com"];

export default function App() {
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
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

  // 🌟 Dark Mode Durumu (Localstorage kontrolü ve temiz state referansı)
  const [darkMode, setDarkMode] = useState(() => {
    const hafizadakiMod = localStorage.getItem("theme");
    if (hafizadakiMod) return hafizadakiMod === "dark";
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  });

  // 🌟 Dark Mode Sınıfını HTML elementine hatasız ve senkronize uygulama
  useEffect(() => {
    const root = window.document.documentElement;
    if (darkMode) {
      root.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      root.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [darkMode]);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser && currentUser.email) {
        setIsAdmin(ADMIN_EMAILS.includes(currentUser.email.toLowerCase()));
      } else {
        setIsAdmin(false);
      }
      setAuthLoading(false);
    });
    return () => unsubscribeAuth();
  }, []);

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

  const siraliKategoriler = useMemo(() => {
    return [...kategoriler].sort((a, b) =>
      (a.isim || "").localeCompare(b.isim || "", "tr", { sensitivity: "base" }),
    );
  }, [kategoriler]);

  const handleKategoriEkle = async (kategoriAdi) => {
    if (!isAdmin) return;
    try {
      await addDoc(kategorilerKoleksiyonu, {
        isim: kategoriAdi,
        olusturulma_tarihi: new Date(),
      });
    } catch (error) {
      console.error("Kategori eklenirken hata oluştu: ", error);
    }
  };

  const handleKategoriSil = async (kategoriId) => {
    if (!isAdmin) return;
    try {
      await deleteDoc(doc(db, "kategoriler", kategoriId));
    } catch (error) {
      console.error("Kategori silinirken hata oluştu: ", error);
    }
  };

  const handleKategoriGuncelle = async (kategoriId, yeniKategoriAdi) => {
    if (!isAdmin) return;
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
    if (!isAdmin) return;
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
    if (!isAdmin) return;
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

  // 🌟 Düzenleme: Veritabanındaki string kategori yapısına göre filtreleme optimizasyonu
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
    if (!isAdmin) return;
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
    if (!isAdmin) return;
  };

  if (authLoading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 text-xs text-gray-500">
        Yükleniyor...
      </div>
    );
  if (!user) return <Login />;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100 antialiased transition-colors duration-200">
      {/* Navbar Alanı */}
      <nav className="bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="bg-amber-800 dark:bg-amber-700 p-2 rounded-xl text-white flex-shrink-0">
              <Coffee size={20} />
            </div>
            <div className="min-w-0">
              <h1 className="text-sm sm:text-lg font-bold tracking-tight text-gray-900 dark:text-white truncate">
                Addis Ababa Coffee
              </h1>
              <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 font-medium truncate">
                Şube Depo Yönetimi{" "}
                {isAdmin && (
                  <span className="text-amber-700 dark:text-amber-500 font-bold">
                    (Admin)
                  </span>
                )}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0">
            {/* 🌟 AKTİF/PASİF SÜPER TASARIMLI DARK MODE BUTONU */}
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400 border border-gray-100 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 transition shadow-sm"
              title={darkMode ? "Aydınlık Moda Geç" : "Karanlık Moda Geç"}
            >
              {darkMode ? (
                <Sun size={16} className="text-amber-400" />
              ) : (
                <Moon size={16} />
              )}
            </button>

            <div className="hidden md:flex items-center gap-2 text-xs text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-800 px-3 py-1.5 rounded-lg border border-gray-100 dark:border-gray-700 font-medium max-w-[200px] truncate">
              <User size={14} className="text-gray-400 flex-shrink-0" />
              <span className="truncate">{user.email}</span>
            </div>

            <button
              onClick={handleSignOut}
              className="flex items-center gap-1.5 text-xs font-semibold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/40 px-2.5 py-1.5 sm:px-3 sm:py-1.5 rounded-lg border border-red-100 dark:border-red-900/60 hover:bg-red-100 dark:hover:bg-red-900/40 transition"
            >
              <LogOut size={14} />{" "}
              <span className="hidden sm:inline">Çıkış</span>
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* İstatistikler */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <StatCard
            title="Toplam Çeşit"
            value={istatistikler.toplamUrun}
            icon={
              <Layers size={20} className="text-blue-600 dark:text-blue-400" />
            }
            colorClass="bg-blue-50 dark:bg-blue-950/30"
          />
          <StatCard
            title="Kritik Seviye"
            value={istatistikler.kritikSeviye}
            icon={
              <ShieldAlert
                size={20}
                className="text-red-600 dark:text-red-400"
              />
            }
            colorClass={
              istatistikler.kritikSeviye > 0
                ? "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300"
                : "bg-gray-50 dark:bg-gray-900/40"
            }
          />
        </div>

        {/* Ana Izgara Yapısı */}
        <div
          className={`grid grid-cols-1 ${isAdmin ? "lg:grid-cols-3" : "lg:grid-cols-1"} gap-6 items-start`}
        >
          {/* Sol Kolon: StockForm */}
          {isAdmin && (
            <div className="lg:col-span-1 w-full">
              <StockForm
                onUrunEkle={handleUrunEkle}
                onUrunGuncelle={handleYerelGeciciKaydet}
                mevcutStoklar={stoklar}
                kategoriler={siraliKategoriler}
                onKategoriYonetimiAc={() => setIsKategoriModalOpen(true)}
              />
            </div>
          )}

          {/* Sağ Kolon (Tablo ve Arama Filtreleri Alanı) */}
          <div
            className={
              isAdmin ? "lg:col-span-2 space-y-4 w-full" : "space-y-4 w-full"
            }
          >
            <div className="bg-white dark:bg-gray-900 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 flex flex-col md:flex-row gap-3 justify-between items-stretch md:items-center">
              <div className="relative w-full md:w-72">
                <Search
                  size={16}
                  className="absolute left-3 top-3.5 text-gray-400 dark:text-gray-500"
                />
                <input
                  type="text"
                  placeholder="Envanterde ara..."
                  value={aramaSorgusu}
                  onChange={(e) => setAramaSorgusu(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-amber-500 dark:focus:ring-amber-600"
                />
              </div>

              <div className="flex flex-row items-center gap-2 w-full md:w-auto justify-between md:justify-end">
                {/* Excel Butonu (Sadece Admin) */}
                {isAdmin && (
                  <label className="flex items-center justify-center gap-1.5 text-xs font-semibold text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 px-3 py-2.5 md:py-2 rounded-lg border border-emerald-200 dark:border-emerald-900/60 cursor-pointer hover:bg-emerald-100 dark:hover:bg-emerald-900/40 transition-all shadow-sm flex-1 md:flex-initial">
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
                      className="text-emerald-700 dark:text-emerald-400"
                    >
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                      <polyline points="17 8 12 3 7 8" />
                      <line x1="12" y1="3" x2="12" y2="15" />
                    </svg>
                    <span>Excel Yükle</span>
                    <input
                      type="file"
                      accept=".xlsx, .xls"
                      onChange={handleExcelFileChange}
                      className="hidden"
                    />
                  </label>
                )}

                {/* 🌟 Düzenleme: value kısmını kat.id yerine kat.isim yaptık */}
                <select
                  value={kategoriFiltresi}
                  onChange={(e) => setKategoriFiltresi(e.target.value)}
                  className="p-2.5 md:p-2 border border-gray-200 dark:border-gray-700 rounded-lg text-xs bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-medium outline-none w-full md:max-w-[160px] truncate flex-1 md:flex-initial"
                >
                  <option value="Hepsi">Tüm Ürünler</option>
                  {siraliKategoriler.map((kat) => (
                    <option key={kat.id} value={kat.isim}>
                      {kat.isim}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Tablo Alanı */}
            {!isDataLoading && (
              <StockTable
                stoklar={filtrelenmisStoklar}
                onUrunSil={handleUrunSil}
                onDuzenleTikla={handleDuzenleTikla}
                duzenlenenUrunler={duzenlenenUrunler}
                onTopluKaydet={handleTopluBatchKaydet}
                isSaving={isSaving}
                kategoriler={siraliKategoriler}
                isAdmin={isAdmin}
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
        isAdmin={isAdmin}
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
