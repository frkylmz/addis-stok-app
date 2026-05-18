import { useEffect, useState } from 'react';
import { X, Check } from 'lucide-react';

export const EditModal = ({ isOpen, onClose, urun, onYerelGeciciKaydet }) => {
  const [urunAdi, setUrunAdi] = useState('');
  const [kategori, setKategori] = useState('Kahve');
  const [birim, setBirim] = useState('Adet (x)');
  const [miktar, setMiktar] = useState(0);
  const [kritikEsik, setKritikEsik] = useState(0);

  useEffect(() => {
    if (urun) {
      setUrunAdi(urun.urun_adi || '');
      setKategori(urun.kategori || 'Kahve');
      setBirim(urun.birim || 'Adet (x)');
      setMiktar(urun.miktar || 0);
      setKritikEsik(urun.kritik_esik || 0);
    }
  }, [urun, isOpen]);

  if (!isOpen || !urun) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    // Verileri sunucuya göndermiyoruz, App.jsx'teki geçici hafızaya yazıyoruz
    onYerelGeciciKaydet(urun.id, {
      urun_adi: urunAdi,
      kategori,
      birim,
      miktar: Number(miktar),
      kritik_esik: Number(kritikEsik)
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/55 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-xl border border-gray-100 overflow-hidden transform transition-all">
        
        <div className="bg-gray-50 px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-gray-900">Ürün Kartını Düzenle</h3>
            <p className="text-xs text-amber-800 font-medium mt-0.5">Değişiklikler toplu kaydetme listesine eklenecektir.</p>
          </div>
          <button onClick={onClose} className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* 1. Ürün Adı */}
          <div>
            <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1">Ürün / Kalem Adı</label>
            <input
              type="text"
              required
              value={urunAdi}
              onChange={(e) => setUrunAdi(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm font-semibold outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          {/* 2. Kategori ve Birim (Yan Yana) */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1">Kategori</label>
              <select value={kategori} onChange={(e) => setKategori(e.target.value)} className="w-full p-2 border border-gray-200 rounded-xl text-xs bg-white font-medium outline-none focus:ring-2 focus:ring-amber-500">
                <option value="Kahve">Kahve ☕</option>
                <option value="Şurup">Şurup 🍯</option>
                <option value="Süt">Süt 🥛</option>
                <option value="Ekipman">Ekipman 🛠️</option>
                <option value="Diğer">Diğerleri 📦</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1">Ölçü Birimi</label>
              <select value={birim} onChange={(e) => setBirim(e.target.value)} className="w-full p-2 border border-gray-200 rounded-xl text-xs bg-white font-medium outline-none focus:ring-2 focus:ring-amber-500">
                <option value="Adet (x)">Adet (x)</option>
                <option value="Gram (gr)">Gram (gr)</option>
                <option value="Kilo (kg)">Kilo (kg)</option>
                <option value="Litre (lt)">Litre (lt)</option>
              </select>
            </div>
          </div>

          {/* 3. Miktar ve Kritik Eşik (Yan Yana) */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1">Mevcut Miktar</label>
              <input
                type="number"
                min="0"
                step="any"
                required
                value={miktar}
                onChange={(e) => setMiktar(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1">Kritik Eşik</label>
              <input
                type="number"
                min="0"
                step="any"
                required
                value={kritikEsik}
                onChange={(e) => setKritikEsik(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100 mt-6">
            <button type="button" onClick={onClose} className="px-4 py-2 text-xs font-semibold text-gray-500 hover:bg-gray-50 border border-gray-200 rounded-xl transition">
              Vazgeç
            </button>
            <button type="submit" className="flex items-center gap-1 px-4 py-2 text-xs font-bold text-white bg-amber-800 hover:bg-amber-900 rounded-xl shadow-sm transition">
              <Check size={14} />
              Listeye Ekle
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};