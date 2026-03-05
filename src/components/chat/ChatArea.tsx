import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { Send, Smile, Paperclip, Reply, Forward, Copy, Pencil, Trash2, X, ArrowDown, MessageSquare, Info, Check, CheckCheck, Image as ImageIcon, FileText, Download, Play, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import type { ChatTarget } from "@/pages/Chat";
import { supabase } from "@/integrations/supabase/client";
import { useChatMessages, useMemberId, useMembers, useMessageReactions, useMessageReads, useIsBussjef, useIsAdmin, useSupplierContacts } from "@/hooks/useGroupData";
import { useAuth } from "@/contexts/AuthContext";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

interface ChatAreaProps {
  active: ChatTarget;
  channelName?: string;
  channelType?: string;
  channelParticipants?: string[];
  presenceMembers: { user_id: string; member_id: string; name: string }[];
  typingUsers: string[];
  supplierInfo?: { logo_color: string; logo_initials: string; name: string } | null;
}

const QUICK_REACTIONS = ["👍", "❤️", "😂", "😮", "😢", "🔥"];

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const msgDay = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const diff = today.getTime() - msgDay.getTime();
  if (diff === 0) return "I dag";
  if (diff === 86400000) return "I går";
  return d.toLocaleDateString("nb-NO", { day: "numeric", month: "short" });
}

function formatTime(dateStr: string) {
  return new Date(dateStr).toLocaleTimeString("nb-NO", { hour: "2-digit", minute: "2-digit" });
}

function formatSize(bytes: number) {
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
  return (bytes / (1024 * 1024)).toFixed(1) + " MB";
}

function parseMentions(content: string, members: any[]) {
  const parts: { type: "text" | "mention"; value: string; memberId?: string }[] = [];
  const regex = /<@([a-f0-9-]+)>/g;
  let lastIndex = 0;
  let match;
  while ((match = regex.exec(content)) !== null) {
    if (match.index > lastIndex) {
      parts.push({ type: "text", value: content.slice(lastIndex, match.index) });
    }
    const member = members.find((m) => m.id === match![1]);
    parts.push({ type: "mention", value: member?.name ?? "Ukjent", memberId: match![1] });
    lastIndex = regex.lastIndex;
  }
  if (lastIndex < content.length) {
    parts.push({ type: "text", value: content.slice(lastIndex) });
  }
  return parts;
}

