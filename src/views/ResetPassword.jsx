import React, { useState } from "react";
import { Link, useSearchParams } from "@/lib/router-compat";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Lock, Loader2, AlertTriangle } from "lucide-react";
import AuthLayout from "@/components/AuthLayout";

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const resetToken = searchParams.get("token");

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (newPassword !== confirmPassword) {
      setError("As senhas não coincidem.");
      return;
    }
    setLoading(true);
    try {
      await base44.auth.resetPassword({ resetToken, newPassword });
      window.location.href = "/login";
    } catch (err) {
      setError(err.message || "Não foi possível redefinir a senha.");
    } finally {
      setLoading(false);
    }
  };

  if (!resetToken) {
    return (
      <AuthLayout
        icon={AlertTriangle}
        title="Link inválido"
        subtitle="Este link de redefinição está incompleto ou expirou"
        footer={
          <Link to="/forgot-password" className="font-semibold text-brand-gold hover:underline">
            Pedir um novo link
          </Link>
        }
      >
        <p className="text-center text-sm text-slate-600">
          O link que você abriu está incompleto. Peça um novo e-mail de redefinição de senha.
        </p>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      icon={Lock}
      title="Nova senha"
      subtitle="Defina abaixo a sua nova senha de acesso"
    >
      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="password" className="text-sm font-medium text-slate-700">Nova senha</Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" aria-hidden="true" />
            <Input
              id="password"
              type="password"
              autoComplete="new-password"
              autoFocus
              placeholder="••••••••"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="h-12 border-slate-200 pl-10 focus-visible:ring-2 focus-visible:ring-brand-primary"
              required
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="confirm" className="text-sm font-medium text-slate-700">Confirmar senha</Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" aria-hidden="true" />
            <Input
              id="confirm"
              type="password"
              autoComplete="new-password"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="h-12 border-slate-200 pl-10 focus-visible:ring-2 focus-visible:ring-brand-primary"
              required
            />
          </div>
        </div>
        <Button
          type="submit"
          className="h-12 w-full bg-brand-primary font-semibold text-white hover:bg-brand-deep"
          disabled={loading}
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Salvando...
            </>
          ) : (
            "Redefinir senha"
          )}
        </Button>
      </form>
    </AuthLayout>
  );
}