"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Brain, Loader2 } from "lucide-react";
import { useAuth } from "@/lib/contexts/auth-context";
import { useToast } from "@/hooks/use-toast";

export function LoginModal() {
  const {
    showLoginModal,
    isLoading,
    login,
    register,
    setShowLoginModal,
  } = useAuth();

  const { toast } = useToast();
  const [isRegistering, setIsRegistering] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    setErrorMsg("");
  }, [email, password, name]);

  useEffect(() => {
    if (!showLoginModal) {
      setName("");
      setEmail("");
      setPassword("");
      setIsRegistering(false);
      setErrorMsg("");
    }
  }, [showLoginModal]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) return;

    let success = false;
    if (isRegistering) {
      if (!name.trim()) return;
      success = await register(email, password, name);
    } else {
      success = await login(email, password);
    }

    if (success) {
      toast({
        title: "Success",
        description: isRegistering ? "Registered successfully!" : "Signed in successfully!",
      });
    } else {
      if (!isRegistering) {
        setErrorMsg("Incorrect email or password. Please try again.");
      } else {
        toast({
          title: "Error",
          description: "Registration failed. Try again.",
          variant: "destructive",
        });
      }
    }
  };

  return (
    <Dialog open={showLoginModal} onOpenChange={setShowLoginModal}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <div className="mx-auto mb-4">
            <div className="w-12 h-12 rounded-full bg-primary/10 text-primary mx-auto flex items-center justify-center">
              <Brain className="w-6 h-6" />
            </div>
          </div>
          <DialogTitle className="text-center">
            {isRegistering ? "Create Account" : "Welcome Back"}
          </DialogTitle>
          <DialogDescription className="text-center">
            {isRegistering ? "Register to start your wellness journey" : "Sign in to access your dashboard"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          {isRegistering && (
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                placeholder="Enter your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <Button type="submit" className="w-full mt-4" size="lg" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Processing...
              </>
            ) : isRegistering ? (
              "Sign Up"
            ) : (
              "Sign In"
            )}
          </Button>
         </form>

        {errorMsg && (
          <div className="text-red-500 text-sm text-center font-medium mt-2">
            {errorMsg}
          </div>
        )}

        <div className="text-center">
          <button
            type="button"
            className="text-sm text-primary hover:underline"
            onClick={() => setIsRegistering(!isRegistering)}
          >
            {isRegistering ? "Already have an account? Sign In" : "Don't have an account? Sign Up"}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
