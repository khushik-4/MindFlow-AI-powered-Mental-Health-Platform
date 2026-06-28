"use client";

import { useToast } from "@/components/ui/use-toast";
import { useEffect, useRef, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Send,
  Bot,
  User,
  Loader2,
  Sparkles,
  X,
  XCircle,
  AlertCircle,
  Trophy,
} from "lucide-react";
import { SessionHistory } from "@/components/therapy/session-history";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/lib/contexts/auth-context";
import Modal from "@/components/Modal";
import { resolveApiUrl } from "@/lib/utils";
import {
  createTherapySession,
  saveChatMessage,
  getSessionChatHistory,
  updateTherapySession,
} from "@/lib/db/actions";
import ReactMarkdown from "react-markdown";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { BreathingGame } from "@/components/games/breathing-game";
import { ZenGarden } from "@/components/games/zen-garden";
import { ForestGame } from "@/components/games/forest-game";
import { OceanWaves } from "@/components/games/ocean-waves";
import { saveCompletedSession } from "@/app/actions/session";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

interface SuggestedQuestion {
  id: string;
  text: string;
}

interface DBMessage {
  id: string;
  userId: string | null;
  message: string;
  role: string;
  timestamp: Date | null;
  sentiment: string | null;
  context: unknown;
}

interface DrugInfo {
  name: string;
  warnings?: string[];
  indications?: string[];
  dosage?: string[];
  activeIngredients?: string[];
}

interface DrugPrompt {
  drugName: string;
  message: string;
}

interface StressPrompt {
  trigger: string;
  activity: {
    type: "breathing" | "garden" | "forest" | "waves";
    title: string;
    description: string;
  };
}

const suggestedQuestions: SuggestedQuestion[] = [
  { id: "1", text: "How can I manage my anxiety better?" },
  { id: "2", text: "I've been feeling overwhelmed lately" },
  { id: "3", text: "Can we talk about improving sleep?" },
  { id: "4", text: "I need help with work-life balance" },
];

// Add this CSS animation at the top of the file, after imports
const glowAnimation = {
  initial: { opacity: 0.5, scale: 1 },
  animate: {
    opacity: [0.5, 1, 0.5],
    scale: [1, 1.05, 1],
    transition: {
      duration: 3,
      repeat: Infinity,
      ease: "easeInOut",
    },
  },
};

// Add this near the top of the file
const COMPLETION_THRESHOLD = 5; // Minimum number of messages before allowing completion

