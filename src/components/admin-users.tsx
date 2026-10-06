import { useEffect, useState } from "react";
import { toast } from "sonner";
import { COPY } from "@/lib/i18n";
import { listStoreUsers, setStoreRole } from "@/lib/storefront";
import type { StoreUser } from "@/lib/storefront-types";
import { useStore } from "@/lib/store";

export function AdminUsers() {
  const lang = useStore((s) => s.lang);
  const t = COPY[lang];
  const [rows, setRows] = useState<StoreUser[]>([]);
  const [error, setError] = useState("");

  function load() {
    void listStoreUsers()
      .then((users) => {
        setRows(users);
        setError("");
      })
      .catch((err) => setError(err instanceof Error ? err.message : "Could not load accounts"));
  }

  useEffect(() => {
    load();
  }, []);

  async function setRole(user: StoreUser, role: "admin" | "customer") {
    try {
      await setStoreRole({ data: { userId: user.id, role } });
      toast.success(t.saved);
      load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not update role");
    }
  }

  return (
    <div>
      <h1 className="page-title text-[clamp(1.75rem,1.2rem+1vw,2.25rem)]">{t.userManagement}</h1>
      <p className="mt-3 max-w-xl text-sm text-muted">{t.userManagementHelp}</p>
      {error ? <p className="mt-4 text-sm text-wine">{error}</p> : null}
      {rows.length === 0 && !error ? <p className="mt-6 text-sm text-muted">{t.noUsers}</p> : null}
      <div className="panel mt-6 overflow-x-auto">
        <table className="w-full min-w-[680px] text-start text-sm">
          <thead className="border-b border-line text-xs uppercase tracking-wider text-muted">
            <tr>
              <th className="px-4 py-3 font-medium">{t.name}</th>
              <th className="px-4 py-3 font-medium">{t.email}</th>
              <th className="px-4 py-3 font-medium">{t.orders}</th>
              <th className="px-4 py-3 font-medium">{t.role}</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((user) => (
              <tr key={user.id} className="border-b border-line last:border-0">
                <td className="px-4 py-3">
                  <span className="font-medium">{user.name}</span>
                  {user.locked ? <span className="mt-0.5 block text-xs text-gold">{t.seedAdmin}</span> : null}
                </td>
                <td className="px-4 py-3">{user.email}</td>
                <td className="px-4 py-3 tabular-nums">{user.orders}</td>
                <td className="px-4 py-3">
                  {user.locked ? (
                    <span>{t.makeAdmin}</span>
                  ) : (
                    <select
                      className="field h-10"
                      value={user.role}
                      onChange={(e) => void setRole(user, e.target.value === "admin" ? "admin" : "customer")}
                    >
                      <option value="customer">{t.makeCustomer}</option>
                      <option value="admin">{t.makeAdmin}</option>
                    </select>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
