"use client"

import { useState, useEffect } from "react"
import { ArrowLeft, Phone } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp"
import { useAuth } from "@/context/AuthContext"
import type { AuthUser } from "@/context/AuthContext"
import type { UserRole } from "@/types/api.types"

interface PhoneAuthScreenProps {
  onBack: () => void
  onVerified: () => void
  userType: "user" | "cook"
}

export function PhoneAuthScreen({ onBack, onVerified, userType }: PhoneAuthScreenProps) {
  const { login } = useAuth()
  const [step, setStep] = useState<"phone" | "otp">("phone")
  const [phone, setPhone] = useState("")
  const [otp, setOtp] = useState("")
  const [countdown, setCountdown] = useState(0)

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [countdown])

  const handleSendOtp = () => {
    if (phone.length >= 10) {
      setStep("otp")
      setCountdown(30)
    }
  }

  const handleVerify = () => {
    if (otp.length === 6) {
      // Mock login — any phone + any 6-digit OTP works
      const authUser: AuthUser = {
        uid: `uid_${phone}`,
        phone,
        roles: [userType] as UserRole[],
      }
      login(`mock_token_${phone}`, authUser)
      onVerified()
    }
  }

  const handleResend = () => {
    setCountdown(30)
    setOtp("")
  }

  return (
    <div className="flex flex-col h-full px-6 pt-4 pb-8 bg-background">
      {/* Header */}
      <button
        onClick={step === "otp" ? () => setStep("phone") : onBack}
        className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-8"
      >
        <ArrowLeft className="h-5 w-5" />
        <span>Back</span>
      </button>

      {/* Content */}
      <div className="flex-1 flex flex-col">
        {step === "phone" ? (
          <>
            <div className="flex items-center justify-center w-16 h-16 bg-primary/10 rounded-2xl mb-6">
              <Phone className="h-8 w-8 text-primary" />
            </div>

            <h1 className="text-2xl font-bold text-foreground">
              {userType === "cook" ? "Welcome, Home Cook!" : "Welcome!"}
            </h1>
            <p className="text-muted-foreground mt-2">
              Enter your phone number to continue
            </p>

            <div className="mt-8">
              <label className="text-sm font-medium text-foreground">Phone Number</label>
              <div className="flex items-center gap-2 mt-2">
                <div className="flex items-center h-14 px-4 bg-muted rounded-xl text-foreground font-medium">
                  +91
                </div>
                <Input
                  type="tel"
                  placeholder="Enter phone number"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                  className="h-14 text-lg rounded-xl flex-1"
                />
              </div>
            </div>

            <Button
              className="w-full h-14 mt-auto text-base font-semibold bg-primary hover:bg-primary/90"
              onClick={handleSendOtp}
              disabled={phone.length < 10}
            >
              Continue
            </Button>
          </>
        ) : (
          <>
            <div className="flex items-center justify-center w-16 h-16 bg-secondary/10 rounded-2xl mb-6">
              <span className="text-3xl font-bold text-secondary">6</span>
            </div>

            <h1 className="text-2xl font-bold text-foreground">
              Verify your number
            </h1>
            <p className="text-muted-foreground mt-2">
              Enter any 6-digit code to continue
            </p>

            <div className="mt-8 flex justify-center">
              <InputOTP maxLength={6} value={otp} onChange={setOtp}>
                <InputOTPGroup className="gap-2">
                  <InputOTPSlot index={0} className="w-12 h-14 text-xl rounded-xl" />
                  <InputOTPSlot index={1} className="w-12 h-14 text-xl rounded-xl" />
                  <InputOTPSlot index={2} className="w-12 h-14 text-xl rounded-xl" />
                  <InputOTPSlot index={3} className="w-12 h-14 text-xl rounded-xl" />
                  <InputOTPSlot index={4} className="w-12 h-14 text-xl rounded-xl" />
                  <InputOTPSlot index={5} className="w-12 h-14 text-xl rounded-xl" />
                </InputOTPGroup>
              </InputOTP>
            </div>

            <div className="mt-6 text-center">
              {countdown > 0 ? (
                <p className="text-muted-foreground">
                  Resend code in <span className="font-semibold text-foreground">{countdown}s</span>
                </p>
              ) : (
                <button
                  onClick={handleResend}
                  className="text-primary font-medium hover:underline"
                >
                  Resend OTP
                </button>
              )}
            </div>

            <Button
              className="w-full h-14 mt-auto text-base font-semibold bg-primary hover:bg-primary/90"
              onClick={handleVerify}
              disabled={otp.length < 6}
            >
              Verify
            </Button>

            <p className="text-xs text-muted-foreground text-center mt-4">
              By continuing, you agree to our Terms of Service and Privacy Policy
            </p>
          </>
        )}
      </div>
    </div>
  )
}
