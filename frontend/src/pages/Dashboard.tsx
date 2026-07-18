import { useEffect, useState } from "react";
import axios from "axios";

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

      <table className="w-full border border-gray-700">

        <thead className="bg-slate-800">
          <tr>
            <th className="p-4">Code</th>
            <th className="p-4">Phone</th>
            <th className="p-4">Clicks</th>
            <th className="p-4">Message</th>
            <th className="p-4">Action</th>
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
                  <button
                    onClick={() => deleteLink(link.id)}
                    className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded-md"
                  >
                    Delete
                  </button>
                </td>
              </tr>

          ))}

        </tbody>

      </table>

    </div>
  );
}