"use client";
 
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  MessageSquare, 
  Users, 
  Heart, 
  Shield, 
  Search, 
  Plus, 
  Send, 
  ThumbsUp, 
  MessageCircle,
  Clock,
  User,
  Lock,
  ArrowRight,
  Loader2
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/lib/contexts/auth-context";
import { useRouter } from "next/navigation";

interface Post {
  id: string;
  title: string;
  content: string;
  author: {
    name: string;
    avatar?: string;
  };
  createdAt: string;
  likes: number;
  comments: number;
  tags: string[];
  isPrivate: boolean;
  forumId?: string;
  topic?: string;
}

interface Forum {
  id: string;
  name: string;
  description: string;
  icon: string;
  memberCount: number;
  postCount: number;
  isPrivate: boolean;
  topics: string[];
}

const forums: Forum[] = [
  {
    id: "anxiety",
    name: "Anxiety Support",
    description: "A safe space to discuss anxiety, share coping strategies, and find support",
    icon: "😌",
    memberCount: 1234,
    postCount: 567,
    isPrivate: true,
    topics: ["Coping Strategies", "Panic Attacks", "Social Anxiety", "General Anxiety"]
  },
  {
    id: "depression",
    name: "Depression Support",
    description: "Connect with others who understand what you're going through",
    icon: "🌱",
    memberCount: 2345,
    postCount: 890,
    isPrivate: true,
    topics: ["Daily Struggles", "Recovery Journey", "Self-Care", "Professional Help"]
  },
  {
    id: "mindfulness",
    name: "Mindfulness & Meditation",
    description: "Share meditation experiences and mindfulness techniques",
    icon: "🧘",
    memberCount: 3456,
    postCount: 1234,
    isPrivate: false,
    topics: ["Meditation Tips", "Mindfulness Practices", "Stress Relief", "Daily Practice"]
  },
  {
    id: "general",
    name: "General Mental Health",
    description: "Discuss various aspects of mental health and well-being",
    icon: "💭",
    memberCount: 4567,
    postCount: 2345,
    isPrivate: false,
    topics: ["Self-Care", "Lifestyle", "Resources", "Success Stories"]
  }
];

