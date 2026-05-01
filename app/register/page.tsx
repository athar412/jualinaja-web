"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { signIn } from "next-auth/react";

const registerSchema = z.object({
  email: z.string().email("Email tidak valid"),
  password: z.string().min(6, "Password minimal 6 karakter"),
  confirmPassword: z.string(),
}).refine((d) => d.password === d.confirmPassword, {
  message: "Password tidak cocok",
  path: ["confirmPassword"],
});

const otpSchema = z.object({
  otp: z.string().length(6, "OTP harus 6 digit"),
});

type RegisterData = z.infer<typeof registerSchema>;
type OtpData = z.infer<typeof otpSchema>;

export default function RegisterPage() {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2>(1);
  const [userEmail, setUserEmail] = useState("");
  const [serverError, setServerError] = useState("");
  const [loading, setLoading] = useState(false);

  const { register: registerForm, handleSubmit: handleRegisterSubmit, formState: { errors: registerErrors } } = useForm<RegisterData>({
    resolver: zodResolver(registerSchema),
  });

  const { register: otpForm, handleSubmit: handleOtpSubmit, formState: { errors: otpErrors } } = useForm<OtpData>({
    resolver: zodResolver(otpSchema),
  });

  async function onRegisterSubmit(data: RegisterData) {
    setLoading(true);
    setServerError("");
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: data.email, password: data.password }),
      });
      const json = await res.json();
      if (!res.ok) {
        setServerError(json.error || "Pendaftaran gagal.");
      } else {
        setUserEmail(data.email);
        setStep(2);
      }
    } catch {
      setServerError("Terjadi kesalahan. Coba lagi.");
    } finally {
      setLoading(false);
    }
  }

  async function onOtpSubmit(data: OtpData) {
    setLoading(true);
    setServerError("");
    try {
      const res = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: userEmail, otp: data.otp }),
      });
      const json = await res.json();
      if (!res.ok) {
        setServerError(json.error || "Verifikasi gagal.");
      } else {
        router.push("/login?verified=1");
      }
    } catch {
      setServerError("Terjadi kesalahan. Coba lagi.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex">
      <div className="hidden lg:flex lg:w-1/2 bg-muted items-center justify-center p-12">
        <div className="max-w-xs">
          <Link href="/" className="text-[15px] font-medium tracking-tight-luxury block mb-12">jualinaja</Link>
          <h2 className="text-3xl font-medium tracking-tight-luxury leading-tight mb-4">Bergabung dengan komunitas jual beli Bandung.</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">Daftar gratis, pasang iklan, dan temukan pembeli atau penjual di sekitar Anda.</p>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-sm">
          <Link href="/" className="text-[15px] font-medium tracking-tight-luxury block mb-12 lg:hidden">jualinaja</Link>
          
          {step === 1 && (
            <>
              <h1 className="text-xl font-medium tracking-tight-luxury mb-1">Buat Akun</h1>
              <p className="text-sm text-muted-foreground mb-8">
                Sudah punya akun?{" "}
                <Link href="/login" className="text-foreground underline underline-offset-2">Masuk</Link>
              </p>

              <form onSubmit={handleRegisterSubmit(onRegisterSubmit)} className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="email" className="text-xs uppercase tracking-widest text-muted-foreground">Email</Label>
                  <Input id="email" type="email" placeholder="budi@contoh.com" {...registerForm("email")} />
                  {registerErrors.email && <p className="text-xs text-destructive">{registerErrors.email.message}</p>}
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="password" className="text-xs uppercase tracking-widest text-muted-foreground">Password</Label>
                  <Input id="password" type="password" placeholder="••••••••" {...registerForm("password")} />
                  {registerErrors.password && <p className="text-xs text-destructive">{registerErrors.password.message}</p>}
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="confirmPassword" className="text-xs uppercase tracking-widest text-muted-foreground">Konfirmasi Password</Label>
                  <Input id="confirmPassword" type="password" placeholder="••••••••" {...registerForm("confirmPassword")} />
                  {registerErrors.confirmPassword && <p className="text-xs text-destructive">{registerErrors.confirmPassword.message}</p>}
                </div>

                {serverError && (
                  <p className="text-xs text-destructive border border-destructive/30 px-3 py-2">{serverError}</p>
                )}

                <Button type="submit" className="w-full h-11 mt-2" disabled={loading}>
                  {loading ? "Mendaftar..." : "Buat Akun"}
                </Button>
              </form>

              <div className="relative my-8">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-border" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">Atau lanjutkan dengan</span>
                </div>
              </div>

              <Button
                type="button"
                variant="outline"
                className="w-full h-11 gap-2"
                onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
              >
                <svg viewBox="0 0 24 24" className="w-4 h-4" aria-hidden="true">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                </svg>
                Google
              </Button>
            </>
          )}

          {step === 2 && (
            <>
              <h1 className="text-xl font-medium tracking-tight-luxury mb-1">Verifikasi Email</h1>
              <p className="text-sm text-muted-foreground mb-8">
                Kami telah mengirimkan 6-digit OTP ke <strong>{userEmail}</strong>. Masukkan kode tersebut di bawah ini.
              </p>

              <form onSubmit={handleOtpSubmit(onOtpSubmit)} className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="otp" className="text-xs uppercase tracking-widest text-muted-foreground">Kode OTP</Label>
                  <Input id="otp" placeholder="123456" maxLength={6} className="text-center text-lg tracking-widest" {...otpForm("otp")} />
                  {otpErrors.otp && <p className="text-xs text-destructive">{otpErrors.otp.message}</p>}
                </div>

                {serverError && (
                  <p className="text-xs text-destructive border border-destructive/30 px-3 py-2">{serverError}</p>
                )}

                <Button type="submit" className="w-full h-11 mt-2" disabled={loading}>
                  {loading ? "Memverifikasi..." : "Verifikasi"}
                </Button>
              </form>
            </>
          )}

        </div>
      </div>
    </div>
  );
}
