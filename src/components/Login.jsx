import { useState } from "react";
import { auth } from "../config/firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import { Coffee, Lock, Mail } from "lucide-react";

export const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    loading || setLoading(true);

    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err) {
      console.error(err);
      setError("Hatalı e-posta adresi veya şifre girdiniz.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-[#0f131c] flex flex-col justify-center py-12 sm:px-6 lg:px-8 transition-colors duration-200">
      {/* Logo ve Başlık Alanı */}
      <div className="sm:mx-auto w-full max-w-md flex flex-col items-center">
        <div className="bg-amber-800 dark:bg-amber-700 p-3 rounded-2xl text-white shadow-md mb-3">
          <Coffee size={32} />
        </div>
        <h2 className="text-center text-2xl font-extrabold text-gray-900 dark:text-gray-100 tracking-tight">
          Addis Ababa Coffee
        </h2>
        <p className="mt-1 text-center text-sm text-gray-500 dark:text-gray-400 font-medium">
          Şube Envanter Yönetim Paneli Girişi
        </p>
      </div>

      {/* Login Form Kartı */}
      <div className="mt-8 sm:mx-auto w-full max-w-md">
        <div className="bg-white dark:bg-[#111622] py-8 px-4 shadow sm:rounded-xl sm:px-10 border border-gray-100 dark:border-gray-800/60 transition-colors duration-200">
          <form className="space-y-5" onSubmit={handleLogin}>
            {/* Hata Mesajı Paneli */}
            {error && (
              <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 text-red-600 dark:text-red-400 text-xs font-semibold p-3 rounded-lg text-center">
                {error}
              </div>
            )}

            {/* E-posta Alanı */}
            <div>
              <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                E-posta Adresi
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 dark:text-gray-500">
                  <Mail size={16} />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="isim@addiscoffee.com"
                  className="w-full pl-10 pr-3 py-2.5 border border-gray-200 dark:border-gray-700/80 bg-white dark:bg-[#161b26] text-gray-900 dark:text-gray-100 text-sm outline-none focus:ring-2 focus:ring-amber-500 dark:focus:ring-amber-600 transition-all placeholder-gray-400 dark:placeholder-gray-500 rounded-lg"
                />
              </div>
            </div>

            {/* Şifre Alanı */}
            <div>
              <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                Şifre
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 dark:text-gray-500">
                  <Lock size={16} />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-3 py-2.5 border border-gray-200 dark:border-gray-700/80 bg-white dark:bg-[#161b26] text-gray-900 dark:text-gray-100 text-sm outline-none focus:ring-2 focus:ring-amber-500 dark:focus:ring-amber-600 transition-all placeholder-gray-400 dark:placeholder-gray-500 rounded-lg"
                />
              </div>
            </div>

            {/* Giriş Butonu */}
            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-semibold text-white bg-amber-800 hover:bg-amber-900 dark:bg-amber-700 dark:hover:bg-amber-600 focus:outline-none transition-all disabled:opacity-50 dark:disabled:bg-amber-800/40"
              >
                {loading ? "Doğrulanıyor..." : "Giriş Yap"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
