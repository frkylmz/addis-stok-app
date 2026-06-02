import { useState } from "react";
import { X, Plus, Trash2, Edit2, Check } from "lucide-react";

export const CategoryModal = ({
  isOpen,
  onClose,
  kategoriler,
  onKategoriEkle,
  onKategoriSil,
  onKategoriGuncelle,
  mevcutStoklar,
}) => {
  const [yeniKategori, setYeniKategori] = useState("");
  const [duzenlemeId, setDuzenlemeId] = useState(null);
  const [duzenlemeMetni, setDuzenlemeMetni] = useState("");

  if (!isOpen) return null;

  const handleEkle = (e) => {
    e.preventDefault();
    if (!yeniKategori.trim()) return;
    onKategoriEkle(yeniKategori.trim());
    setYeniKategori("");
  };

  const handleGuncelleBaslat = (kat) => {
    setDuzenlemeId(kat.id);
    setDuzenlemeMetni(kat.isim);
  };

  const handleGuncelleKaydet = (id) => {
    if (!duzenlemeMetni.trim()) {
      setDuzenlemeId(null);
      return;
    }
    onKategoriGuncelle(id, duzenlemeMetni.trim());
    setDuzenlemeId(null);
  };

  const handleSilKontrol = (kat) => {
    const bagliUrunSayisi = mevcutStoklar.filter(
      (u) => u.kategori === kat.id,
    ).length;

    if (bagliUrunSayisi > 0) {
      alert(
        `Bu kategoriyi silemezsiniz! İçerisinde bu kategoriye ait ${bagliUrunSayisi} adet ürün bulunuyor.`,
      );
      return;
    }

    if (
      confirm(`"${kat.isim}" kategorisini silmek istediğinize emin misiniz?`)
    ) {
      onKategoriSil(kat.id);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/55 backdrop-blur-sm transition-colors">
      <div className="bg-white dark:bg-[#111622] w-full max-w-md rounded-2xl shadow-xl border border-gray-100 dark:border-gray-800/60 overflow-hidden flex flex-col max-h-[85vh] transition-colors">
        {/* Header */}
        <div className="bg-gray-50 dark:bg-[#161b26] px-6 py-4 border-b border-gray-100 dark:border-gray-800/60 flex items-center justify-between shrink-0">
          <div>
            <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100">
              Kategorileri Yönet
            </h3>
            <p className="text-xs text-amber-800 dark:text-amber-500 font-medium mt-0.5">
              Kategori ekleyin, düzenleyin veya silin.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition"
          >
            <X size={18} />
          </button>
        </div>

        {/* Yeni Kategori Ekleme Formu */}
        <form
          onSubmit={handleEkle}
          className="p-6 pb-4 border-b border-gray-50 dark:border-gray-800/30 flex gap-2 shrink-0"
        >
          <input
            type="text"
            required
            placeholder="Örn: Tatlılar 🍰"
            value={yeniKategori}
            onChange={(e) => setYeniKategori(e.target.value)}
            className="flex-1 px-3.5 py-2 border border-gray-200 dark:border-gray-700/80 bg-white dark:bg-[#161b26] text-gray-900 dark:text-gray-100 text-sm font-semibold outline-none focus:ring-2 focus:ring-amber-500 dark:focus:ring-amber-600 transition-all placeholder-gray-400 dark:placeholder-gray-500 rounded-xl"
          />
          <button
            type="submit"
            className="flex items-center justify-center p-2.5 bg-amber-800 hover:bg-amber-900 dark:bg-amber-700 dark:hover:bg-amber-600 text-white rounded-xl shadow-sm transition shrink-0"
          >
            <Plus size={18} />
          </button>
        </form>

        {/* Kategori Listesi */}
        <div className="flex-1 overflow-y-auto p-6 pt-2 divide-y divide-gray-100 dark:divide-gray-800/40">
          {kategoriler.length === 0 ? (
            <p className="text-xs text-center text-gray-400 dark:text-gray-500 py-6 font-medium">
              Henüz kategori eklenmemiş.
            </p>
          ) : (
            kategoriler.map((kat) => (
              <div
                key={kat.id}
                className="py-2.5 flex items-center justify-between gap-2 group"
              >
                {duzenlemeId === kat.id ? (
                  <div className="flex items-center gap-2 flex-1">
                    <input
                      type="text"
                      value={duzenlemeMetni}
                      onChange={(e) => setDuzenlemeMetni(e.target.value)}
                      className="flex-1 px-2 py-1 text-xs font-semibold border border-amber-500 dark:border-amber-600 bg-white dark:bg-[#161b26] text-gray-900 dark:text-gray-100 rounded-lg outline-none focus:ring-2 focus:ring-amber-200 dark:focus:ring-amber-900/50"
                      autoFocus
                    />
                    <button
                      onClick={() => handleGuncelleKaydet(kat.id)}
                      className="p-1.5 bg-green-50 dark:bg-green-950/40 text-green-600 dark:text-green-400 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/60 transition"
                    >
                      <Check size={14} />
                    </button>
                    <button
                      onClick={() => setDuzenlemeId(null)}
                      className="p-1.5 bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ) : (
                  <>
                    <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                      {kat.isim}
                    </span>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
                      <button
                        onClick={() => handleGuncelleBaslat(kat)}
                        className="p-1.5 text-gray-400 dark:text-gray-500 hover:text-amber-800 dark:hover:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/30 rounded-lg transition"
                      >
                        <Edit2 size={13} />
                      </button>
                      <button
                        onClick={() => handleSilKontrol(kat)}
                        className="p-1.5 text-gray-400 dark:text-gray-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
