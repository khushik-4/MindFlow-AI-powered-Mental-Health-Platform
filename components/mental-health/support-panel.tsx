"use client";

import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Heart, Phone, MapPin, Globe, Clock } from "lucide-react";
import { motion } from "framer-motion";

interface Location {
  country: string;
  city: string;
  state?: string;
}

interface SupportPanelProps {
  loading: boolean;
  location: Location | null;
  onGetLocation: () => Promise<void> | void;
}

function getEmergencyNumber(country: string): string {
  const emergencyNumbers: Record<string, string> = {
    "United States": "911",
    "United Kingdom": "999",
    Australia: "000",
    India: "112",
  };
  return emergencyNumbers[country] || "112";
}

function getCrisisHotline(country: string): string {
  const hotlines: Record<string, string> = {
    "United States": "988",
    "United Kingdom": "116 123",
    Australia: "13 11 14",
    India: "9152987821",
  };
  return hotlines[country] || "Contact your local mental health provider";
}

function LocalResourcesCard({
  loading,
  location,
  onGetLocation,
}: SupportPanelProps) {
  const cardDesc = loading
    ? "Detecting your location..."
    : location
    ? `Resources for ${location.city}, ${location.state || location.country}`
    : "Location access required for local resources";

  return (
    <Card className="border-none shadow-md hover:shadow-lg transition-all duration-300 bg-card/50 backdrop-blur supports-[backdrop-filter]:bg-background/60 group">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="w-5 h-5 text-primary" />
          Local Emergency Resources
        </CardTitle>
        <CardDescription>{cardDesc}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {location ? (
          <>
            <div className="p-4 bg-muted rounded-lg">
              <h3 className="font-semibold flex items-center gap-2 mb-2">
                <Phone className="w-4 h-4" />
                Emergency Number
              </h3>
              <p className="text-2xl font-bold text-primary">
                {getEmergencyNumber(location.country)}
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                For immediate emergency assistance
              </p>
            </div>
            <div className="p-4 bg-muted rounded-lg">
              <h3 className="font-semibold flex items-center gap-2 mb-2">
                <Heart className="w-4 h-4" />
                Crisis Hotline
              </h3>
              <p className="text-2xl font-bold text-primary">
                {getCrisisHotline(location.country)}
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                24/7 Mental health crisis support
              </p>
            </div>
          </>
        ) : (
          !loading && (
            <Button onClick={onGetLocation} variant="outline" className="w-full">
              <MapPin className="w-4 h-4 mr-2" />
              Enable Location Access
            </Button>
          )
        )}
      </CardContent>
    </Card>
  );
}

export function SupportPanel({
  loading,
  location,
  onGetLocation,
}: SupportPanelProps) {
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
          <LocalResourcesCard
            loading={loading}
            location={location}
            onGetLocation={onGetLocation}
          />
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
