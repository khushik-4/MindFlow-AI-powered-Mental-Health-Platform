"use client";

import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Heart, Phone, MapPin, Globe, Clock } from "lucide-react";
import { motion } from "framer-motion";

function EmergencyResourcesCard() {
  return (
    <Card className="border-none shadow-md hover:shadow-lg transition-all duration-300 bg-card/50 backdrop-blur supports-[backdrop-filter]:bg-background/60 group">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="w-5 h-5 text-primary" />
          Emergency & Crisis Resources
        </CardTitle>
        <CardDescription>Immediate, 24/7 mental health crisis support</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="p-4 bg-muted rounded-lg">
          <h3 className="font-semibold flex items-center gap-2 mb-2">
            <Phone className="w-4 h-4 text-primary" />
            988 Suicide & Crisis Lifeline
          </h3>
          <p className="text-2xl font-bold text-primary">988</p>
          <p className="text-sm text-muted-foreground mt-1">
            Free, confidential, 24/7 support (US & Canada)
          </p>
        </div>
        <div className="p-4 bg-muted rounded-lg">
          <h3 className="font-semibold flex items-center gap-2 mb-2">
            <Heart className="w-4 h-4 text-primary" />
            Crisis Text Line
          </h3>
          <p className="text-2xl font-bold text-primary">Text HOME to 741741</p>
          <p className="text-sm text-muted-foreground mt-1">
            24/7 free text-based support with a crisis counselor
          </p>
        </div>
        <div className="p-4 bg-muted rounded-lg">
          <h3 className="font-semibold flex items-center gap-2 mb-2">
            <MapPin className="w-4 h-4 text-primary" />
            Local Care Search
          </h3>
          <p className="text-sm leading-relaxed">
            Search "mental health support near me" on Google Maps to locate municipal health clinics, counseling services, and support groups in your vicinity.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

export function SupportPanel() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
    >
      <div className="grid gap-4 md:grid-cols-2">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
        >
          <EmergencyResourcesCard />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="border-none shadow-md hover:shadow-lg transition-all duration-300 bg-card/50 backdrop-blur supports-[backdrop-filter]:bg-background/60 group">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="w-5 h-5 text-primary" />
                Global Resources
              </CardTitle>
              <CardDescription>
                International mental health support services
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-muted rounded-lg">
                <h3 className="font-semibold flex items-center gap-2 mb-2">
                  <Clock className="w-4 h-4" />
                  24/7 Online Support
                </h3>
                <ul className="space-y-2">
                  <li>
                    <a
                      href="https://www.7cups.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                    >
                      7 Cups - Online Therapy
                    </a>
                  </li>
                  <li>
                    <a
                      href="https://www.betterhelp.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                    >
                      BetterHelp - Professional Counseling
                    </a>
                  </li>
                  <li>
                    <a
                      href="https://www.crisistextline.org"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                    >
                      Crisis Text Line - Text Support
                    </a>
                  </li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  );
}
