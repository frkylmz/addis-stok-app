import { Trash2, AlertTriangle, Edit2 } from 'lucide-react';

export const StockTable = ({ 
  stoklar, 
  onUrunSil, 
  onDuzenleTikla, 
  duzenlenenUrunler, 
  onTopluKaydet, 
  isSaving 
}) => {
  const hasChanges = Object.keys(duzenlenenUrunler).length > 0;

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100 text-xs font-bold text-gray-500 uppercase tracking-wider">
                <th className="p-4">Durum</th>
                <th className="p-4">Ürün Tanımı</th>
                <th className="p-4">Kategori</th>
                <th className="p-4 text-center">Miktar</th>
                <th className="p-4 text-right">Eylemler</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
              {stoklar.length === 0 ? (
                <tr>
                  <td colSpan="5" className="p-8 text-center text-gray-400 font-medium">
                    Aranan kriterlere uygun ürün bulunamadı.
                  </td>
                </tr>
              ) : (
                stoklar.map(urun => {
                  // Eğer bu ürün üzerinde modal ile yerel bir düzenleme yapıldıysa onu kullan, yapılmadıysa buluttaki orijinali kullan
                  const guncelVeri = duzenlenenUrunler[urun.id] !== undefined 
                    ? { ...urun, ...duzenlenenUrunler[urun.id] } 
                    : urun;

                  const isKritik = guncelVeri.miktar <= guncelVeri.kritik_esik;
                  const isModified = duzenlenenUrunler[urun.id] !== undefined;

                  return (
                    <tr 
                      key={urun.id} 
                      className={`hover:bg-gray-50/70 transition-colors ${
                        isModified ? 'bg-orange-50/40' : isKritik ? 'bg-red-50/30' : ''
                      }`}
                    >
                      <td className="p-4">
                        {isKritik ? (
                          <span className="inline-flex items-center gap-1 bg-red-100 text-red-700 px-2 py-1 rounded-md text-xs font-bold">
                            <AlertTriangle size={12} /> Kritik
                          </span>
                        ) : (
                          <span className="inline-flex items-center bg-green-100 text-green-700 px-2 py-1 rounded-md text-xs font-bold">
                            Stabil
                          </span>
                        )}
                      </td>
                      <td className="p-4 font-semibold text-gray-800">
                        {guncelVeri.urun_adi}
                        {isModified && <span className="ml-2 text-[10px] bg-orange-100 text-orange-700 px-1.5 py-0.5 rounded-md font-bold">Kaydedilmedi</span>}
                      </td>
                      <td className="p-4 text-gray-500">
                        <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 border border-gray-200/60">
                          {guncelVeri.kategori}
                        </span>
                      </td>
                      <td className="p-4 text-center font-bold text-gray-700">
                        {guncelVeri.miktar} <span className="text-xs text-gray-400 font-normal ml-0.5">{guncelVeri.birim}</span>
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => onDuzenleTikla(urun)}
                            className="p-2 text-gray-400 hover:text-amber-700 hover:bg-amber-50 rounded-lg transition"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button 
                            onClick={() => onUrunSil(urun.id)} 
                            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Çoklu Satır Değişikliklerini TEK REQUEST'te gönderen Toplu Kayıt Barı */}
      {hasChanges && (
        <div className="bg-orange-50 border border-orange-200 p-4 rounded-xl flex items-center justify-between shadow-sm animate-fadeIn">
          <div className="text-xs text-orange-800 font-medium">
            <span className="font-bold">{Object.keys(duzenlenenUrunler).length}</span> farklı ürünü düzenlediniz. Veritabanı kotasını korumak için değişiklikleriniz hafızada bekletiliyor.
          </div>
          <button
            onClick={onTopluKaydet}
            disabled={isSaving}
            className="bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold py-2 px-4 rounded-lg shadow-sm transition disabled:opacity-50"
          >
            {isSaving ? 'Yazılıyor...' : 'Tüm Değişiklikleri Sunucuya Gönder (Tek İstek)'}
          </button>
        </div>
      )}
    </div>
  );
};