import { useState, useEffect, useRef } from "react";
import { PlusCircle, RefreshCw } from "lucide-react";

export const StockForm = ({ onUrunEkle, onUrunGuncelle, mevcutStoklar }) => {
  const [urunAdi, setUrunAdi] = useState("");
  const [kategori, setKategori] = useState("Kahve");
  const [birim, setBirim] = useState("Adet (x)");
  const [depoMiktar, setDepoMiktar] = useState("");
  const [barMiktar, setBarMiktar] = useState("");
  const [kritikEsik, setKritikEsik] = useState("2");

  // Autocomplete için durumlar
  const [oneriler, setOneriler] = useState([]);
  const [gosterOneriler, setGosterOneriler] = useState(false);
  const [eslesenUrun, setEslesenUrun] = useState(null);
  const wrapperRef = useRef(null);

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

    // İsim içerenleri filtrele (Öneri listesi için)
    const filtreli = mevcutStoklar.filter((u) =>
      u.urun_adi.toLowerCase().includes(urunAdi.toLowerCase()),
    );
    setOneriler(filtreli);

    // Birebir eşleşen ürün var mı kontrolü (Mod değişimi için)
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
    setKategori(urun.kategori);
    setBirim(urun.birim);
    setKritikEsik(urun.kritik_esik);
    // Güncelleme kolaylığı için mevcut miktarları inputlara çekelim
    setDepoMiktar(urun.depo_miktar || 0);
    setBarMiktar(urun.bar_miktar || 0);
    setGosterOneriler(false);
    setEslesenUrun(urun);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const veriModeli = {
      urun_adi: urunAdi.trim(),
      kategori,
      birim,
      depo_miktar: Number(depoMiktar || 0),
      bar_miktar: Number(barMiktar || 0),
      kritik_esik: Number(kritikEsik || 0),
    };

    if (eslesenUrun) {
      // Ürün zaten var, batch listesine güncelleme olarak pasla
      onUrunGuncelle(eslesenUrun.id, veriModeli);
    } else {
      // Yeni ürün ekleme işlemi
      onUrunEkle(veriModeli);
    }

    // Formu sıfırla
    setUrunAdi("");
    setDepoMiktar("");
    setBarMiktar("");
    setEslesenUrun(null);
  };

  // Anlık toplam hesaplama (Senkronizasyon)
  const hesaplananToplam = Number(depoMiktar || 0) + Number(barMiktar || 0);
  // Inputlardan en az birine giriş yapıldıysa veya autocomplete seçildiyse göster
  const gosterToplamPaneli = depoMiktar !== "" || barMiktar !== "";

  return (
    <div
      ref={wrapperRef}
      className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 sticky top-24"
    >
      <div className="flex items-center gap-2 mb-5 pb-3 border-b border-gray-50">
        {eslesenUrun ? (
          <RefreshCw size={18} className="text-orange-600 animate-spin-slow" />
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
                  <span className="text-[10px] bg-gray-100 text-gray-500 px-2 py-0.5 rounded-md font-normal">
                    {u.kategori}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Kategori & Birim */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold text-gray-600 tracking-wider mb-1">
              Kategori
            </label>
            <select
              value={kategori}
              onChange={(e) => setKategori(e.target.value)}
              className="w-full p-2.5 border border-gray-200 rounded-xl text-xs bg-white font-medium outline-none focus:ring-2 focus:ring-amber-500"
            >
              <option value="Kahve">Kahve ☕</option>
              <option value="Şurup">Şurup 🍯</option>
              <option value="Süt">Süt 🥛</option>
              <option value="Ekipman">Ekipman 🛠️</option>
              <option value="Diğer">Diğerleri 📦</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-600 tracking-wider mb-1">
              Ölçü Birimi
            </label>
            <select
              value={birim}
              onChange={(e) => setBirim(e.target.value)}
              className="w-full p-2.5 border border-gray-200 rounded-xl text-xs bg-white font-medium outline-none focus:ring-2 focus:ring-amber-500"
            >
              <option value="Adet (x)">Adet (x)</option>
              <option value="Gram (gr)">Gram (gr)</option>
              <option value="Kilo (kg)">Kilo (kg)</option>
              <option value="Litre (lt)">Litre (lt)</option>
            </select>
          </div>
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

          {/* İstediğin Anlık Toplam Miktar Gösterge Paneli */}
          {gosterToplamPaneli && (
            <div className="col-span-2 mt-1 bg-green-50/80 border border-green-100 text-green-800 text-xs font-bold p-2.5 rounded-lg flex items-center justify-between shadow-[inset_0_1px_2px_rgba(0,0,0,0.02)] animate-fadeIn">
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

        {/* Dinamik Buton Yapısı */}
        <button
          type="submit"
          className={`w-full flex items-center justify-center gap-2 text-xs font-bold text-white py-3 px-4 rounded-xl shadow-sm transition-all duration-200 ${
            eslesenUrun
              ? "bg-orange-600 hover:bg-orange-700 ring-2 ring-orange-100"
              : "bg-amber-850 hover:bg-amber-900"
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
