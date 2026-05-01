"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type User = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  status: "ACTIVE" | "SUSPENDED" | "BANNED";
  createdAt: string;
  _count: { ads: number };
};

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");

  useEffect(() => {
    fetchUsers();
  }, []);

  async function fetchUsers(query = "") {
    setLoading(true);
    const res = await fetch(`/api/admin/users?q=${query}`);
    const data = await res.json();
    setUsers(data.users || []);
    setLoading(false);
  }

  async function updateStatus(id: string, status: string) {
    if (!confirm(`Ubah status pengguna ini menjadi ${status}?`)) return;
    
    try {
      const res = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status }),
      });
      if (!res.ok) throw new Error("Gagal");
      setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, status: status as any } : u)));
    } catch {
      alert("Gagal mengupdate status user");
    }
  }

  return (
    <div>
      <h1 className="text-xl font-medium tracking-tight-luxury mb-8">Data Pengguna</h1>

      <div className="flex gap-2 mb-6">
        <div className="relative flex-1 max-w-sm">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input 
            placeholder="Cari nama atau email..." 
            className="pl-9 h-9 text-xs" 
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && fetchUsers(q)}
          />
        </div>
        <Button size="sm" className="h-9" onClick={() => fetchUsers(q)}>Cari</Button>
      </div>

      <div className="border border-border overflow-hidden">
        <table className="w-full text-sm text-left">
          <thead className="bg-muted/50 border-b border-border text-xs uppercase tracking-widest text-muted-foreground">
            <tr>
              <th className="px-4 py-3 font-medium">Pengguna</th>
              <th className="px-4 py-3 font-medium">Kontak</th>
              <th className="px-4 py-3 font-medium text-center">Total Iklan</th>
              <th className="px-4 py-3 font-medium text-center">Status</th>
              <th className="px-4 py-3 font-medium">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {loading ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">Memuat data...</td>
              </tr>
            ) : users.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">Tidak ada pengguna ditemukan.</td>
              </tr>
            ) : (
              users.map((user) => (
                <tr key={user.id} className="hover:bg-muted/20 transition-colors">
                  <td className="px-4 py-3">
                    <p className="font-medium">{user.name}</p>
                    <p className="text-xs text-muted-foreground">Bergabung {new Date(user.createdAt).toLocaleDateString("id-ID")}</p>
                  </td>
                  <td className="px-4 py-3">
                    <p>{user.email}</p>
                    <p className="text-xs text-muted-foreground">{user.phone || "-"}</p>
                  </td>
                  <td className="px-4 py-3 text-center">{user._count.ads}</td>
                  <td className="px-4 py-3 text-center">
                    <span className={`text-[10px] uppercase tracking-widest px-2 py-1 border ${
                      user.status === "ACTIVE" ? "border-emerald-200 bg-emerald-50 text-emerald-700" :
                      user.status === "SUSPENDED" ? "border-amber-200 bg-amber-50 text-amber-700" :
                      "border-red-200 bg-red-50 text-red-700"
                    }`}>
                      {user.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <Select value={user.status} onValueChange={(val) => updateStatus(user.id, val)}>
                      <SelectTrigger className="h-8 text-xs w-[120px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ACTIVE">Aktif</SelectItem>
                        <SelectItem value="SUSPENDED">Suspend</SelectItem>
                        <SelectItem value="BANNED">Banned</SelectItem>
                      </SelectContent>
                    </Select>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
