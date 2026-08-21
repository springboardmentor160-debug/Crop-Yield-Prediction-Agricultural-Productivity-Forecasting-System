import { useEffect, useState } from "react";
import { usersApi } from "../api/resources";
import AppLayout from "../components/AppLayout";
import { PageHeader, Spinner } from "../components/UIKit";

export default function Users() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);

  const load = () => {
    setLoading(true);
    usersApi.list().then(({ data }) => setUsers(data)).finally(() => setLoading(false));
  };

  useEffect(load, []);

  const toggle = async (u) => {
    setBusyId(u.id);
    try {
      if (u.is_active) await usersApi.deactivate(u.id);
      else await usersApi.activate(u.id);
      load();
    } finally {
      setBusyId(null);
    }
  };

  return (
    <AppLayout>
      <PageHeader
        eyebrow="Platform Administration"
        title="User management"
        description="View and manage accounts across all roles: farmers, cooperative managers, consultants, and government officials."
      />

      {loading ? (
        <div className="flex h-48 items-center justify-center"><Spinner /></div>
      ) : (
        <div className="card overflow-x-auto p-0">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-pine-100 text-left text-xs font-semibold uppercase tracking-wide text-pine-400">
                <th className="px-4 py-3">Name</th><th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Role</th><th className="px-4 py-3">Organization</th>
                <th className="px-4 py-3">Status</th><th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="border-b border-pine-50 last:border-0">
                  <td className="px-4 py-3 font-medium text-pine-800">{u.full_name}</td>
                  <td className="px-4 py-3 text-pine-500">{u.email}</td>
                  <td className="px-4 py-3 capitalize">{u.role.replace("_", " ")}</td>
                  <td className="px-4 py-3 text-pine-500">{u.organization || "—"}</td>
                  <td className="px-4 py-3">
                    <span className={`badge ${u.is_active ? "badge-low" : "badge-high"}`}>
                      {u.is_active ? "Active" : "Deactivated"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => toggle(u)}
                      disabled={busyId === u.id}
                      className="text-xs font-semibold text-pine-600 hover:underline disabled:opacity-50"
                    >
                      {u.is_active ? "Deactivate" : "Activate"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </AppLayout>
  );
}
