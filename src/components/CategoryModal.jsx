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
    // Ürünlerde artik kategori ID'si tutulduğu için direkt kat.id ile eşleştiriyoruz
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/55 backdrop-blur-sm">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-xl border border-gray-100 overflow-hidden flex flex-col max-h-[85vh]">
        <div className="bg-gray-50 px-6 py-4 border-b border-gray-100 flex items-center justify-between shrink-0">
          <div>
            <h3 className="text-sm font-bold text-gray-900">
              Kategorileri Yönet
            </h3>
            <p className="text-xs text-amber-800 font-medium mt-0.5">
              Kategori ekleyin, düzenleyin veya silin.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition"
          >
            <X size={18} />
          </button>
        </div>

        <form
          onSubmit={handleEkle}
          className="p-6 pb-4 border-b border-gray-50 flex gap-2 shrink-0"
        >
          <input
            type="text"
            required
            placeholder="Örn: Tatlılar 🍰"
            value={yeniKategori}
            onChange={(e) => setYeniKategori(e.target.value)}
            className="flex-1 px-3.5 py-2 border border-gray-200 rounded-xl text-sm font-semibold outline-none focus:ring-2 focus:ring-amber-500 transition-all"
          />
          <button
            type="submit"
            className="flex items-center justify-center p-2.5 bg-amber-800 hover:bg-amber-900 text-white rounded-xl shadow-sm transition"
          >
            <Plus size={18} />
          </button>
        </form>

        <div className="flex-1 overflow-y-auto p-6 pt-2 divide-y divide-gray-100">
          {kategoriler.length === 0 ? (
            <p className="text-xs text-center text-gray-400 py-6 font-medium">
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
                      className="flex-1 px-2 py-1 text-xs font-semibold border border-amber-500 rounded-lg outline-none focus:ring-2 focus:ring-amber-200"
                      autoFocus
                    />
                    <button
                      onClick={() => handleGuncelleKaydet(kat.id)}
                      className="p-1.5 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition"
                    >
                      <Check size={14} />
                    </button>
                    <button
                      onClick={() => setDuzenlemeId(null)}
                      className="p-1.5 bg-gray-50 text-gray-500 rounded-lg hover:bg-gray-100 transition"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ) : (
                  <>
                    <span className="text-xs font-semibold text-gray-700">
                      {kat.isim}
                    </span>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
                      <button
                        onClick={() => handleGuncelleBaslat(kat)}
                        className="p-1.5 text-gray-400 hover:text-amber-800 hover:bg-amber-50 rounded-lg transition"
                      >
                        <Edit2 size={13} />
                      </button>
                      <button
                        onClick={() => handleSilKontrol(kat)}
                        className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
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
