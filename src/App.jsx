import { useState, useEffect, useMemo } from "react";
import { db, auth } from "./config/firebase";
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

export default function App() {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [stoklar, setStoklar] = useState([]);
  const [aramaSorgusu, setAramaSorgusu] = useState("");
  const [kategoriFiltresi, setKategoriFiltresi] = useState("Hepsi");
  const [isDataLoading, setIsDataLoading] = useState(true);

  // Toplu Kayıt ve Modal Stateleri
  const [duzenlenenUrunler, setDuzenlenenUrunler] = useState({});
  const [secilenUrun, setSecilenUrun] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const stoklarKoleksiyonu = collection(db, "stoklar");

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
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

  // Hem formdaki autocomplete tetiklemesi hem de modal düzenlemesi bu merkezi havuzda birleşir
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
        if (urun.kategori === "Kahve" && urun.birim === "Kilo (kg)")
          acc.kahveAgirlikKg += toplamMiktar;
        return acc;
      },
      { toplamUrun: 0, kritikSeviye: 0, kahveAgirlikKg: 0 },
    );
  }, [stoklar, duzenlenenUrunler]);

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
            <div className="hidden sm:flex items-center flex items-center gap-4 gap-2 text-xs text-gray-600 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100 font-medium">
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
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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
          <StatCard
            title="Toplam Çekirdek"
            value={`${istatistikler.kahveAgirlikKg} kg`}
            icon={<Coffee size={20} className="text-emerald-600" />}
            colorClass="bg-emerald-50"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          <div className="lg:col-span-1">
            <StockForm
              onUrunEkle={handleUrunEkle}
              onUrunGuncelle={handleYerelGeciciKaydet}
              mevcutStoklar={stoklar}
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
              <select
                value={kategoriFiltresi}
                onChange={(e) => setKategoriFiltresi(e.target.value)}
                className="p-2 border border-gray-200 rounded-lg text-xs bg-white font-medium outline-none"
              >
                <option value="Hepsi">Tüm Ürünler</option>
                <option value="Kahve">Kahveler</option>
                <option value="Şurup">Şuruplar</option>
                <option value="Süt">Sütler</option>
                <option value="Ekipman">Ekipmanlar</option>
                <option value="Diğer">Diğerleri</option>
              </select>
            </div>

            {isDataLoading ? (
              <div className="p-12 text-center text-sm font-medium text-gray-500 bg-white rounded-xl border border-gray-100">
                Bulut verileri senkronize ediliyor...
              </div>
            ) : (
              <StockTable
                stoklar={filtrelenmisStoklar}
                onUrunSil={handleUrunSil}
                onDuzenleTikla={handleDuzenleTikla}
                duzenlenenUrunler={duzenlenenUrunler}
                onTopluKaydet={handleTopluBatchKaydet}
                isSaving={isSaving}
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
      />
    </div>
  );
}
