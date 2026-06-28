"use client";

import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MessageSquare, ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

export default function ChatPage() {
  const router = useRouter();

  return (
    <div className="container mx-auto py-12 px-4 max-w-md min-h-[70vh] flex flex-col justify-center items-center mt-16">
      <Card className="w-full text-center border-none shadow-md bg-card/50 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <CardHeader className="space-y-4">
          <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
            <MessageSquare className="w-6 h-6 text-primary" />
          </div>
          <div className="space-y-2">
            <CardTitle className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              Community Chat
            </CardTitle>
            <CardDescription>Connect with peer groups in real time</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-muted-foreground text-sm">
            Community chat coming soon.
          </p>
          <Button
            onClick={() => router.push("/community")}
            variant="outline"
            className="w-full gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Community
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}