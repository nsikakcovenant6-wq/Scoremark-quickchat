import { useState } from "react";
import axios from "axios";
import { QRCodeCanvas } from "qrcode.react";
// react-hot-toast may not be installed in some environments; use alert fallback
const toast = {
  error: (msg: string) => alert(msg),
};
import {
  FaWhatsapp,
  FaSpinner,
} from "react-icons/fa";
export default function QuickChatForm() {
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [generatedLink, setGeneratedLink] = useState("");
  const [loading, setLoading] = useState(false);

 const generateLink = async () => {
  if (!phone || !message) {
    toast.error("Please fill all fields.");
    return;
  }

  const cleanPhone = phone.replace(/\D/g, "");
  const normalizedPhone = cleanPhone.replace(/^0+/, "");

  setLoading(true);
  try {
    const response = await axios.post(
      "http://localhost:5000/generate",
      {
        phone: normalizedPhone,
        message,
      }
    );

    setGeneratedLink(response.data.shortUrl);

setTimeout(() => {
  setLoading(false);
}, 700);

  } catch (error) {
    console.error(error);
    toast.error("Failed to generate link.");
  } finally {
    setLoading(false);
  }
  };

  return (
    <div className="w-full max-w-2xl bg-white/10 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-white/10">

      <h2 className="text-3xl font-bold text-center mb-8">
        WhatsApp Link Generator
      </h2>

      <div className="space-y-6">

        <div className="grid md:grid-cols-4 gap-4">

          <select
            className="bg-black/30 border border-gray-700 rounded-xl p-4"
          >
            <option>🇳🇬 +234</option>
            <option>🇺🇸 +1</option>
            <option>🇬🇧 +44</option>
            <option>🇨🇦 +1</option>
            <option>🇮🇳 +91</option>
          </select>

          <input
            type="text"
            placeholder="8012345678"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="md:col-span-3 bg-black/30 border border-gray-700 rounded-xl p-4 outline-none focus:border-orange-500"
          />

        </div>


       <textarea
    rows={6}
    placeholder="Hi, I want to inquire about your services."
    value={message}
    onChange={(e)=>setMessage(e.target.value)}
    className="w-full bg-black/30 border border-gray-700 rounded-xl p-4 outline-none focus:border-orange-500 resize-none"
/>
        <button
  onClick={generateLink}
  disabled={loading}
  className="w-full py-4 rounded-xl bg-linear-to-r from-orange-500 to-red-500 hover:scale-105 duration-300 font-bold text-lg flex items-center justify-center gap-3 disabled:opacity-60 disabled:cursor-not-allowed"
>
  {loading ? (
    <>
      <FaSpinner className="animate-spin text-xl" />
      Generating Link...
    </>
  ) : (
    <>
      <FaWhatsapp className="text-xl" />
      Generate WhatsApp Link
    </>
  )}
</button>

          <div className="flex justify-center mt-8 bg-white p-6 rounded-2xl">

            <QRCodeCanvas
              value={generatedLink}
              size={220}
            />

          </div>

        </div>

    </div>
  );
}
