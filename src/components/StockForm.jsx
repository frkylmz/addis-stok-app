import { useState, useEffect, useRef } from "react";
import { PlusCircle, RefreshCw } from "lucide-react";

export const StockForm = ({
  onUrunEkle,
  onUrunGuncelle,
  mevcutStoklar,
  kategoriler,
  onKategoriYonetimiAc,
}) => {
  // İlk kategoriyi dinamik listeden güvenli bir şekilde almak için fallback mekanizması
  const varsayilanKategori =
    kategoriler && kategoriler.length > 0 ? kategoriler[0].id : "";

  const [urunAdi, setUrunAdi] = useState("");
  const [kategori, setKategori] = useState(varsayilanKategori);
  const [depoMiktar, setDepoMiktar] = useState("");
  const [barMiktar, setBarMiktar] = useState("");
  const [kritikEsik, setKritikEsik] = useState("2");

  // Autocomplete için durumlar
  const [oneriler, setOneriler] = useState([]);
  const [gosterOneriler, setGosterOneriler] = useState(false);
  const [eslesenUrun, setEslesenUrun] = useState(null);
  const wrapperRef = useRef(null);

  // Kategoriler yüklendiğinde başlangıç state'ini güncelle
  useEffect(() => {
    if (varsayilanKategori && !kategori) {
      setKategori(varsayilanKategori);
    }
  }, [varsayilanKategori, kategori]);

  // Dışarı tıklanınca öneri listesini kapat
  useEffect(() => {
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setGosterOneriler(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Ürün adı değiştikçe otomatik tamamlama ve varlık kontrolü yap
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
      className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 sticky top-24"
    >
      <div className="flex items-center gap-2 mb-5 pb-3 border-b border-gray-50">
        {eslesenUrun ? (
          <RefreshCw size={18} className="text-orange-600" />
        ) : (
          <PlusCircle size={18} className="text-amber-800" />
        )}
        <h2 className="text-sm font-bold text-gray-900 tracking-wider">
          {eslesenUrun ? "Mevcut Kaydı Güncelle" : "Yeni Envanter Kaydı"}
        </h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Ürün Adı & Autocomplete */}
        <div className="relative">
          <label className="block text-xs font-bold text-gray-600 tracking-wider mb-1">
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
            className="w-full px-3.5 py-2 border border-gray-200 rounded-xl text-sm font-semibold outline-none focus:ring-2 focus:ring-amber-500 transition-all"
          />

          {/* Autocomplete Açılır Penceresi */}
          {gosterOneriler && oneriler.length > 0 && (
            <div className="absolute z-50 w-full mt-1 bg-white border border-gray-100 rounded-xl shadow-lg max-h-48 overflow-y-auto divide-y divide-gray-50">
              {oneriler.map((u) => (
                <button
                  key={u.id}
                  type="button"
                  onClick={() => handleOneriSec(u)}
                  className="w-full px-4 py-2.5 text-left text-xs font-semibold text-gray-700 hover:bg-amber-50/50 transition flex items-center justify-between"
                >
                  <span>{u.urun_adi}</span>
                  <span className="text-[10px] bg-gray-100 text-gray-500 px-2 py-0.5 rounded-md font-normal+ truncate max-w-[100px]">
                    {u.kategori}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Kategori */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="block text-xs font-bold text-gray-600 tracking-wider">
              Kategori
            </label>
            {/* Kategorileri Yönet Butonu */}
            <button
              type="button"
              onClick={onKategoriYonetimiAc}
              className="text-[11px] text-amber-800 hover:text-amber-900 font-bold flex items-center gap-0.5 transition"
            >
              Kategorileri Yönet
            </button>
          </div>

          <select
            value={kategori}
            onChange={(e) => setKategori(e.target.value)}
            required
          >
            <option value="" disabled>
              Kategori Seçiniz
            </option>
            {kategoriler &&
              kategoriler.map((kat) => (
                <option key={kat.id} value={kat.id}>
                  {kat.isim} {/* Burası kat.id yerine kat.isim oldu! */}
                </option>
              ))}
          </select>
        </div>

        {/* Depo / Bar Ayrımı */}
        <div className="grid grid-cols-2 gap-3 bg-gray-50/50 p-3 rounded-xl border border-gray-100">
          <div>
            <label className="block text-[11px] font-bold text-amber-950 tracking-wider mb-1">
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
              className="w-full px-3 py-2 border border-gray-200 bg-white rounded-lg text-sm font-bold outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>
          <div>
            <label className="block text-[11px] font-bold text-amber-950 tracking-wider mb-1">
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
              className="w-full px-3 py-2 border border-gray-200 bg-white rounded-lg text-sm font-bold outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          {gosterToplamPaneli && (
            <div className="col-span-2 mt-1 bg-green-50/80 border border-green-100 text-green-800 text-xs font-bold p-2.5 rounded-lg flex items-center justify-between shadow-[inset_0_1px_2px_rgba(0,0,0,0.02)]">
              <span>Girilen Toplam Stok:</span>
              <span className="bg-green-600 text-white px-2 py-0.5 rounded-md font-extrabold text-[13px]">
                {hesaplananToplam}
              </span>
            </div>
          )}
        </div>

        {/* Kritik Eşik */}
        <div>
          <label className="block text-xs font-bold text-gray-600 tracking-wider mb-1">
            Kritik Eşik Kontrolü
          </label>
          <input
            type="number"
            min="0"
            step="any"
            required
            value={kritikEsik}
            onChange={(e) => setKritikEsik(e.target.value)}
            className="w-full px-3.5 py-2 border border-gray-200 rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-amber-500"
          />
        </div>

        <button
          type="submit"
          className={`w-full flex items-center justify-center gap-2 text-xs font-bold text-white py-3 px-4 rounded-xl shadow-sm transition-all duration-200 ${
            eslesenUrun
              ? "bg-orange-600 hover:bg-orange-700 ring-2 ring-orange-100"
              : "bg-amber-800 hover:bg-amber-900"
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
