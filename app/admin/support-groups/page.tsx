"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { resolveApiUrl } from "@/lib/utils";
import { Loader2, Plus, Search, AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  SupportGroupCard,
  SupportGroup,
} from "@/components/admin/support-group-card";
import {
  CreateGroupDialog,
  EditGroupDialog,
} from "@/components/admin/support-group-dialogs";

export default function SupportGroups() {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [groups, setGroups] = useState<SupportGroup[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<SupportGroup | null>(null);
  const { toast } = useToast();

  const fetchGroups = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await fetch(resolveApiUrl("/api/admin/support-groups"));
      if (!response.ok) throw new Error("Failed to fetch support groups");
      const data = await response.json();
      setGroups(data);
    } catch (error) {
      console.error(error);
      setError("Failed to load support groups");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchGroups();
  }, []);

  const handleCreateGroup = async (name: string, description: string) => {
    try {
      const response = await fetch(resolveApiUrl("/api/admin/support-groups"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, description }),
      });
      if (!response.ok) throw new Error("Failed to create");
      toast({ title: "Success", description: "Support group created successfully" });
      fetchGroups();
    } catch (error) {
      toast({ title: "Error", description: "Failed to create support group", variant: "destructive" });
      throw error;
    }
  };

  const handleUpdateGroup = async (id: string, name: string, description: string) => {
    try {
      const response = await fetch(resolveApiUrl("/api/admin/support-groups"), {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, name, description }),
      });
      if (!response.ok) throw new Error("Failed to update");
      toast({ title: "Success", description: "Support group updated successfully" });
      fetchGroups();
    } catch (error) {
      toast({ title: "Error", description: "Failed to update support group", variant: "destructive" });
      throw error;
    }
  };

  const handleDeleteGroup = async (id: string) => {
    try {
      const response = await fetch(resolveApiUrl(`/api/admin/support-groups?id=${id}`), {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to delete");
      toast({ title: "Success", description: "Support group deleted successfully" });
      fetchGroups();
    } catch (error) {
      toast({ title: "Error", description: "Failed to delete support group", variant: "destructive" });
    }
  };

  const handleEditClick = (group: SupportGroup) => {
    setSelectedGroup(group);
    setIsEditing(true);
  };

  const filteredGroups = groups.filter(
    (group) =>
      group.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (group.description?.toLowerCase() || "").includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive" className="mb-6">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Support Groups</h1>
        <Button onClick={() => setIsCreating(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Create Group
        </Button>
      </div>

      <div className="flex items-center gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search groups..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="space-y-4">
        {filteredGroups.map((group) => (
          <SupportGroupCard
            key={group.id}
            group={group}
            onEdit={handleEditClick}
            onDelete={handleDeleteGroup}
          />
        ))}
      </div>

      <CreateGroupDialog
        isOpen={isCreating}
        onOpenChange={setIsCreating}
        onSubmit={handleCreateGroup}
      />

      <EditGroupDialog
        isOpen={isEditing}
        onOpenChange={setIsEditing}
        group={selectedGroup}
        onSubmit={handleUpdateGroup}
      />
    </div>
  );
}