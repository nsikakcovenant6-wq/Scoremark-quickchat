import { useState } from "react";
import axios from "axios";
import { QRCodeCanvas } from "qrcode.react";
import { FaWhatsapp, FaSpinner, FaDownload, FaCopy } from "react-icons/fa";
// react-hot-toast may not be installed in some environments; use alert fallback
const toast = {
  error: (msg: string) => alert(msg),
  success: (msg: string) => alert(msg),
};
export default function QuickChatForm() {
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [generatedLink, setGeneratedLink] = useState("");
  const [loading, setLoading] = useState(false);

    const copyLink = async () => {
      if (!generatedLink) return;
      try {
        if (navigator.clipboard && navigator.clipboard.writeText) {
          await navigator.clipboard.writeText(generatedLink);
        } else {
          const textarea = document.createElement("textarea");
          textarea.value = generatedLink;
          document.body.appendChild(textarea);
          textarea.select();
          document.execCommand("copy");
          document.body.removeChild(textarea);
        }
        // use toast.error fallback defined above for lack of toast lib
        if ((toast as any).success) {
          (toast as any).success("Link copied to clipboard.");
        } else {
          alert("Link copied to clipboard.");
        }
      } catch (err) {
        console.error(err);
        toast.error("Failed to copy link.");
      }
    };

    const downloadQR = () => {
      if (!generatedLink) return;
      const canvas = document.querySelector("canvas") as HTMLCanvasElement | null;
      if (!canvas) return;
      const image = canvas.toDataURL("image/png");
      const link = document.createElement("a");
      link.href = image;
      link.download = "qrcode.png";
      link.click();
    };

 const generateLink = async () => {
  if (!phone || !message) {
    toast.error("Please fill all fields.");
    return;
  }

  setLoading(true);

  const cleanPhone = phone.replace(/\D/g, "");
  const normalizedPhone = cleanPhone.replace(/^0+/, "");

  try {
   const response = await axios.post(
  "http://scoremark-quickchat-api.onrender.com/generate-link",
  {
    phone: normalizedPhone,
    message,
  }
);

// Keep the spinner visible for at least 1 second
await new Promise((resolve) => setTimeout(resolve, 1000));

setGeneratedLink(response.data.shortUrl);

toast.success("WhatsApp link generated successfully!");
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
      <FaWhatsapp />
      Generate WhatsApp Link
    </>
  )}
</button>

          {generatedLink && (
  <div className="mt-8">

    <input
      value={generatedLink}
      readOnly
      className="w-full p-4 rounded-xl bg-black/30 border border-gray-700"
    />

   <button
  onClick={copyLink}
  className="mt-4 w-full bg-green-600 hover:bg-green-700 py-3 rounded-xl flex items-center justify-center gap-2"
>
  <FaCopy />
  Copy Link
</button>

<button
  onClick={downloadQR}
  className="mt-3 w-full bg-blue-600 hover:bg-blue-700 py-3 rounded-xl flex items-center justify-center gap-2"
>
  <FaDownload />
  Download QR Code
</button>

    <div className="flex justify-center mt-6 bg-white p-6 rounded-2xl">
      <QRCodeCanvas
        value={generatedLink}
        size={220}
      />
    </div>

  </div>
)}

        </div>

    </div>
  );
}