export default function TherapyPage() {
  const params = useParams();
  const router = useRouter();
  const { isAuthenticated, user, isLoading } = useAuth();
  const [showModal, setShowModal] = useState(false);
  const [message, setMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [mounted, setMounted] = useState(false);
  const [drugPrompt, setDrugPrompt] = useState<DrugPrompt | null>(null);
  const [drugInfo, setDrugInfo] = useState<DrugInfo | null>(null);
  const [stressPrompt, setStressPrompt] = useState<StressPrompt | null>(null);
  const [showActivity, setShowActivity] = useState(false);
  const [isChatPaused, setIsChatPaused] = useState(false);
  const [isCompletingSession, setIsCompletingSession] = useState(false);
  const { toast } = useToast();

  // Load chat history when session ID changes
  useEffect(() => {
    if (params.sessionId === "new" && user?.id) {
      const currentUserId = user.id;
      const initNewSession = async () => {
        try {
          const session = await createTherapySession({
            userId: currentUserId,
            type: "text",
          });
          router.replace(`/therapy/${session[0].id}`);
        } catch (err) {
          console.error("Failed to auto-create session:", err);
        }
      };
      initNewSession();
    } else if (params.sessionId && user?.id) {
      loadChatHistory();
    }
  }, [params.sessionId, user?.id]);

  const loadChatHistory = async () => {
    try {
      const history = await getSessionChatHistory(params.sessionId as string);
      setMessages(
        history.map((msg: DBMessage) => ({
          id: msg.id,
          role: msg.role as "user" | "assistant",
          content: msg.message,
          timestamp: new Date(msg.timestamp || Date.now()),
        }))
      );
    } catch (error) {
      console.error("Failed to load chat history:", error);
    }
  };

  const updateSessionInfo = async (content: string) => {
    if (!params.sessionId) return;

    try {
      // Generate a title from the first message if it's the first user message
      if (messages.length === 1 && messages[0].role === "user") {
        const title =
          content.length > 60 ? `${content.substring(0, 60)}...` : content;

        await updateTherapySession(params.sessionId as string, {
          title,
          summary: content,
        });
      }
    } catch (error) {
      console.error("Failed to update session info:", error);
    }
  };

  const fetchDrugInfo = async (drugName: string) => {
    try {
      console.log("Fetching drug info for:", drugName);
      const url = `https://api.fda.gov/drug/label.json?search=(openfda.generic_name:"${drugName}" OR openfda.brand_name:"${drugName}" OR openfda.substance_name:"${drugName}")&limit=1`;
      console.log("API URL:", url);

      const response = await fetch(url);
      const data = await response.json();
      console.log("FDA API Response:", data);

      if (data.error) {
        console.error("FDA API Error:", data.error);
        return null;
      }

      if (data.results?.[0]) {
        const result = data.results[0];
        const info = {
          name: drugName,
          warnings: result.warnings || [],
          indications: result.indications_and_usage || [],
          dosage: result.dosage_and_administration || [],
          activeIngredients: result.active_ingredient || [],
        };
        console.log("Processed drug info:", info);
        return info;
      }

      console.log("No results found for drug:", drugName);
      return null;
    } catch (error) {
      console.error("Error fetching drug info:", error);
      return null;
    }
  };

  const scrollToBottom = useCallback(() => {
    if (messagesEndRef.current) {
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    }
  }, []);

  useEffect(() => {
    if (!isTyping) {
      scrollToBottom();
    }
  }, [messages, isTyping, scrollToBottom]);

  const activities = [
    {
      type: "breathing" as const,
      title: "Breathing Exercise",
      description: "Follow calming breathing exercises with visual guidance",
    },
    {
      type: "garden" as const,
      title: "Zen Garden",
      description: "Create and maintain your digital peaceful space",
    },
    {
      type: "forest" as const,
      title: "Mindful Forest",
      description: "Take a peaceful walk through a virtual forest",
    },
    {
      type: "waves" as const,
      title: "Ocean Waves",
      description: "Match your breath with gentle ocean waves",
    },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const currentMessage = message.trim();
    if (!currentMessage || isTyping || !user?.id || isChatPaused) return;

    // Clear the input immediately
    setMessage("");
    setIsTyping(true);

    try {
      // Save user message
      const savedUserMsg = await saveChatMessage({
        userId: user.id,
        message: currentMessage,
        role: "user",
        context: { sessionId: params.sessionId },
      });

      setMessages((prev) => [
        ...prev,
        {
          id: savedUserMsg[0].id,
          role: "user",
          content: currentMessage,
          timestamp: new Date(),
        },
      ]);

      // Check for stress signals first
      const stressCheck = detectStressSignals(currentMessage);
      if (stressCheck) {
        setStressPrompt(stressCheck);
        setIsTyping(false);
        return;
      }

      // Check for drug mentions (simplified example)
      const drugMentionRegex =
        /\b(aspirin|tylenol|advil|xanax|prozac|paracetamol|ibuprofen|acetaminophen|codeine|morphine|amoxicillin|penicillin)\b/gi;
      const drugMatch = currentMessage.match(drugMentionRegex);

      if (drugMatch) {
        setDrugPrompt({
          drugName: drugMatch[0],
          message: `I noticed you mentioned ${drugMatch[0]}. Would you like to learn more about this medication?`,
        });
      }

      // Update session info with the message
      await updateSessionInfo(currentMessage);

      // Make API call to Gemini AI service
      const response = await fetch(resolveApiUrl("/api/chat"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message: currentMessage }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();
      const aiMessage = data.response;

      // Save AI response to database
      const savedAiMsg = await saveChatMessage({
        userId: user.id,
        message: aiMessage,
        role: "assistant",
        context: { sessionId: params.sessionId },
      });

      setMessages((prev) => [
        ...prev,
        {
          id: savedAiMsg[0].id,
          role: "assistant",
          content: aiMessage,
          timestamp: new Date(),
        },
      ]);

      setIsTyping(false);
      scrollToBottom(); // Add explicit scroll after message is added
    } catch (error) {
      console.error("Error in chat:", error);
      // Add error message to the chat
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          role: "assistant",
          content:
            "I apologize, but I'm having trouble connecting right now. Please try again in a moment.",
          timestamp: new Date(),
        },
      ]);
      setIsTyping(false);
    }
  };

  // Add function to create new session
  const createNewSession = async () => {
    if (!user?.id) return;

    try {
      const session = await createTherapySession({
        userId: user.id,
        type: "text",
      });

      router.push(`/therapy/${session[0].id}`);
    } catch (error) {
      console.error("Failed to create session:", error);
    }
  };

  useEffect(() => {
    setMounted(true);
  }, []);

  // Simple loading state
  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  // Debug auth state
  console.log("Therapy auth state:", { isAuthenticated, user, isLoading });

  // Add drug info handlers
  const handleDrugInfoRequest = async () => {
    if (!drugPrompt) return;

    console.log("Handling drug info request for:", drugPrompt.drugName);
    const info = await fetchDrugInfo(drugPrompt.drugName);

    if (info) {
      console.log("Setting drug info:", info);
      setDrugInfo(info);
    } else {
      // Add feedback for when no info is found
      console.log("No drug info found");
      // Optionally show an error message to the user
      setDrugPrompt({
        ...drugPrompt,
        message: `Sorry, I couldn't find information about ${drugPrompt.drugName} in the FDA database.`,
      });
    }
  };

  // Add stress detection function
  const detectStressSignals = (message: string): StressPrompt | null => {
    const stressKeywords = [
      "stress",
      "anxiety",
      "worried",
      "panic",
      "overwhelmed",
      "nervous",
      "tense",
      "pressure",
      "can't cope",
      "exhausted",
    ];

    const lowercaseMsg = message.toLowerCase();
    const foundKeyword = stressKeywords.find((keyword) =>
      lowercaseMsg.includes(keyword)
    );

    if (foundKeyword) {
      // Randomly select an activity (we can make this smarter later)
      const activities = [
        {
          type: "breathing" as const,
          title: "Breathing Exercise",
          description:
            "Follow calming breathing exercises with visual guidance",
        },
        {
          type: "garden" as const,
          title: "Zen Garden",
          description: "Create and maintain your digital peaceful space",
        },
        {
          type: "forest" as const,
          title: "Mindful Forest",
          description: "Take a peaceful walk through a virtual forest",
        },
        {
          type: "waves" as const,
          title: "Ocean Waves",
          description: "Match your breath with gentle ocean waves",
        },
      ];

      return {
        trigger: foundKeyword,
        activity: activities[Math.floor(Math.random() * activities.length)],
      };
    }

    return null;
  };

  // Add activity components
  const renderActivity = (type: string) => {
    switch (type) {
      case "breathing":
        return <BreathingGame />;
      case "garden":
        return <ZenGarden />;
      case "forest":
        return <ForestGame />;
      case "waves":
        return <OceanWaves />;
      default:
        return null;
    }
  };

  // Update the activity start handler
  const handleActivityStart = () => {
    setShowActivity(true);
    setIsChatPaused(true);
  };

  // Add close handler
  const handleCloseActivity = () => {
    setShowActivity(false);
    setStressPrompt(null);
    setIsChatPaused(false);
  };

  // Add this new function to handle suggested questions
  const handleSuggestedQuestion = (text: string) => {
    // First set the message
    setMessage(text);

    // Use setTimeout to ensure the message state is updated before submitting
    setTimeout(() => {
      const event = new Event("submit") as unknown as React.FormEvent;
      handleSubmit(event);
    }, 0);
  };

  const handleCompleteSession = async () => {
    if (!user?.id || !params.sessionId || isCompletingSession) return;

    setIsCompletingSession(true);
    try {
      // Get session summary from messages
      const userMessages = messages
        .filter((m) => m.role === "user")
        .map((m) => m.content);
      const summary = userMessages.join(" ").substring(0, 200) + "...";

      // Calculate mood score (simplified example)
      const moodScore = 8;

      // Complete the session by saving it to PostgreSQL
      await saveCompletedSession(user.id, summary, moodScore);

      toast({
        title: "Session Completed!",
        description: "Your therapy session has been saved successfully.",
      });

      router.push("/dashboard");
    } catch (error) {
      console.error("Error completing session:", error);
      toast({
        title: "Error Completing Session",
        description: error instanceof Error ? error.message : "Unable to complete session. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsCompletingSession(false);
    }
  };

  return (
    <div className="relative max-w-6xl mx-auto px-4">
      <div className="flex h-[calc(100vh-4rem)] mt-20">
        {/* Left sidebar */}
        <div className="w-[280px] border-r shrink-0">
          <SessionHistory onNewSession={createNewSession} />
        </div>

        {/* Main chat area */}
        <div className="flex-1 flex flex-col overflow-hidden bg-white dark:bg-background">
          {/* Complete Session Button */}
          {messages.length >= COMPLETION_THRESHOLD && (
            <div className="absolute top-4 right-4 z-10">
              <Button
                variant="outline"
                className="bg-white/50 backdrop-blur-sm hover:bg-white/75 border-primary/20"
                onClick={handleCompleteSession}
                disabled={isCompletingSession}
              >
                <Trophy className="w-4 h-4 mr-2 text-primary" />
                Complete Session
                {isCompletingSession && (
                  <Loader2 className="w-4 h-4 ml-2 animate-spin" />
                )}
              </Button>
            </div>
          )}

          {messages.length === 0 ? (
            // Welcome screen with suggested questions
            <div className="flex-1 flex items-center justify-center p-4">
              <div className="max-w-2xl w-full space-y-8">
                <div className="text-center space-y-4">
                  <div className="relative inline-flex flex-col items-center">
                    {/* Glow effect */}
                    <motion.div
                      className="absolute inset-0 bg-primary/20 blur-2xl rounded-full"
                      initial="initial"
                      animate="animate"
                      variants={glowAnimation}
                    />
                    <div className="relative flex items-center gap-2 text-2xl font-semibold">
                      <div className="relative">
                        <Sparkles className="w-6 h-6 text-primary" />
                        <motion.div
                          className="absolute inset-0 text-primary"
                          initial="initial"
                          animate="animate"
                          variants={glowAnimation}
                        >
                          <Sparkles className="w-6 h-6" />
                        </motion.div>
                      </div>
                      <span className="bg-gradient-to-r from-primary/90 to-primary bg-clip-text text-transparent">
                        AI Therapist
                      </span>
                    </div>
                    <p className="text-muted-foreground mt-2">
                      How can I assist you today?
                    </p>
                  </div>
                </div>

                <div className="grid gap-3 relative">
                  <motion.div
                    className="absolute -inset-4 bg-gradient-to-b from-primary/5 to-transparent blur-xl"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                  />
                  {suggestedQuestions.map((q, index) => (
                    <motion.div
                      key={q.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 + 0.5 }}
                    >
                      <Button
                        variant="outline"
                        className="w-full h-auto py-4 px-6 text-left justify-start hover:bg-muted/50 hover:border-primary/50 transition-all duration-300"
                        onClick={() => handleSuggestedQuestion(q.text)}
                      >
                        {q.text}
                      </Button>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            // Chat messages
            <div className="flex-1 overflow-y-auto scroll-smooth">
              <div className="max-w-3xl mx-auto">
                <AnimatePresence initial={false}>
                  {messages.map((msg) => (
                    <motion.div
                      key={msg.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                      className={cn(
                        "px-6 py-8 flex gap-4",
                        msg.role === "assistant"
                          ? "bg-muted/30"
                          : "bg-background"
                      )}
                    >
                      <div className="w-8 h-8 shrink-0 mt-1">
                        {msg.role === "assistant" ? (
                          <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center ring-1 ring-primary/20">
                            <Bot className="w-5 h-5" />
                          </div>
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-secondary text-secondary-foreground flex items-center justify-center">
                            <User className="w-5 h-5" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 space-y-2 overflow-hidden min-h-[2rem]">
                        <p className="font-medium text-sm">
                          {msg.role === "assistant" ? "AI Therapist" : "You"}
                        </p>
                        <div className="prose prose-sm dark:prose-invert leading-relaxed">
                          <ReactMarkdown>{msg.content}</ReactMarkdown>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>

                {isTyping && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="px-6 py-8 flex gap-4 bg-muted/30"
                  >
                    <div className="w-8 h-8 shrink-0">
                      <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center ring-1 ring-primary/20">
                        <Loader2 className="w-4 h-4 animate-spin" />
                      </div>
                    </div>
                    <div className="flex-1 space-y-2">
                      <p className="font-medium text-sm">AI Therapist</p>
                      <p className="text-sm text-muted-foreground">Typing...</p>
                    </div>
                  </motion.div>
                )}
                <div ref={messagesEndRef} />
              </div>
            </div>
          )}

          {/* Input area */}
          <div className="border-t bg-background/50 backdrop-blur supports-[backdrop-filter]:bg-background/50 p-4">
            <form
              onSubmit={handleSubmit}
              className="max-w-3xl mx-auto flex gap-4 items-end relative"
            >
              <div className="flex-1 relative group">
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder={
                    isChatPaused
                      ? "Complete the activity to continue..."
                      : "Ask me anything..."
                  }
                  className={cn(
                    "w-full resize-none rounded-2xl border bg-background",
                    "p-3 pr-12 min-h-[48px] max-h-[200px]",
                    "focus:outline-none focus:ring-2 focus:ring-primary/50",
                    "transition-all duration-200",
                    "placeholder:text-muted-foreground/70",
                    (isTyping || isChatPaused) &&
                    "opacity-50 cursor-not-allowed"
                  )}
                  rows={1}
                  disabled={isTyping || isChatPaused}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSubmit(e);
                    }
                  }}
                />
                <Button
                  type="submit"
                  size="icon"
                  className={cn(
                    "absolute right-1.5 bottom-3.5 h-[36px] w-[36px]",
                    "rounded-xl transition-all duration-200",
                    "bg-primary hover:bg-primary/90",
                    "shadow-sm shadow-primary/20",
                    (isTyping || isChatPaused || !message.trim()) &&
                    "opacity-50 cursor-not-allowed",
                    "group-hover:scale-105 group-focus-within:scale-105"
                  )}
                  disabled={isTyping || isChatPaused || !message.trim()}
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </form>
            <div className="mt-2 text-xs text-center text-muted-foreground">
              Press <kbd className="px-2 py-0.5 rounded bg-muted">Enter ↵</kbd>{" "}
              to send,
              <kbd className="px-2 py-0.5 rounded bg-muted ml-1">
                Shift + Enter
              </kbd>{" "}
              for new line
            </div>
          </div>
        </div>
      </div>

      {/* Add Drug Information Prompt */}
      {drugPrompt && (
        <div className="fixed bottom-24 right-4 max-w-sm">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <div className="flex gap-2">
                  <AlertCircle className="w-5 h-5 text-primary" />
                  <CardTitle className="text-sm font-medium">
                    Drug Information Available
                  </CardTitle>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0"
                  onClick={() => setDrugPrompt(null)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <CardDescription>{drugPrompt.message}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="default"
                  onClick={handleDrugInfoRequest}
                >
                  Yes, show me
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setDrugPrompt(null)}
                >
                  No, thanks
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Add Drug Information Display */}
      {drugInfo && (
        <div className="fixed inset-y-0 right-0 w-96 bg-background border-l shadow-lg p-4 overflow-y-auto">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold capitalize">
              {drugInfo.name}
            </h3>
            <Button variant="ghost" size="sm" onClick={() => setDrugInfo(null)}>
              <X className="h-4 w-4" />
            </Button>
          </div>

          {drugInfo.activeIngredients &&
            drugInfo.activeIngredients.length > 0 && (
              <div className="mb-4">
                <h4 className="font-medium mb-2">Active Ingredients</h4>
                <ul className="list-disc pl-4 space-y-1 text-sm">
                  {drugInfo.activeIngredients.map((ingredient, i) => (
                    <li key={i}>{ingredient}</li>
                  ))}
                </ul>
              </div>
            )}

          {drugInfo.indications && drugInfo.indications.length > 0 && (
            <div className="mb-4">
              <h4 className="font-medium mb-2">Uses</h4>
              <ul className="list-disc pl-4 space-y-1 text-sm">
                {drugInfo.indications.map((indication, i) => (
                  <li key={i}>{indication}</li>
                ))}
              </ul>
            </div>
          )}

          {drugInfo.warnings && drugInfo.warnings.length > 0 && (
            <div className="mb-4">
              <h4 className="font-medium mb-2">Warnings</h4>
              <ul className="list-disc pl-4 space-y-1 text-sm">
                {drugInfo.warnings.map((warning, i) => (
                  <li key={i}>{warning}</li>
                ))}
              </ul>
            </div>
          )}

          {drugInfo.dosage && drugInfo.dosage.length > 0 && (
            <div className="mb-4">
              <h4 className="font-medium mb-2">Dosage & Administration</h4>
              <ul className="list-disc pl-4 space-y-1 text-sm">
                {drugInfo.dosage.map((dose, i) => (
                  <li key={i}>{dose}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Add Stress Management Prompt */}
      {stressPrompt && !showActivity && (
        <div className="fixed bottom-24 right-4 max-w-sm">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <div className="flex gap-2">
                  <Sparkles className="w-5 h-5 text-primary" />
                  <CardTitle className="text-sm font-medium">
                    Take a Moment
                  </CardTitle>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0"
                  onClick={() => setStressPrompt(null)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <CardDescription>
                Would you like to try a quick {stressPrompt.activity.title} to
                help you feel more relaxed?
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="default"
                  onClick={handleActivityStart}
                >
                  Yes, I'd like that
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setStressPrompt(null)}
                >
                  No, thanks
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Show Activity */}
      {showActivity && stressPrompt && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-background p-6 rounded-lg max-w-2xl w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">
                {stressPrompt.activity.title}
              </h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCloseActivity}
                className="h-8 w-8 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            {renderActivity(stressPrompt.activity.type)}
          </div>
        </div>
      )}
    </div>
  );
}
