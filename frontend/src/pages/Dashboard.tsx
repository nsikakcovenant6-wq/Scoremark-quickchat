import { useEffect, useState } from "react";
import axios from "axios";
import { FaCopy, FaExternalLinkAlt, FaTrash } from 'react-icons/fa';
interface LinkData {
  id: number;
  code: string;
  phone: string;
  message: string;
  clicks: number;
}

export default function Dashboard() {
    const [links, setLinks] = useState<LinkData[]>([]);
    const [search, setSearch] = useState("");

  useEffect(() => {
    axios
      .get("http://localhost:5000/analytics/all")
      .then((res) => setLinks(res.data))
      .catch(console.error);
  }, []);

  const deleteLink = async (id: number) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this link?"
    );

    if (!confirmDelete) return;

    try {
      await axios.delete(`http://localhost:5000/delete/${id}`);

      setLinks((prev) => prev.filter((link) => link.id !== id));

      alert("Link deleted successfully!");
    } catch (error) {
      console.error(error);
      alert("Failed to delete link.");
    }
  };

  const copyLink = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      alert('Link copied to clipboard');
    } catch (err) {
      console.error(err);
      alert('Failed to copy link');
    }
  };

  const openLink = (code: string) => {
    const url = `/${code}`;
    window.open(url, '_blank');
  };

  const totalLinks = links.length;

  const totalClicks = links.reduce(
    (sum, link) => sum + link.clicks,
    0
  );

  const averageClicks =
    totalLinks === 0
      ? 0
      : (totalClicks / totalLinks).toFixed(1);

  const filteredLinks = links.filter((link) =>
    [link.code, link.phone, link.message]
      .join(" ")
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-950 text-white p-8">

      <h1 className="text-4xl font-bold mb-8">
        📊 ScoreMark Analytics
      </h1>

      <div className="mb-6">
        <input
          type="text"
          placeholder="🔍 Search by code, phone or message..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-slate-800 border border-slate-700 rounded-xl p-4 outline-none focus:border-orange-500"
        />
      </div>

      <div className="grid md:grid-cols-3 gap-6 mb-10">

        <div className="bg-slate-800 rounded-2xl p-6">
          <h3 className="text-gray-400">Total Links</h3>
          <p className="text-4xl font-bold mt-3">
            {totalLinks}
          </p>
        </div>

        <div className="bg-slate-800 rounded-2xl p-6">
          <h3 className="text-gray-400">Total Clicks</h3>
          <p className="text-4xl font-bold mt-3">
            {totalClicks}
          </p>
        </div>

        <div className="bg-slate-800 rounded-2xl p-6">
          <h3 className="text-gray-400">Average Clicks</h3>
          <p className="text-4xl font-bold mt-3">
            {averageClicks}
          </p>
        </div>

      </div>

      <table className="w-full border-collapse overflow-hidden rounded-xl">

        <thead className="bg-slate-800">
          <tr>
           <th className="p-4 bg-gray-800">Phone</th>
<th className="p-4 bg-gray-800">Clicks</th>
<th className="p-4 bg-gray-800">Created</th>
<th className="p-4 bg-gray-800">Actions</th>
          </tr>
        </thead>

        <tbody>

          {filteredLinks.map((link) => (

              <tr
                key={link.id}
                className="border-t border-gray-700"
              >
                <td className="p-4">{link.code}</td>
                <td className="p-4">{link.phone}</td>
                <td className="p-4">{link.clicks}</td>
                <td className="p-4">{link.message}</td>
                <td className="p-4">
                  <div className="flex gap-3 justify-center">

                    <button
                      onClick={() => copyLink(link.code)}
                      className="text-blue-500 hover:text-blue-700"
                      aria-label="Copy link"
                    >
                      <FaCopy />
                    </button>

                    <button
                      onClick={() => openLink(link.code)}
                      className="text-green-500 hover:text-green-700"
                      aria-label="Open link"
                    >
                      <FaExternalLinkAlt />
                    </button>

                    <button
                      onClick={() => deleteLink(link.id)}
                      className="text-red-500 hover:text-red-700"
                      aria-label="Delete link"
                    >
                      <FaTrash />
                    </button>

                  </div>
                </td>
              </tr>

          ))}

        </tbody>

      </table>

      <p className="text-gray-400 mb-6">
        Manage and track all generated WhatsApp links.
      </p>

      <footer className="text-center text-gray-500 mt-12 mb-6">
        Built with  by Covenant Nsikak Johnson 
      </footer>
    </div>
  );
}