export function ChatArea({ active, channelName, channelType, channelParticipants, presenceMembers, typingUsers, supplierInfo }: ChatAreaProps) {
  const [input, setInput] = useState("");
  const [replyTo, setReplyTo] = useState<any>(null);
  const [editingMsg, setEditingMsg] = useState<any>(null);
  const [hoveredMsg, setHoveredMsg] = useState<string | null>(null);
  const [showReactions, setShowReactions] = useState<string | null>(null);
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [forwardMsg, setForwardMsg] = useState<any>(null);
  const [mentionSearch, setMentionSearch] = useState<string | null>(null);
  const [mentionCursor, setMentionCursor] = useState(0);
  const [isNearBottom, setIsNearBottom] = useState(true);
  const [newMsgCount, setNewMsgCount] = useState(0);
  const [attachments, setAttachments] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);

  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const channelId = active.type === "channel" ? active.id : null;

  const { data: messages = [] } = useChatMessages(channelId);
  const { data: myMemberId } = useMemberId();
  const { data: members = [] } = useMembers();
  const { data: reactions = [] } = useMessageReactions(channelId);
  const { data: reads = [] } = useMessageReads(channelId);
  const { data: supplierContacts = [] } = useSupplierContacts();
  const { memberInfo } = useAuth();
  const isAdmin = useIsAdmin();
  const queryClient = useQueryClient();

  const isSupplierChannel = channelType === "supplier";

  // Realtime subscriptions
  useEffect(() => {
    if (!channelId) return;
    const subs = [
      supabase.channel(`chat-${channelId}`)
        .on("postgres_changes", { event: "*", schema: "public", table: "chat_messages", filter: `channel_id=eq.${channelId}` }, () => {
          queryClient.invalidateQueries({ queryKey: ["chat-messages", channelId] });
          queryClient.invalidateQueries({ queryKey: ["last-messages"] });
          if (!isNearBottom) setNewMsgCount((c) => c + 1);
        })
        .on("postgres_changes", { event: "*", schema: "public", table: "message_reactions" }, () => {
          queryClient.invalidateQueries({ queryKey: ["message-reactions", channelId] });
        })
        .on("postgres_changes", { event: "*", schema: "public", table: "message_reads" }, () => {
          queryClient.invalidateQueries({ queryKey: ["message-reads", channelId] });
        })
        .subscribe(),
    ];
    return () => { subs.forEach((s) => supabase.removeChannel(s)); };
  }, [channelId, queryClient, isNearBottom]);

  // Auto-scroll
  useEffect(() => {
    if (isNearBottom) {
      scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
      setNewMsgCount(0);
    }
  }, [messages.length, isNearBottom]);

  // Reset on channel change
  useEffect(() => {
    setReplyTo(null);
    setEditingMsg(null);
    setInput("");
    setNewMsgCount(0);
    setIsNearBottom(true);
    setAttachments([]);
    setTimeout(() => scrollRef.current?.scrollTo({ top: scrollRef.current?.scrollHeight ?? 0 }), 100);
  }, [channelId]);

  const handleScroll = useCallback(() => {
    if (!scrollRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
    setIsNearBottom(scrollHeight - scrollTop - clientHeight < 100);
  }, []);

  // Mark messages as read
  useEffect(() => {
    if (!channelId || !myMemberId || messages.length === 0) return;
    const unreadMsgIds = messages
      .filter((m: any) => m.member_id !== myMemberId && !reads.some((r: any) => r.message_id === m.id && r.member_id === myMemberId))
      .map((m: any) => m.id);
    if (unreadMsgIds.length === 0) return;
    const readInserts = unreadMsgIds.map((id: string) => ({ message_id: id, member_id: myMemberId }));
    supabase.from("message_reads").upsert(readInserts, { onConflict: "message_id,member_id" }).then(() => {
      queryClient.invalidateQueries({ queryKey: ["message-reads", channelId] });
      queryClient.invalidateQueries({ queryKey: ["unread-counts"] });
    });
  }, [channelId, messages, myMemberId, reads, queryClient]);

  // Typing broadcast
  const typingTimeout = useRef<NodeJS.Timeout>();
  const broadcastTyping = useCallback(() => {
    if (!channelId || !memberInfo) return;
    const ch = supabase.channel(`typing-${channelId}`);
    ch.send({ type: "broadcast", event: "typing", payload: { name: memberInfo.name } });
    clearTimeout(typingTimeout.current);
    typingTimeout.current = setTimeout(() => {
      ch.send({ type: "broadcast", event: "stop-typing", payload: { name: memberInfo.name } });
    }, 3000);
  }, [channelId, memberInfo]);

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setInput(val);
    broadcastTyping();

    // Mention detection
    const cursorPos = e.target.selectionStart;
    const textBeforeCursor = val.slice(0, cursorPos);
    const mentionMatch = textBeforeCursor.match(/@(\w*)$/);
    if (mentionMatch) {
      setMentionSearch(mentionMatch[1]);
      setMentionCursor(cursorPos);
    } else {
      setMentionSearch(null);
    }
  };

  const insertMention = (member: any) => {
    const textBefore = input.slice(0, mentionCursor);
    const atIndex = textBefore.lastIndexOf("@");
    const newText = input.slice(0, atIndex) + `<@${member.id}> ` + input.slice(mentionCursor);
    setInput(newText);
    setMentionSearch(null);
    inputRef.current?.focus();
  };

  const filteredMentionMembers = mentionSearch !== null
    ? members.filter((m) => m.name.toLowerCase().includes((mentionSearch || "").toLowerCase()))
    : [];

  const uploadFiles = async (files: File[]) => {
    const urls: { file_url: string; file_name: string; file_size: number; file_type: string }[] = [];
    for (const file of files) {
      const path = `${channelId}/${Date.now()}-${file.name}`;
      const { error } = await supabase.storage.from("chat-attachments").upload(path, file);
      if (error) {
        toast.error(`Kunne ikke laste opp ${file.name}`);
        continue;
      }
      const { data: urlData } = supabase.storage.from("chat-attachments").getPublicUrl(path);
      const fileType = file.type.startsWith("image/") ? "image" : file.type.startsWith("video/") ? "video" : "file";
      urls.push({ file_url: urlData.publicUrl, file_name: file.name, file_size: file.size, file_type: fileType });
    }
    return urls;
  };

  const handleSend = async () => {
    if ((!input.trim() && attachments.length === 0) || !channelId || !myMemberId) return;
    const content = input.trim();
    setInput("");
    setUploading(attachments.length > 0);

    if (editingMsg) {
      await supabase.from("chat_messages").update({ content, edited_at: new Date().toISOString() } as any).eq("id", editingMsg.id);
      setEditingMsg(null);
      queryClient.invalidateQueries({ queryKey: ["chat-messages", channelId] });
      setUploading(false);
      return;
    }

    const { data: newMsg } = await supabase.from("chat_messages").insert({
      channel_id: channelId,
      member_id: myMemberId,
      content: content || "📎",
      reply_to: replyTo?.id ?? null,
      forwarded_from: forwardMsg?.id ?? null,
    } as any).select().single();

    if (newMsg && attachments.length > 0) {
      const uploaded = await uploadFiles(attachments);
      for (const att of uploaded) {
        await supabase.from("message_attachments").insert({ message_id: newMsg.id, ...att } as any);
      }
    }

    setReplyTo(null);
    setForwardMsg(null);
    setAttachments([]);
    setUploading(false);
    queryClient.invalidateQueries({ queryKey: ["chat-messages", channelId] });
  };

  const handleReact = async (messageId: string, emoji: string) => {
    if (!myMemberId) return;
    const existing = reactions.find((r: any) => r.message_id === messageId && r.member_id === myMemberId && r.emoji === emoji);
    if (existing) {
      await supabase.from("message_reactions").delete().eq("id", (existing as any).id);
    } else {
      await supabase.from("message_reactions").insert({ message_id: messageId, member_id: myMemberId, emoji } as any);
    }
    queryClient.invalidateQueries({ queryKey: ["message-reactions", channelId] });
    setShowReactions(null);
  };

  const handleDelete = async (messageId: string) => {
    await supabase.from("chat_messages").update({ deleted_at: new Date().toISOString() } as any).eq("id", messageId);
    queryClient.invalidateQueries({ queryKey: ["chat-messages", channelId] });
    setDeleteConfirm(null);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) setAttachments((prev) => [...prev, ...files]);
  };

  const isAnnouncement = channelType === "announcement";
  const isDM = channelType === "dm";
  const isSupplier = channelType === "supplier";
  const canPost = !isAnnouncement || isAdmin;

  // Group messages by date
  const groupedMessages = useMemo(() => {
    const groups: { date: string; messages: any[] }[] = [];
    let currentDate = "";
    for (const msg of messages) {
      const date = formatDate(msg.created_at);
      if (date !== currentDate) {
        currentDate = date;
        groups.push({ date, messages: [msg] });
      } else {
        groups[groups.length - 1].messages.push(msg);
      }
    }
    return groups;
  }, [messages]);

  // Get message attachments (loaded separately)
  const [messageAttachments, setMessageAttachments] = useState<Record<string, any[]>>({});
  useEffect(() => {
    if (messages.length === 0) return;
    const msgIds = messages.map((m: any) => m.id);
    supabase.from("message_attachments").select("*").in("message_id", msgIds).then(({ data }) => {
      const grouped: Record<string, any[]> = {};
      (data ?? []).forEach((att: any) => {
        if (!grouped[att.message_id]) grouped[att.message_id] = [];
        grouped[att.message_id].push(att);
      });
      setMessageAttachments(grouped);
    });
  }, [messages]);

  // Active presence avatars
  const activePresence = presenceMembers.filter((p) => p.member_id !== myMemberId).slice(0, 8);

  return (
    <div className="flex-1 flex flex-col min-w-0" onDragOver={(e) => e.preventDefault()} onDrop={handleDrop}>
      {/* Topbar */}
      <div className="flex items-center justify-between px-6 py-3 border-b border-border bg-card shrink-0">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-base font-semibold text-foreground">{channelName ?? "Chat"}</span>
            {isSupplier && <ShieldCheck className="h-4 w-4 text-emerald-500" />}
          </div>
          {!isDM && !isSupplier && members.length > 0 && (
            <span className="text-xs text-muted-foreground">{members.length} medlemmer</span>
          )}
          {isSupplier && supplierInfo && (
            <span className="text-xs text-muted-foreground">Verifisert leverandør</span>
          )}
        </div>
        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground">
          <Info className="h-4 w-4" />
        </Button>
      </div>

      {/* Messages */}
      <div ref={scrollRef} onScroll={handleScroll} className="flex-1 overflow-y-auto px-6 py-4">
        {isAnnouncement && !canPost && (
          <div className="flex items-center gap-2 py-2 px-3 mb-3 rounded-lg bg-muted text-xs text-muted-foreground">
            <Info className="h-3.5 w-3.5 shrink-0" />
            Bare administratorer kan poste i denne kanalen.
          </div>
        )}

        {messages.length === 0 && (
          <div className="text-center py-16">
            <MessageSquare className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">Ingen meldinger ennå — skriv den første!</p>
          </div>
        )}

        {groupedMessages.map((group) => (
          <div key={group.date}>
            {/* Date separator */}
            <div className="flex items-center gap-3 py-3">
              <div className="flex-1 h-px bg-border" />
              <span className="text-[11px] font-medium text-muted-foreground">{group.date}</span>
              <div className="flex-1 h-px bg-border" />
            </div>

            {group.messages.map((msg: any) => {
              const isSupplierMsg = !!msg.supplier_contact_id && !msg.member_id;
              const supplierContact = isSupplierMsg ? supplierContacts.find((sc: any) => sc.id === msg.supplier_contact_id) : null;
              const member = !isSupplierMsg ? members.find((m) => m.id === msg.member_id) : null;
              const name = isSupplierMsg
                ? `${supplierContact?.name ?? "Leverandør"} — ${channelName ?? "Leverandør"}`
                : (member?.name ?? "Ukjent");
              const initials = isSupplierMsg
                ? (supplierInfo?.logo_initials ?? name.slice(0, 2).toUpperCase())
                : name.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2);
              const isOwn = !isSupplierMsg && msg.member_id === myMemberId;
              const time = formatTime(msg.created_at);
              const isDeleted = !!msg.deleted_at;
              const isEdited = !!msg.edited_at;
              const isForwarded = !!msg.forwarded_from;
              const msgReactions = reactions.filter((r: any) => r.message_id === msg.id);
              const msgReads = reads.filter((r: any) => r.message_id === msg.id);
              const atts = messageAttachments[msg.id] ?? [];
              const isMentioned = myMemberId && msg.content?.includes(`<@${myMemberId}>`);

              // Reply reference
              const replyMsg = msg.reply_to ? messages.find((m: any) => m.id === msg.reply_to) : null;
              const replyMember = replyMsg ? members.find((m) => m.id === replyMsg.member_id) : null;

              // Group reactions by emoji
              const reactionGroups: Record<string, { count: number; names: string[]; hasMine: boolean }> = {};
              msgReactions.forEach((r: any) => {
                if (!reactionGroups[r.emoji]) reactionGroups[r.emoji] = { count: 0, names: [], hasMine: false };
                reactionGroups[r.emoji].count++;
                reactionGroups[r.emoji].names.push((r.members as any)?.name ?? "Ukjent");
                if (r.member_id === myMemberId) reactionGroups[r.emoji].hasMine = true;
              });

              // Read status for own messages
              const readCount = msgReads.length;
              const memberCount = members.length;

              return (
                <div
                  key={msg.id}
                  id={`msg-${msg.id}`}
                  className={`group flex ${isOwn ? "justify-end" : "justify-start"} mb-3 relative ${isMentioned ? "bg-warning/10 -mx-2 px-2 py-1 rounded-lg" : ""}`}
                  onMouseEnter={() => setHoveredMsg(msg.id)}
                  onMouseLeave={() => { setHoveredMsg(null); setShowReactions(null); }}
                >
                  {!isOwn && (
                    isSupplierMsg && supplierInfo ? (
                      <span
                        className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0 mt-1 mr-2.5"
                        style={{ backgroundColor: supplierInfo.logo_color }}
                      >
                        {supplierInfo.logo_initials}
                      </span>
                    ) : (
                      <span className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold text-primary-foreground shrink-0 mt-1 mr-2.5 bg-primary">{initials}</span>
                    )
                  )}
                  <div className={`max-w-[65%] ${isOwn ? "items-end" : "items-start"}`}>
                    {/* Forwarded label */}
                    {isForwarded && (
                      <p className="text-[11px] text-muted-foreground mb-0.5 flex items-center gap-1">
                        <Forward className="h-3 w-3" /> Videresendt
                      </p>
                    )}

                    {/* Reply reference */}
                    {replyMsg && (
                      <button
                        onClick={() => document.getElementById(`msg-${replyMsg.id}`)?.scrollIntoView({ behavior: "smooth", block: "center" })}
                        className="flex items-center gap-2 px-3 py-1.5 mb-1 rounded-lg bg-muted/60 text-[11px] text-muted-foreground hover:bg-muted transition-colors border-l-2 border-primary/40"
                      >
                        <Reply className="h-3 w-3 shrink-0" />
                        <span className="font-medium">{replyMember?.name ?? "Ukjent"}</span>
                        <span className="truncate max-w-[200px]">{replyMsg.content}</span>
                      </button>
                    )}

                    {/* Name + role */}
                    {!isOwn && !isDM && (
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-semibold text-foreground">{name}</span>
                        {isSupplierMsg && supplierContact && (
                          <Badge variant="secondary" className="text-[10px] h-4 px-1.5 font-medium gap-0.5">
                            <ShieldCheck className="h-2.5 w-2.5 text-emerald-500" />
                            {supplierContact.role}
                          </Badge>
                        )}
                        {!isSupplierMsg && member?.role && member.role !== "medlem" && (
                          <Badge variant="secondary" className="text-[10px] h-4 px-1.5 font-medium capitalize">{(member as any).role}</Badge>
                        )}
                        <span className="text-[11px] text-muted-foreground">{time}</span>
                      </div>
                    )}

                    {/* Message bubble */}
                    {isDeleted ? (
                      <div className="rounded-2xl px-4 py-2.5 text-sm bg-muted/50 text-muted-foreground italic">
                        Denne meldingen ble slettet
                      </div>
                    ) : (
                      <div className={`rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${isOwn ? "bg-primary text-primary-foreground rounded-br-md" : isSupplierMsg ? "bg-sky-50 dark:bg-sky-950/30 text-foreground rounded-bl-md border border-sky-100 dark:border-sky-900/30" : "bg-muted text-foreground rounded-bl-md"}`}>
                        {isOwn && !isDM && (
                          <div className="flex justify-end mb-0.5">
                            <span className="text-[11px] opacity-70">{time}</span>
                          </div>
                        )}

                        {/* Content with mentions */}
                        <div>
                          {parseMentions(msg.content, members).map((part, i) =>
                            part.type === "mention" ? (
                              <span key={i} className="font-bold text-primary">@{part.value}</span>
                            ) : (
                              <span key={i}>{part.value}</span>
                            )
                          )}
                        </div>

                        {/* Attachments */}
                        {atts.map((att: any) => (
                          <div key={att.id} className="mt-2">
                            {att.file_type === "image" ? (
                              <img
                                src={att.file_url}
                                alt={att.file_name}
                                className="max-w-[300px] rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
                                onClick={() => setLightboxUrl(att.file_url)}
                              />
                            ) : att.file_type === "video" ? (
                              <video src={att.file_url} controls className="max-w-[300px] rounded-lg" />
                            ) : (
                              <a
                                href={att.file_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={`flex items-center gap-2 p-2 rounded-lg ${isOwn ? "bg-primary-foreground/10" : "bg-background"}`}
                              >
                                <FileText className="h-5 w-5 shrink-0" />
                                <div className="flex-1 min-w-0">
                                  <p className="text-xs font-medium truncate">{att.file_name}</p>
                                  <p className="text-[10px] opacity-70">{formatSize(att.file_size)}</p>
                                </div>
                                <Download className="h-4 w-4 shrink-0 opacity-70" />
                              </a>
                            )}
                          </div>
                        ))}

                        {/* Edited label */}
                        {isEdited && (
                          <span className={`text-[10px] ${isOwn ? "opacity-60" : "text-muted-foreground"} ml-1`}>(redigert)</span>
                        )}
                      </div>
                    )}

                    {/* Read status for own messages */}
                    {isOwn && !isDeleted && (
                      <div className="flex justify-end mt-0.5">
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger>
                              {isDM ? (
                                readCount > 0 ? <CheckCheck className="h-3.5 w-3.5 text-primary" /> : <Check className="h-3.5 w-3.5 text-muted-foreground" />
                              ) : (
                                <span className="text-[10px] text-muted-foreground flex items-center gap-0.5">
                                  <Check className="h-3 w-3" /> {readCount}/{memberCount - 1}
                                </span>
                              )}
                            </TooltipTrigger>
                            <TooltipContent>
                              <p className="text-xs">Sett av {readCount} av {memberCount - 1}</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                    )}

                    {/* Reactions */}
                    {Object.keys(reactionGroups).length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-1">
                        {Object.entries(reactionGroups).map(([emoji, data]) => (
                          <TooltipProvider key={emoji}>
                            <Tooltip>
                              <TooltipTrigger>
                                <button
                                  onClick={() => handleReact(msg.id, emoji)}
                                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs border transition-colors ${
                                    data.hasMine ? "border-primary bg-primary/10 text-primary" : "border-border bg-card text-foreground hover:bg-accent/50"
                                  }`}
                                >
                                  {emoji} {data.count}
                                </button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p className="text-xs">{data.names.join(", ")}</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        ))}
                      </div>
                    )}

                    {/* Hover actions */}
                    {hoveredMsg === msg.id && !isDeleted && (
                      <div className={`absolute ${isOwn ? "left-auto right-0 -top-3" : "left-12 -top-3"} flex items-center gap-0.5 bg-card border border-border rounded-lg shadow-sm px-1 py-0.5 z-10 animate-fade-in`}>
                        <button onClick={() => setShowReactions(showReactions === msg.id ? null : msg.id)} className="p-1 hover:bg-accent rounded text-muted-foreground hover:text-foreground">
                          <Smile className="h-3.5 w-3.5" />
                        </button>
                        <button onClick={() => { setReplyTo(msg); inputRef.current?.focus(); }} className="p-1 hover:bg-accent rounded text-muted-foreground hover:text-foreground">
                          <Reply className="h-3.5 w-3.5" />
                        </button>
                        <button onClick={() => navigator.clipboard.writeText(msg.content).then(() => toast.success("Kopiert"))} className="p-1 hover:bg-accent rounded text-muted-foreground hover:text-foreground">
                          <Copy className="h-3.5 w-3.5" />
                        </button>
                        {isOwn && (
                          <>
                            <button onClick={() => { setEditingMsg(msg); setInput(msg.content); inputRef.current?.focus(); }} className="p-1 hover:bg-accent rounded text-muted-foreground hover:text-foreground">
                              <Pencil className="h-3.5 w-3.5" />
                            </button>
                            <button onClick={() => setDeleteConfirm(msg.id)} className="p-1 hover:bg-destructive/10 rounded text-muted-foreground hover:text-destructive">
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </>
                        )}
                      </div>
                    )}

                    {/* Quick reaction picker */}
                    {showReactions === msg.id && (
                      <div className={`absolute ${isOwn ? "right-0" : "left-12"} -top-10 flex items-center gap-1 bg-card border border-border rounded-xl shadow-lg px-2 py-1.5 z-20 animate-scale-in`}>
                        {QUICK_REACTIONS.map((emoji) => (
                          <button key={emoji} onClick={() => handleReact(msg.id, emoji)} className="text-lg hover:scale-125 transition-transform px-0.5">
                            {emoji}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ))}
      </div>

      {/* Scroll to bottom button */}
      {!isNearBottom && (
        <div className="absolute bottom-24 right-8 z-10">
          <Button
            size="icon"
            variant="secondary"
            className="rounded-full shadow-lg h-9 w-9 relative"
            onClick={() => { scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" }); setNewMsgCount(0); }}
          >
            <ArrowDown className="h-4 w-4" />
            {newMsgCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-primary text-primary-foreground text-[10px] font-bold rounded-full h-4 min-w-[16px] flex items-center justify-center px-1">
                {newMsgCount}
              </span>
            )}
          </Button>
        </div>
      )}

      {/* Typing indicator */}
      {typingUsers.length > 0 && (
        <div className="px-6 py-1 text-xs text-muted-foreground flex items-center gap-1">
          <span className="flex gap-0.5">
            <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: "0ms" }} />
            <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: "150ms" }} />
            <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: "300ms" }} />
          </span>
          {typingUsers.length === 1
            ? `${typingUsers[0]} skriver...`
            : typingUsers.length === 2
            ? `${typingUsers[0]} og ${typingUsers[1]} skriver...`
            : `${typingUsers.length} personer skriver...`}
        </div>
      )}

      {/* Active presence avatars */}
      {activePresence.length > 0 && (
        <div className="px-6 flex items-end -mb-1 relative z-10 h-5 overflow-hidden">
          {activePresence.map((p, i) => {
            const initials = p.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
            return (
              <TooltipProvider key={p.member_id}>
                <Tooltip>
                  <TooltipTrigger>
                    <span
                      className="w-8 h-8 rounded-full bg-primary/80 text-primary-foreground flex items-center justify-center text-[10px] font-semibold -ml-1 first:ml-0 border-2 border-card animate-fade-in"
                      style={{ animationDelay: `${i * 50}ms` }}
                    >
                      {initials}
                    </span>
                  </TooltipTrigger>
                  <TooltipContent><p className="text-xs">{p.name}</p></TooltipContent>
                </Tooltip>
              </TooltipProvider>
            );
          })}
        </div>
      )}

      {/* Reply/edit bar */}
      {(replyTo || editingMsg) && (
        <div className="px-4 pt-2 flex items-center gap-2 text-xs text-muted-foreground">
          {replyTo && (
            <>
              <Reply className="h-3.5 w-3.5 text-primary" />
              <span>Svarer til <span className="font-medium text-foreground">{members.find((m) => m.id === replyTo.member_id)?.name}</span></span>
              <span className="truncate max-w-[200px]">{replyTo.content}</span>
            </>
          )}
          {editingMsg && (
            <>
              <Pencil className="h-3.5 w-3.5 text-primary" />
              <span>Redigerer melding</span>
            </>
          )}
          <button onClick={() => { setReplyTo(null); setEditingMsg(null); setInput(""); }} className="ml-auto">
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {/* Attachment preview */}
      {attachments.length > 0 && (
        <div className="px-4 pt-2 flex gap-2 flex-wrap">
          {attachments.map((f, i) => (
            <div key={i} className="flex items-center gap-2 bg-muted rounded-lg px-3 py-1.5 text-xs">
              {f.type.startsWith("image/") ? <ImageIcon className="h-3.5 w-3.5" /> : <FileText className="h-3.5 w-3.5" />}
              <span className="truncate max-w-[120px]">{f.name}</span>
              <button onClick={() => setAttachments((p) => p.filter((_, j) => j !== i))}><X className="h-3 w-3" /></button>
            </div>
          ))}
        </div>
      )}

      {/* Mentions dropdown */}
      {mentionSearch !== null && filteredMentionMembers.length > 0 && (
        <div className="mx-4 mb-1 bg-card border border-border rounded-lg shadow-lg max-h-40 overflow-y-auto animate-scale-in">
          {filteredMentionMembers.map((m) => (
            <button
              key={m.id}
              onClick={() => insertMention(m)}
              className="w-full flex items-center gap-2 px-3 py-2 text-left hover:bg-accent/50 text-sm"
            >
              <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-[10px] font-semibold">
                {m.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)}
              </span>
              {m.name}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      {canPost && (
        <div className="px-4 py-3 border-t border-border bg-card shrink-0">
          <div className="flex items-end gap-2 bg-muted rounded-xl px-3 py-1.5">
            <input
              ref={fileInputRef}
              type="file"
              multiple
              className="hidden"
              onChange={(e) => { if (e.target.files) setAttachments((p) => [...p, ...Array.from(e.target.files!)]); e.target.value = ""; }}
            />
            <button onClick={() => fileInputRef.current?.click()} className="text-muted-foreground hover:text-foreground p-1 shrink-0 mb-0.5">
              <Paperclip className="h-5 w-5" />
            </button>
            <textarea
              ref={inputRef}
              value={input}
              onChange={handleInputChange}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder={isDM ? `Skriv til ${channelName}...` : `Skriv i ${channelName ?? "kanalen"}...`}
              rows={1}
              className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none py-1.5 resize-none max-h-32 min-h-[28px]"
              style={{ height: "auto", overflowY: input.split("\n").length > 5 ? "auto" : "hidden" }}
              onInput={(e) => { const t = e.target as HTMLTextAreaElement; t.style.height = "auto"; t.style.height = Math.min(t.scrollHeight, 128) + "px"; }}
            />
            {(input.trim() || attachments.length > 0) && (
              <Button size="icon" className="h-8 w-8 rounded-full shrink-0 mb-0.5" onClick={handleSend} disabled={uploading}>
                <Send className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      )}

      {!canPost && (
        <div className="px-6 py-4 border-t border-border bg-card text-center">
          <p className="text-sm text-muted-foreground">Kun administratorer kan poste i denne kanalen</p>
        </div>
      )}

      {/* Lightbox */}
      <Dialog open={!!lightboxUrl} onOpenChange={() => setLightboxUrl(null)}>
        <DialogContent className="max-w-4xl p-2 bg-transparent border-none shadow-none">
          {lightboxUrl && <img src={lightboxUrl} alt="" className="w-full h-auto rounded-lg" />}
        </DialogContent>
      </Dialog>

      {/* Delete confirmation */}
      <AlertDialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Slett melding</AlertDialogTitle>
            <AlertDialogDescription>Er du sikker på at du vil slette denne meldingen? Dette kan ikke angres.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Avbryt</AlertDialogCancel>
            <AlertDialogAction onClick={() => deleteConfirm && handleDelete(deleteConfirm)}>Slett</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
