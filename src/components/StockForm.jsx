import { useState } from "react";
import { PlusCircle } from "lucide-react";

export const StockForm = ({ onUrunEkle }) => {
  const [urunAdi, setUrunAdi] = useState("");
  const [kategori, setKategori] = useState("Kahve");
  const [miktar, setMiktar] = useState("");
  const [birim, setBirim] = useState("adet");
  const [kritikEsik, setKritikEsik] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!urunAdi || !miktar)
      return alert("Lütfen ürün adı ve miktar alanlarını doldurun.");

    setLoading(true);
    await onUrunEkle({
      urun_adi: urunAdi,
      kategori,
      miktar: Number(miktar),
      birim,
      kritik_esik: Number(kritikEsik) || 2,
    });

    setUrunAdi("");
    setMiktar("");
    setKritikEsik("");
    setLoading(false);
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
      <h2 className="text-lg font-bold text-gray-850 mb-4 flex items-center gap-2">
        <PlusCircle size={20} /> Yeni Envanter Kaydı
      </h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-gray-600 uppercase">
            Ürün / Kalem Adı
          </label>
          <input
            type="text"
            value={urunAdi}
            onChange={(e) => setUrunAdi(e.target.value)}
            placeholder="Örn: Bebeka 250 gr"
            className="w-full mt-1 p-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none text-sm"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-gray-600 uppercase">
              Kategori
            </label>
            <select
              value={kategori}
              onChange={(e) => setKategori(e.target.value)}
              className="w-full mt-1 p-2.5 border border-gray-200 rounded-lg text-sm bg-white outline-none"
            >
              <option value="Kahve">Kahve ☕</option>
              <option value="Şurup">Şurup 🍯</option>
              <option value="Süt">Süt 🥛</option>
              <option value="Ekipman">Ekipman 🛠️</option>
              <option value="Diğer">Diğer 📦</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 uppercase">
              Ölçü Birimi
            </label>
            <select
              value={birim}
              onChange={(e) => setBirim(e.target.value)}
              className="w-full mt-1 p-2.5 border border-gray-200 rounded-lg text-sm bg-white outline-none"
            >
              <option value="adet">Adet (x)</option>
              <option value="gr">Gram (gr)</option>
              <option value="kg">Kilogram (kg)</option>
              <option value="litre">Litre (L)</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-gray-600 uppercase">
              Mevcut Miktar
            </label>
            <input
              type="number"
              min="0"
              step="any"
              value={miktar}
              onChange={(e) => setMiktar(e.target.value)}
              placeholder="0"
              className="w-full mt-1 p-2.5 border border-gray-200 rounded-lg text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 uppercase">
              Kritik Eşik
            </label>
            <input
              type="number"
              min="0"
              value={kritikEsik}
              onChange={(e) => setKritikEsik(e.target.value)}
              placeholder="2"
              className="w-full mt-1 p-2.5 border border-gray-200 rounded-lg text-sm"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-amber-850 hover:bg-amber-900 text-white font-semibold py-2.5 px-4 rounded-lg text-sm transition disabled:opacity-50 mt-2"
        >
          {loading ? "Ekleniyor..." : "Stoka Dahil Et"}
        </button>
      </form>
    </div>
  );
};
