import { useEffect, useState } from "react";
import { X, Check, Minus, Plus } from "lucide-react";

export const EditModal = ({
  isOpen,
  onClose,
  urun,
  onYerelGeciciKaydet,
  kategoriler,
  isAdmin, // App.jsx'ten gelen admin durumu 🎉
}) => {
  const [urunAdi, setUrunAdi] = useState("");
  const [kategori, setKategori] = useState("");
  const [depoMiktar, setDepoMiktar] = useState(0);
  const [barMiktar, setBarMiktar] = useState(0);
  const [kritikEsik, setKritikEsik] = useState(0);

  useEffect(() => {
    if (urun) {
      setUrunAdi(urun.urun_adi || "");
      setKategori(urun.kategori || "");
      setDepoMiktar(urun.depo_miktar || 0);
      setBarMiktar(urun.bar_miktar || 0);
      setKritikEsik(urun.kritik_esik || 0);
    }
  }, [urun, isOpen]);

  if (!isOpen || !urun) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onYerelGeciciKaydet(urun.id, {
      urun_adi: urunAdi,
      kategori,
      depoMiktar: Number(depoMiktar),
      bar_miktar: Number(barMiktar),
      kritik_esik: Number(kritikEsik),
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/55 backdrop-blur-sm">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
        <div className="bg-gray-50 px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-gray-900">
              {isAdmin
                ? "Ürün Kartını Düzenle (Admin)"
                : "Stok Tüketim Girişi (Personel)"}
            </h3>
            <p className="text-xs text-amber-800 font-medium mt-0.5">
              {isAdmin
                ? "Tüm alanlar değiştirilebilir."
                : "Sadece depo ve bar stok miktarlarını düşürebilirsiniz."}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Ürün Adı */}
          <div>
            <label className="block text-xs font-bold text-gray-600 tracking-wider mb-1">
              Ürün / Kalem Adı
            </label>
            <input
              type="text"
              required
              disabled={!isAdmin} // Admin değilse kilitli 🔒
              value={urunAdi}
              onChange={(e) => setUrunAdi(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm font-semibold outline-none focus:ring-2 focus:ring-amber-500 transition-all disabled:bg-gray-50 disabled:text-gray-500"
            />
          </div>

          {/* Kategori */}
          <div>
            <label className="block text-xs font-bold text-gray-600 tracking-wider mb-1">
              Kategori
            </label>
            <select
              value={kategori}
              onChange={(e) => setKategori(e.target.value)}
              required
              disabled={!isAdmin} // Admin değilse kilitli 🔒
              className="w-full px-3.5 py-2 border border-gray-200 rounded-xl text-sm font-semibold bg-white outline-none focus:ring-2 focus:ring-amber-500 transition-all disabled:bg-gray-50 disabled:text-gray-500"
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

          {/* Depo ve Bar Konum Ayarları */}
          <div className="grid grid-cols-2 gap-3 bg-gray-50 p-3 rounded-xl border border-gray-100">
            {/* Alt Kat Depo */}
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Alt Kat Depo
              </label>
              {isAdmin ? (
                // Admin ise doğrudan sayı girebiliyor
                <input
                  type="number"
                  min="0"
                  step="any"
                  required
                  value={depoMiktar}
                  onChange={(e) => setDepoMiktar(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 bg-white rounded-lg text-sm font-bold outline-none focus:ring-2 focus:ring-amber-500"
                />
              ) : (
                // Personel (User) ise kontrollü azaltma / artırma butonları 🌟
                <div className="flex items-center border border-gray-200 bg-white rounded-lg overflow-hidden h-[38px]">
                  <button
                    type="button"
                    onClick={() =>
                      setDepoMiktar((prev) => Math.max(0, Number(prev) - 1))
                    }
                    className="px-2 h-full text-red-600 hover:bg-gray-50 active:bg-gray-100 transition"
                  >
                    <Minus size={14} />
                  </button>
                  <span className="flex-1 text-center text-sm font-bold text-gray-800 select-none">
                    {depoMiktar}
                  </span>
                  <button
                    type="button"
                    onClick={() => setDepoMiktar((prev) => Number(prev) + 1)}
                    className="px-2 h-full text-emerald-600 hover:bg-gray-50 active:bg-gray-100 transition"
                  >
                    <Plus size={14} />
                  </button>
                </div>
              )}
            </div>

            {/* Üst Kat (Bar) */}
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Üst Kat (Bar)
              </label>
              {isAdmin ? (
                // Admin girdisi
                <input
                  type="number"
                  min="0"
                  step="any"
                  required
                  value={barMiktar}
                  onChange={(e) => setBarMiktar(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 bg-white rounded-lg text-sm font-bold outline-none focus:ring-2 focus:ring-amber-500"
                />
              ) : (
                // Personel (User) girdisi 🌟
                <div className="flex items-center border border-gray-200 bg-white rounded-lg overflow-hidden h-[38px]">
                  <button
                    type="button"
                    onClick={() =>
                      setBarMiktar((prev) => Math.max(0, Number(prev) - 1))
                    }
                    className="px-2 h-full text-red-600 hover:bg-gray-50 active:bg-gray-100 transition"
                  >
                    <Minus size={14} />
                  </button>
                  <span className="flex-1 text-center text-sm font-bold text-gray-800 select-none">
                    {barMiktar}
                  </span>
                  <button
                    type="button"
                    onClick={() => setBarMiktar((prev) => Number(prev) + 1)}
                    className="px-2 h-full text-emerald-600 hover:bg-gray-50 active:bg-gray-100 transition"
                  >
                    <Plus size={14} />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Kritik Eşik */}
          <div>
            <label className="block text-xs font-bold text-gray-600 tracking-wider mb-1">
              Kritik Eşik
            </label>
            <input
              type="number"
              min="0"
              step="any"
              required
              disabled={!isAdmin} // Admin değilse kilitli 🔒
              value={kritikEsik}
              onChange={(e) => setKritikEsik(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-amber-500 disabled:bg-gray-50 disabled:text-gray-500"
            />
          </div>

          {/* Aksiyon Butonları */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-gray-500 hover:bg-gray-50 border border-gray-200 rounded-xl transition"
            >
              Vazgeç
            </button>
            <button
              type="submit"
              className="flex items-center gap-1 px-4 py-2 text-xs font-bold text-white bg-amber-800 hover:bg-amber-900 rounded-xl shadow-sm transition"
            >
              <Check size={14} />
              {isAdmin ? "Listeye İşle" : "Miktarı Güncelle"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
