"use client";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Loader2, Shield, Key, Lock, Database, CheckCircle2, XCircle, AlertTriangle, RefreshCw, Download, Eye, EyeOff } from "lucide-react";

interface Props {
  isDark: boolean;
  t: (k: string) => string;
  setSuccess: (s: string) => void;
  setError: (s: string) => void;
}

export default function SecurityPanel({ isDark, t, setSuccess, setError }: Props) {
  const [backupLoading, setBackupLoading] = useState(false);
  const [backupData, setBackupData] = useState<any>(null);
  const [healthData, setHealthData] = useState<any>(null);
  const [healthLoading, setHealthLoading] = useState(false);
  const [showKeys, setShowKeys] = useState(false);

  const cardCls = isDark ? "bg-[#12121a] border-[#ff6b35]/10" : "bg-white border-[#ff6b35]/20";

  const runBackup = async () => {
    setBackupLoading(true);
    try {
      const res = await fetch("/api/admin/backup", { method: "POST" });
      const data = await res.json();
      if (data.success) { setBackupData(data); setSuccess("Backup created successfully!"); }
      else setError(data.error || "Backup failed");
    } catch { setError("Failed to create backup"); }
    setBackupLoading(false);
  };

  const checkHealth = async () => {
    setHealthLoading(true);
    try {
      const res = await fetch("/api/admin/health-check");
      const json = await res.json();
      if (json.success) setHealthData(json.data);
    } catch {}
    setHealthLoading(false);
  };

  useEffect(() => { checkHealth(); }, []);

  const mask = (str: string) => showKeys ? str : str.slice(0, 8) + "•".repeat(20) + str.slice(-4);

  return (
    <div className="space-y-6 pb-20 md:pb-0">
      <Card className={cardCls}>
        <CardHeader>
          <CardTitle className="text-[#ff6b35] flex items-center gap-2">
            <Shield className="w-6 h-6" /> {t("Security System")}
          </CardTitle>
          <CardDescription>{t("Authentication, access control, API protection, and backup management")}</CardDescription>
        </CardHeader>
      </Card>

      {/* Admin Authentication */}
      <Card className={cardCls}>
        <CardHeader>
          <CardTitle className="text-sm font-bold text-[#ff6b35] flex items-center gap-2">
            <Key className="w-5 h-5" /> {t("Admin Authentication")}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {[
            { label: "Authentication Method", value: "Cookie-based JWT session", status: "active" },
            { label: "Session Duration", value: "7 days auto-expiry", status: "active" },
            { label: "Login Protection", value: "Rate-limited login attempts", status: "active" },
            { label: "Password Hashing", value: "bcrypt with salt rounds", status: "active" },
            { label: "CSRF Protection", value: "Same-origin validation via middleware", status: "active" },
          ].map((item, i) => (
            <div key={i} className={`flex items-center justify-between p-3 rounded-lg border ${cardCls}`}>
              <div>
                <p className="text-xs font-medium">{item.label}</p>
                <p className="text-[10px] text-muted-foreground">{item.value}</p>
              </div>
              <Badge className="text-[10px] bg-green-500/10 text-green-500">{item.status}</Badge>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Role-Based Access */}
      <Card className={cardCls}>
        <CardHeader>
          <CardTitle className="text-sm font-bold text-[#ff6b35] flex items-center gap-2">
            <Lock className="w-5 h-5" /> {t("Role-Based Access Control")}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-[#ff6b35]/10">
                  <th className="text-left p-2 text-muted-foreground">{t("Role")}</th>
                  <th className="text-left p-2 text-muted-foreground">{t("Access Level")}</th>
                  <th className="text-left p-2 text-muted-foreground">{t("Status")}</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { role: "Super Admin", access: "Full access to all features, settings, and data", status: "active" },
                  { role: "Public Users", access: "View website, submit bookings/enquiries", status: "active" },
                  { role: "API Access", access: "Protected via middleware origin check + admin cookie", status: "active" },
                ].map((r, i) => (
                  <tr key={i} className="border-b border-[#ff6b35]/5">
                    <td className="p-2 font-medium">{r.role}</td>
                    <td className="p-2 text-muted-foreground">{r.access}</td>
                    <td className="p-2"><Badge className="text-[10px] bg-green-500/10 text-green-500">{r.status}</Badge></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* API Protection */}
      <Card className={cardCls}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-bold text-[#ff6b35] flex items-center gap-2">
              <Shield className="w-5 h-5" /> {t("API Protection & Keys")}
            </CardTitle>
            <Button size="sm" variant="ghost" onClick={() => setShowKeys(!showKeys)} className="text-xs">
              {showKeys ? <EyeOff className="w-3 h-3 mr-1" /> : <Eye className="w-3 h-3 mr-1" />}
              {showKeys ? t("Hide") : t("Show")}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {[
            { label: "Supabase Anon Key", key: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "", type: "public" },
            { label: "API Middleware", key: "Same-origin + admin-token cookie validation", type: "info" },
            { label: "CORS Policy", key: "Restricted to katyaayaniastrologer.com + localhost", type: "info" },
          ].map((item, i) => (
            <div key={i} className={`p-3 rounded-lg border ${cardCls}`}>
              <div className="flex items-center justify-between mb-1">
                <p className="text-xs font-medium">{item.label}</p>
                <Badge variant="outline" className="text-[10px]">{item.type}</Badge>
              </div>
              <p className="text-[10px] text-muted-foreground font-mono break-all">{item.type === "info" ? item.key : mask(item.key)}</p>
            </div>
          ))}
          <div className={`p-3 rounded-lg border border-yellow-500/20 ${cardCls}`}>
            <div className="flex items-center gap-2 mb-1">
              <AlertTriangle className="w-3 h-3 text-yellow-500" />
              <p className="text-xs font-medium text-yellow-500">{t("Security Best Practices")}</p>
            </div>
            <ul className="text-[10px] text-muted-foreground space-y-1 ml-5 list-disc">
              <li>{t("All admin API routes are protected by middleware authentication")}</li>
              <li>{t("Service role key is never exposed to the client")}</li>
              <li>{t("Database queries use parameterized inputs to prevent SQL injection")}</li>
              <li>{t("User inputs are sanitized to prevent XSS attacks")}</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Backup System */}
      <Card className={cardCls}>
        <CardHeader>
          <CardTitle className="text-sm font-bold text-[#ff6b35] flex items-center gap-2">
            <Database className="w-5 h-5" /> {t("Backup System")}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-xs text-muted-foreground">{t("Create a full database backup including all tables, bookings, enquiries, blogs, and settings.")}</p>
          <div className="flex gap-2">
            <Button onClick={runBackup} disabled={backupLoading} className="bg-[#ff6b35] hover:bg-[#e55a2b] text-white">
              {backupLoading ? <><Loader2 className="w-4 h-4 animate-spin mr-2" /> {t("Creating Backup...")}</> : <><Database className="w-4 h-4 mr-2" /> {t("Create Backup Now")}</>}
            </Button>
          </div>
          {backupData && (
            <div className={`p-4 rounded-xl border ${cardCls}`}>
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle2 className="w-4 h-4 text-green-500" />
                <span className="text-sm font-medium text-green-500">{t("Backup Created Successfully")}</span>
              </div>
              <div className="space-y-1 text-xs text-muted-foreground">
                <p>{t("Tables backed up")}: {backupData.tables?.join(", ") || "All"}</p>
                <p>{t("Total records")}: {backupData.totalRecords || 0}</p>
                <p>{t("Created at")}: {new Date(backupData.timestamp || Date.now()).toLocaleString()}</p>
              </div>
              {backupData.downloadUrl && (
                <a href={backupData.downloadUrl} download className="inline-flex items-center gap-1 text-xs text-[#ff6b35] hover:underline mt-2">
                  <Download className="w-3 h-3" /> {t("Download Backup")}
                </a>
              )}
            </div>
          )}

          {/* System Health */}
          {healthData?.services && (
            <div className="space-y-2 mt-4">
              <p className="text-xs font-medium">{t("System Health")}</p>
              <div className="grid grid-cols-2 gap-2">
                {healthData.services.map((svc: any) => (
                  <div key={svc.name} className={`flex items-center gap-2 p-2 rounded-lg border ${cardCls}`}>
                    {svc.status === "healthy" || svc.status === "ok" || svc.status === "connected" ?
                      <CheckCircle2 className="w-3 h-3 text-green-500" /> : <XCircle className="w-3 h-3 text-red-500" />}
                    <span className="text-[10px]">{svc.name}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
