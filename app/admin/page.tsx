"use client";

import { useState, useEffect } from "react";
import { PackageOpen, Users, CheckCircle, Clock } from "lucide-react";

type Stats = {
  totalAds: number;
  liveAds: number;
  pendingAds: number;
  totalUsers: number;
};

export default function AdminOverviewPage() {
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    fetch("/api/admin/stats")
      .then((r) => r.json())
      .then(setStats)
      .catch(() => {});
  }, []);

  return (
    <div>
      <h1 className="text-xl font-medium tracking-tight-luxury mb-8">Ringkasan Platform</h1>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="border border-border p-4 bg-muted/30">
          <div className="flex items-center gap-2 text-muted-foreground mb-4">
            <PackageOpen size={16} strokeWidth={1.5} />
            <span className="text-[10px] uppercase tracking-widest font-medium">Total Iklan</span>
          </div>
          <p className="text-3xl font-medium tracking-tight">{stats?.totalAds ?? "—"}</p>
        </div>

        <div className="border border-border p-4 bg-muted/30">
          <div className="flex items-center gap-2 text-emerald-600 mb-4">
            <CheckCircle size={16} strokeWidth={1.5} />
            <span className="text-[10px] uppercase tracking-widest font-medium text-muted-foreground">Tayang</span>
          </div>
          <p className="text-3xl font-medium tracking-tight">{stats?.liveAds ?? "—"}</p>
        </div>

        <div className="border border-border p-4 bg-muted/30">
          <div className="flex items-center gap-2 text-amber-600 mb-4">
            <Clock size={16} strokeWidth={1.5} />
            <span className="text-[10px] uppercase tracking-widest font-medium text-muted-foreground">Menunggu</span>
          </div>
          <p className="text-3xl font-medium tracking-tight">{stats?.pendingAds ?? "—"}</p>
        </div>

        <div className="border border-border p-4 bg-muted/30">
          <div className="flex items-center gap-2 text-blue-600 mb-4">
            <Users size={16} strokeWidth={1.5} />
            <span className="text-[10px] uppercase tracking-widest font-medium text-muted-foreground">Pengguna</span>
          </div>
          <p className="text-3xl font-medium tracking-tight">{stats?.totalUsers ?? "—"}</p>
        </div>
      </div>
    </div>
  );
}
