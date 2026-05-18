import { Trash2, AlertTriangle, Edit2, Home, Coffee } from "lucide-react";

export const StockTable = ({
  stoklar,
  onUrunSil,
  onDuzenleTikla,
  duzenlenenUrunler,
  onTopluKaydet,
  isSaving,
}) => {
  const hasChanges = Object.keys(duzenlenenUrunler).length > 0;

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {/* 2) Fazla ürün eklendiğinde dikey scroll (max-h-[500px]) ve taşmalar için yatay scroll */}
        <div className="overflow-x-auto overflow-y-auto max-h-[550px] scrollbar-thin scrollbar-thumb-gray-200">
          <table className="w-full text-left border-collapse table-fixed min-w-[700px]">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100 text-xs font-bold text-gray-500 tracking-wider sticky top-0 z-10 shadow-sm">
                <th className="p-4 w-[110px]">Durum</th>
                {/* Uzun isimlerin dengeli dağılması için geniş bir pay ayırdık */}
                <th className="p-4 w-[35%]">Ürün Tanımı</th>
                <th className="p-4 w-[120px]">Kategori</th>
                <th className="p-4 text-center bg-gray-50/50 w-[200px]">
                  Depo / Bar Miktarı
                </th>
                <th className="p-4 text-right w-[100px]">Eylemler</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
              {stoklar.length === 0 ? (
                <tr>
                  <td
                    colSpan="5"
                    className="p-8 text-center text-gray-400 font-medium"
                  >
                    Aranan kriterlere uygun ürün bulunamadı.
                  </td>
                </tr>
              ) : (
                stoklar.map((urun) => {
                  const guncelVeri =
                    duzenlenenUrunler[urun.id] !== undefined
                      ? { ...urun, ...duzenlenenUrunler[urun.id] }
                      : urun;

                  const dMiktar = Number(guncelVeri.depo_miktar || 0);
                  const bMiktar = Number(guncelVeri.bar_miktar || 0);
                  const toplamMiktar = dMiktar + bMiktar;

                  const isKritik =
                    toplamMiktar <= Number(guncelVeri.kritik_esik || 0);
                  const isModified = duzenlenenUrunler[urun.id] !== undefined;

                  return (
                    <tr
                      key={urun.id}
                      className={`hover:bg-gray-50/70 transition-colors ${
                        isModified
                          ? "bg-orange-50/40"
                          : isKritik
                            ? "bg-red-50/30"
                            : ""
                      }`}
                    >
                      <td className="p-4 whitespace-nowrap">
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

                      {/* 1) Uzun isimler için dinamik satır yüksekliği ve taşma koruması */}
                      <td className="p-4 font-semibold text-gray-800 break-words pr-2">
                        <div className="inline-block max-w-full alignment-fix">
                          <span className="leading-relaxed block md:inline">
                            {guncelVeri.urun_adi}
                          </span>
                          {isModified && (
                            <span className="mt-1 md:mt-0 md:ml-2 inline-block text-[9px] bg-orange-100 text-orange-700 px-1.5 py-0.5 rounded-md font-bold whitespace-nowrap vertical-align-middle">
                              Hafızada
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="p-4 text-gray-500 whitespace-nowrap">
                        <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 border border-gray-200/60">
                          {guncelVeri.kategori}
                        </span>
                      </td>

                      <td className="p-4 bg-gray-50/30 whitespace-nowrap">
                        <div className="flex items-center justify-center gap-4 text-xs font-bold">
                          <div
                            className="flex items-center gap-1 text-gray-700"
                            title="Alt Kat Depo"
                          >
                            <Home size={13} className="text-gray-400" />
                            <span>{dMiktar}</span>
                          </div>

                          <span className="text-gray-300 font-normal">/</span>

                          <div
                            className="flex items-center gap-1 text-amber-900"
                            title="Üst Kat Bar"
                          >
                            <Coffee size={13} className="text-amber-700" />
                            <span>{bMiktar}</span>
                          </div>

                          <span className="text-[11px] text-gray-500 font-semibold bg-gray-100/80 px-2 py-0.5 rounded-md ml-1">
                            Toplam:{" "}
                            <span className="font-bold text-black">
                              {toplamMiktar}
                            </span>
                          </span>
                        </div>
                      </td>

                      <td className="p-4 text-right whitespace-nowrap">
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

      {/* Toplu İstek Gönderme Çubuğu */}
      {hasChanges && (
        <div className="bg-orange-50 border border-orange-200 p-4 rounded-xl flex items-center justify-between shadow-sm animate-fadeIn">
          <div className="text-xs text-orange-800 font-medium">
            <span className="font-bold">
              {Object.keys(duzenlenenUrunler).length}
            </span>{" "}
            kalem üzerinde değişiklik yapıldı. Değişiklikler tek istekte
            gönderilmek üzere bekletiliyor.
          </div>
          <button
            onClick={onTopluKaydet}
            disabled={isSaving}
            className="bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold py-2 px-4 rounded-lg shadow-sm transition disabled:opacity-50"
          >
            {isSaving
              ? "Buluta Yazılıyor..."
              : "Tüm Değişiklikleri Kaydet (Tek İstek)"}
          </button>
        </div>
      )}
    </div>
  );
};
