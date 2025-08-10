import { useEffect, useState } from "react";

type Stats = {
  totalFiles: number;
  totalStorage: number;
  todayUploads: number;
  activeLinks: number;
};

type FileItem = {
  id: string;
  originalName: string;
  fileSize: number;
  mimeType: string;
  uploadedAt: string;
  telegramFileId?: string;
  telegramMessageId?: number;
};

export default function Admin() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [files, setFiles] = useState<FileItem[]>([]);
  const [password, setPassword] = useState("");
  const [loggedIn, setLoggedIn] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function login() {
    setError(null);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || "Login failed");
      setLoggedIn(true);
    } catch (e: any) {
      setError(e.message);
    }
  }

  useEffect(() => {
    if (!loggedIn) return;
    (async () => {
      try {
        const s = await fetch("/api/admin/stats").then((r) => r.json());
        const f = await fetch("/api/admin/files").then((r) => r.json());
        setStats(s);
        setFiles(f.files || []);
      } catch (e) {
        setError("Failed to load admin data");
      }
    })();
  }, [loggedIn]);

  if (!loggedIn) {
    return (
      <div className="max-w-md mx-auto p-6">
        <h1 className="text-2xl font-bold mb-4">Admin Login</h1>
        <input
          type="password"
          className="border rounded px-3 py-2 w-full mb-3"
          placeholder="Enter password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button
          onClick={login}
          className="bg-brand-blue text-white px-4 py-2 rounded"
        >
          Login
        </button>
        {error && <p className="text-red-600 mt-2">{error}</p>}
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Admin Dashboard</h1>
      {error && <p className="text-red-600 mb-3">{error}</p>}
      {stats ? (
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="p-4 border rounded">
            <div className="text-slate-500">Total Files</div>
            <div className="text-2xl font-semibold">{stats.totalFiles}</div>
          </div>
          <div className="p-4 border rounded">
            <div className="text-slate-500">Total Storage (bytes)</div>
            <div className="text-2xl font-semibold">{stats.totalStorage}</div>
          </div>
          <div className="p-4 border rounded">
            <div className="text-slate-500">Today Uploads</div>
            <div className="text-2xl font-semibold">{stats.todayUploads}</div>
          </div>
          <div className="p-4 border rounded">
            <div className="text-slate-500">Active Links</div>
            <div className="text-2xl font-semibold">{stats.activeLinks}</div>
          </div>
        </div>
      ) : (
        <p className="text-slate-500 mb-6">Loading stats…</p>
      )}

      <h2 className="text-xl font-semibold mb-2">Files</h2>
      <div className="border rounded">
        {files.length === 0 ? (
          <div className="p-4 text-slate-500">No files</div>
        ) : (
          files.map((f) => (
            <div key={f.id} className="p-4 border-b last:border-b-0 flex justify-between">
              <div>
                <div className="font-medium">{f.originalName}</div>
                <div className="text-xs text-slate-500">
                  {f.mimeType} · {f.fileSize} bytes · {new Date(f.uploadedAt).toLocaleString()}
                </div>
              </div>
              <button
                className="text-red-600"
                onClick={async () => {
                  try {
                    const res = await fetch(`/api/admin/files/${f.id}`, { method: "DELETE" });
                    if (!res.ok) {
                      const d = await res.json().catch(() => ({}));
                      throw new Error(d?.message || "Delete failed");
                    }
                    setFiles((prev) => prev.filter((x) => x.id !== f.id));
                  } catch (e: any) {
                    setError(e.message);
                  }
                }}
              >
                Delete
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
