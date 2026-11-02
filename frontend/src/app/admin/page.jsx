"use client";

import { useCallback, useEffect, useState } from "react";
import AdminLayout from "./components/AdminLayout";
import VisaoDashboard from "./components/VisaoDashboard";
import { buscarDashboard } from "./lib/adminApi";

export default function PaginaAdmin() {
  return <AdminLayout>{({ token }) => <ConteudoDashboard token={token} />}</AdminLayout>;
}

function ConteudoDashboard({ token }) {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatedAt, setUpdatedAt] = useState(null);

  const carregar = useCallback(async () => {
    setLoading(true); setError("");
    try { setDashboard(await buscarDashboard(token)); setUpdatedAt(new Date()); }
    catch (err) { setError(err.message); }
    finally { setLoading(false); }
  }, [token]);

  useEffect(() => { carregar(); }, [carregar]);
  return <VisaoDashboard dashboard={dashboard} loading={loading} error={error} updatedAt={updatedAt} onRefresh={carregar} />;
}
