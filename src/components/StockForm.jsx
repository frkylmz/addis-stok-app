import { useState, useEffect, useRef } from "react";
import { PlusCircle, RefreshCw } from "lucide-react";

export const StockForm = ({
  onUrunEkle,
  onUrunGuncelle,
  mevcutStoklar,
  kategoriler,
  onKategoriYonetimiAc,
}) => {
  const varsayilanKategori =
    kategoriler && kategoriler.length > 0 ? kategoriler[0].id : "";

  const [urunAdi, setUrunAdi] = useState("");
  const [kategori, setKategori] = useState(varsayilanKategori);
  const [depoMiktar, setDepoMiktar] = useState("");
  const [barMiktar, setBarMiktar] = useState("");
  const [kritikEsik, setKritikEsik] = useState("2");

  const [oneriler, setOneriler] = useState([]);
  const [gosterOneriler, setGosterOneriler] = useState(false);
  const [eslesenUrun, setEslesenUrun] = useState(null);
  const wrapperRef = useRef(null);

  const getKategoriIsmi = (katId) => {
    if (!kategoriler) return "Genel";
    const bulunan = kategoriler.find((k) => k.id === katId);
    return bulunan ? bulunan.isim : "Genel";
  };

  useEffect(() => {
    if (varsayilanKategori && !kategori) {
      setKategori(varsayilanKategori);
    }
  }, [varsayilanKategori, kategori]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setGosterOneriler(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (!urunAdi.trim()) {
      setOneriler([]);
      setEslesenUrun(null);
      return;
    }

    const filtreli = mevcutStoklar.filter((u) =>
      u.urun_adi.toLowerCase().includes(urunAdi.toLowerCase()),
    );
    setOneriler(filtreli);

    const tamEslesme = mevcutStoklar.find(
      (u) => u.urun_adi.toLowerCase() === urunAdi.trim().toLowerCase(),
    );

    if (tamEslesme) {
      setEslesenUrun(tamEslesme);
    } else {
      setEslesenUrun(null);
    }
  }, [urunAdi, mevcutStoklar]);

  const handleOneriSec = (urun) => {
    setUrunAdi(urun.urun_adi);
    setKategori(urun.kategori || varsayilanKategori);
    setKritikEsik(urun.kritik_esik);
    setDepoMiktar(urun.depo_miktar || 0);
    setBarMiktar(urun.bar_miktar || 0);
    setGosterOneriler(false);
    setEslesenUrun(urun);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const veriModeli = {
      urun_adi: urunAdi.trim(),
      kategori: kategori || varsayilanKategori,
      depo_miktar: Number(depoMiktar || 0),
      bar_miktar: Number(barMiktar || 0),
      kritik_esik: Number(kritikEsik || 0),
    };

    if (eslesenUrun) {
      onUrunGuncelle(eslesenUrun.id, veriModeli);
    } else {
      onUrunEkle(veriModeli);
    }

    setUrunAdi("");
    setKategori(varsayilanKategori);
    setDepoMiktar("");
    setBarMiktar("");
    setEslesenUrun(null);
  };

  const hesaplananToplam = Number(depoMiktar || 0) + Number(barMiktar || 0);
  const gosterToplamPaneli = depoMiktar !== "" || barMiktar !== "";

  return (
    <div
      ref={wrapperRef}
      className="bg-white dark:bg-gray-900 p-5 sm:p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 lg:sticky lg:top-24 transition-colors duration-200"
    >
      <div className="flex items-center gap-2 mb-5 pb-3 border-b border-gray-50 dark:border-gray-800">
        {eslesenUrun ? (
          <RefreshCw
            size={18}
            className="text-orange-600 dark:text-orange-400"
          />
        ) : (
          <PlusCircle
            size={18}
            className="text-amber-800 dark:text-amber-500"
          />
        )}
        <h2 className="text-sm font-bold text-gray-900 dark:text-white tracking-wider">
          {eslesenUrun ? "Mevcut Kaydı Güncelle" : "Yeni Envanter Kaydı"}
        </h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Ürün Adı & Autocomplete */}
        <div className="relative">
          <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 tracking-wider mb-1">
            Ürün / Kalem Adı
          </label>
          <input
            type="text"
            required
            placeholder="Örn: Bebeka 250 gr"
            value={urunAdi}
            onChange={(e) => {
              setUrunAdi(e.target.value);
              setGosterOneriler(true);
            }}
            onFocus={() => setGosterOneriler(true)}
            className="w-full px-3.5 py-2 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-semibold bg-white dark:bg-gray-800 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-amber-500 dark:focus:ring-amber-600 transition-all"
          />

          {/* Autocomplete Açılır Penceresi */}
          {gosterOneriler && oneriler.length > 0 && (
            <div className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl shadow-lg max-h-48 overflow-y-auto divide-y divide-gray-50 dark:divide-gray-700">
              {oneriler.map((u) => (
                <button
                  key={u.id}
                  type="button"
                  onClick={() => handleOneriSec(u)}
                  className="w-full px-4 py-2.5 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 hover:bg-amber-50/50 dark:hover:bg-amber-950/30 transition flex items-center justify-between"
                >
                  <span>{u.urun_adi}</span>
                  <span className="text-[10px] bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 px-2 py-0.5 rounded-md font-normal truncate max-w-[100px]">
                    {getKategoriIsmi(u.kategori)}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Kategori */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 tracking-wider">
              Kategori
            </label>
            <button
              type="button"
              onClick={onKategoriYonetimiAc}
              className="text-[11px] text-amber-800 dark:text-amber-500 hover:text-amber-900 dark:hover:text-amber-400 font-bold flex items-center gap-0.5 transition"
            >
              Kategorileri Yönet
            </button>
          </div>

          <select
            value={kategori}
            onChange={(e) => setKategori(e.target.value)}
            required
            className="w-full px-3.5 py-2 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-semibold bg-white dark:bg-gray-800 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-amber-500 dark:focus:ring-amber-600 transition-all"
          >
            <option value="" disabled>
              Kategori Seçiniz
            </option>
            {kategoriler &&
              kategoriler.map((kat) => (
                <option key={kat.id} value={kat.id}>
                  {kat.isim}
                </option>
              ))}
          </select>
        </div>

        {/* Depo / Bar Ayrımı */}
        <div className="grid grid-cols-2 gap-3 bg-gray-50/50 dark:bg-gray-950/40 p-3 rounded-xl border border-gray-100 dark:border-gray-800">
          <div>
            <label className="block text-[11px] font-bold text-amber-950 dark:text-amber-400 tracking-wider mb-1">
              Alt Kat Depo
            </label>
            <input
              type="number"
              min="0"
              step="any"
              required
              placeholder="0"
              value={depoMiktar}
              onChange={(e) => setDepoMiktar(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-lg text-sm font-bold text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-amber-500 dark:focus:ring-amber-600"
            />
          </div>
          <div>
            <label className="block text-[11px] font-bold text-amber-950 dark:text-amber-400 tracking-wider mb-1">
              Üst Kat (Bar)
            </label>
            <input
              type="number"
              min="0"
              step="any"
              required
              placeholder="0"
              value={barMiktar}
              onChange={(e) => setBarMiktar(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-lg text-sm font-bold text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-amber-500 dark:focus:ring-amber-600"
            />
          </div>

          {gosterToplamPaneli && (
            <div className="col-span-2 mt-1 bg-green-50/80 dark:bg-green-950/30 border border-green-100 dark:border-green-900/50 text-green-800 dark:text-green-300 text-xs font-bold p-2.5 rounded-lg flex items-center justify-between shadow-[inset_0_1px_2px_rgba(0,0,0,0.02)]">
              <span>Girilen Toplam Stok:</span>
              <span className="bg-green-600 dark:bg-green-700 text-white px-2 py-0.5 rounded-md font-extrabold text-[13px]">
                {hesaplananToplam}
              </span>
            </div>
          )}
        </div>

        {/* Kritik Eşik */}
        <div>
          <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 tracking-wider mb-1">
            Kritik Eşik Kontrolü
          </label>
          <input
            type="number"
            min="0"
            step="any"
            required
            value={kritikEsik}
            onChange={(e) => setKritikEsik(e.target.value)}
            className="w-full px-3.5 py-2 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-bold bg-white dark:bg-gray-800 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-amber-500 dark:focus:ring-amber-600"
          />
        </div>

        <button
          type="submit"
          className={`w-full flex items-center justify-center gap-2 text-xs font-bold text-white py-3 px-4 rounded-xl shadow-sm transition-all duration-200 ${
            eslesenUrun
              ? "bg-orange-600 hover:bg-orange-700 ring-2 ring-orange-100 dark:ring-orange-950"
              : "bg-amber-800 hover:bg-amber-900 dark:bg-amber-700 dark:hover:bg-amber-800"
          }`}
        >
          {eslesenUrun ? (
            <>
              <RefreshCw size={14} />
              Stokları Güncelle
            </>
          ) : (
            <>
              <PlusCircle size={14} />
              Stoklara Dahil Et
            </>
          )}
        </button>
      </form>
    </div>
  );
};