export default function CommunityPage() {
  const [activeForum, setActiveForum] = useState<string>("anxiety");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [postCategory, setPostCategory] = useState<string>("Anxiety Support");
  const [searchQuery, setSearchQuery] = useState("");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [showNewPostForm, setShowNewPostForm] = useState(false);
  const [posts, setPosts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();

  const fetchPosts = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/community/posts");
      if (res.ok) {
        const data = await res.json();
        setPosts(data);
      }
    } catch (error) {
      console.error("Failed to fetch posts:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const handleCreatePost = async () => {
    if (!isAuthenticated) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to create a post",
        variant: "destructive",
      });
      return;
    }

    if (!title.trim() || !content.trim()) {
      toast({
        title: "Missing Information",
        description: "Please fill in both title and content",
        variant: "destructive",
      });
      return;
    }

    try {
      const res = await fetch("/api/community/posts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title,
          content,
          category: postCategory,
        }),
      });

      if (res.ok) {
        toast({
          title: "Success",
          description: "Your post has been created",
        });
        setTitle("");
        setContent("");
        setShowNewPostForm(false);
        await fetchPosts();
      } else {
        const errData = await res.json();
        toast({
          title: "Error",
          description: errData.error || "Failed to create post",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error creating post:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="container mx-auto py-8 px-4 max-w-7xl mt-16">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-8"
      >
        <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
          Community Support
        </h1>
        <p className="text-muted-foreground mt-2">Connect with others who understand what you're going through</p>
      </motion.div>

      {/* Chat Section Card */}
      <Card className="mb-8 border-none shadow-md bg-gradient-to-br from-primary/5 to-primary/10 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h2 className="text-2xl font-semibold">Live Community Chat</h2>
              <p className="text-muted-foreground">Join real-time conversations with community members</p>
            </div>
            <Button 
              size="lg" 
              className="gap-2"
              onClick={() => router.push('/community/chat')}
            >
              <MessageCircle className="w-5 h-5" />
              Join Chat
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-4">
        {/* Forums Sidebar */}
        <Card className="md:col-span-1 border-none shadow-md bg-card/50 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5 text-primary" />
              Support Forums
            </CardTitle>
            <CardDescription>Choose a topic to discuss</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Button
                variant={selectedCategory === "all" ? "default" : "ghost"}
                className="w-full justify-start gap-2"
                onClick={() => setSelectedCategory("all")}
              >
                <span className="text-xl">💬</span>
                <span>All Discussions</span>
              </Button>

              {forums.map((forum) => (
                <Button
                  key={forum.id}
                  variant={selectedCategory === forum.name ? "default" : "ghost"}
                  className="w-full justify-start gap-2"
                  onClick={() => setSelectedCategory(forum.name)}
                >
                  <span className="text-xl">{forum.icon}</span>
                  <span>{forum.name}</span>
                  {forum.isPrivate && (
                    <Lock className="w-4 h-4 ml-auto text-muted-foreground" />
                  )}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Main Content Area */}
        <div className="md:col-span-3 space-y-6">
          {/* Search and New Post */}
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search posts..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button
              onClick={() => setShowNewPostForm(!showNewPostForm)}
              className="flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              New Post
            </Button>
          </div>

          {/* New Post Form */}
          {showNewPostForm && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <Card className="border-none shadow-md bg-card/50 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    <div className="space-y-1">
                      <label className="text-xs text-muted-foreground font-medium">Category</label>
                      <select
                        value={postCategory}
                        onChange={(e) => setPostCategory(e.target.value)}
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <option value="Anxiety Support">Anxiety Support</option>
                        <option value="Depression Support">Depression Support</option>
                        <option value="Mindfulness & Meditation">Mindfulness & Meditation</option>
                        <option value="General Mental Health">General Mental Health</option>
                      </select>
                    </div>
                    <Input
                      placeholder="Post title"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                    />
                    <Textarea
                      placeholder="Share your thoughts..."
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      className="min-h-[150px]"
                    />
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" onClick={() => setShowNewPostForm(false)}>
                        Cancel
                      </Button>
                      <Button onClick={handleCreatePost} className="flex items-center gap-2">
                        <Send className="w-4 h-4" />
                        Post
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Forum Topics */}
          <Card className="border-none shadow-md bg-card/50 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5 text-primary" />
                Community Posts
              </CardTitle>
              <CardDescription>
                Recent discussions and support from community members
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center items-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
              ) : posts.length > 0 ? (
                <div className="space-y-4">
                  {posts
                    .filter((post) => {
                      const matchesCategory = selectedCategory === "all" || post.category === selectedCategory;
                      const matchesSearch = searchQuery.trim() === "" || 
                        post.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                        post.content.toLowerCase().includes(searchQuery.toLowerCase());
                      return matchesCategory && matchesSearch;
                    })
                    .map((post) => (
                      <Card key={post.id} className="border-none shadow-sm hover:shadow-md transition-shadow duration-200">
                        <CardContent className="p-4">
                          <div className="flex items-start gap-4">
                            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                              <User className="w-5 h-5 text-primary" />
                            </div>
                            <div className="flex-1">
                              <h3 className="font-semibold">{post.title}</h3>
                              <p className="text-sm text-muted-foreground mt-1 whitespace-pre-wrap">
                                {post.content}
                              </p>
                              <div className="flex items-center gap-4 mt-4 text-sm text-muted-foreground">
                                <div className="flex items-center gap-1">
                                  <Clock className="w-4 h-4" />
                                  <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                                </div>
                                {post.category && (
                                  <span className="text-xs bg-muted px-2 py-0.5 rounded-full font-medium">
                                    {post.category}
                                  </span>
                                )}
                                <span className="text-xs bg-primary/10 px-2 py-0.5 rounded-full ml-auto font-medium">
                                  By {post.user?.name || post.user?.email || "Anonymous"}
                                </span>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                </div>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  No posts yet. Be the first to share!
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
} 