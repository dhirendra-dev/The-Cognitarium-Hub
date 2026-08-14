import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { trpc } from "@/lib/trpc";
import { ArrowUp, Copy, Crown, Flame, Plus, Share2, Sparkles, Users, UserRoundPlus } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function Squads() {
  const [name, setName] = useState("");
  const [inviteCode, setInviteCode] = useState("");
  const utils = trpc.useUtils();
  const { data: squads, isLoading } = trpc.squads.mine.useQuery();
  const create = trpc.squads.create.useMutation({ onSuccess: () => { toast.success("Squad created. Invite your people."); setName(""); utils.squads.mine.invalidate(); }, onError: (error) => toast.error(error.message) });
  const join = trpc.squads.join.useMutation({ onSuccess: (squad) => { toast.success(squad ? `Joined ${squad.name}.` : "Invite code not found."); setInviteCode(""); utils.squads.mine.invalidate(); }, onError: (error) => toast.error(error.message) });

  const copyInvite = async (code: string) => {
    await navigator.clipboard?.writeText(code);
    toast.success("Invite code copied.");
  };

  return (
    <div className="mx-auto max-w-6xl space-y-7">
      <section className="rounded-[2rem] border border-border bg-card p-7 shadow-sm sm:p-10">
        <p className="ink-kicker">Accountability, without the noise</p>
        <div className="mt-3 flex flex-col justify-between gap-6 lg:flex-row lg:items-end"><div className="max-w-2xl"><h2 className="display-serif text-4xl font-bold sm:text-5xl">Your people make consistency easier.</h2><p className="mt-4 text-base leading-7 text-muted-foreground">Squads turn the global leaderboard into a small room: shared effort, gentle pressure, and progress you can actually see.</p></div><div className="flex items-center gap-3 rounded-2xl bg-accent/35 px-4 py-3 text-sm font-black"><Flame className="h-5 w-5 text-primary" /> Effort counts here.</div></div>
      </section>

      <div className="grid gap-6 lg:grid-cols-[0.78fr_1.22fr]">
        <Card className="elevated-card rounded-[1.75rem] p-6 sm:p-7"><div className="mb-6 flex items-center gap-3"><span className="rounded-xl bg-primary/10 p-2.5 text-primary"><UserRoundPlus className="h-5 w-5" /></span><div><p className="ink-kicker">Start a room</p><h3 className="text-xl font-black">Create or join</h3></div></div><Tabs defaultValue="create"><TabsList className="grid w-full grid-cols-2 rounded-xl bg-muted/70"><TabsTrigger value="create">Create squad</TabsTrigger><TabsTrigger value="join">Join squad</TabsTrigger></TabsList><TabsContent value="create" className="mt-5 space-y-4"><Input value={name} onChange={(event) => setName(event.target.value)} placeholder="e.g. The 6AM Club" className="h-12 rounded-xl bg-background/70" /><Button disabled={name.trim().length < 2 || create.isPending} onClick={() => create.mutate({ name: name.trim() })} className="h-12 w-full rounded-full"><Plus className="mr-2 h-4 w-4" /> Create squad</Button><p className="text-xs leading-5 text-muted-foreground">You’ll receive a private invite code to share with your study partners.</p></TabsContent><TabsContent value="join" className="mt-5 space-y-4"><Input value={inviteCode} onChange={(event) => setInviteCode(event.target.value.toUpperCase())} placeholder="Paste invite code" className="h-12 rounded-xl bg-background/70 font-mono uppercase tracking-widest" /><Button disabled={inviteCode.trim().length < 4 || join.isPending} onClick={() => join.mutate({ inviteCode: inviteCode.trim() })} className="h-12 w-full rounded-full"><Share2 className="mr-2 h-4 w-4" /> Join squad</Button><p className="text-xs leading-5 text-muted-foreground">Ask a squad owner for their code. You can join more than one room.</p></TabsContent></Tabs></Card>

        <div className="space-y-4">{isLoading && <Card className="elevated-card rounded-[1.75rem] p-8"><p className="text-sm font-bold text-muted-foreground">Loading your squads…</p></Card>}{!isLoading && !squads?.length && <Card className="elevated-card rounded-[1.75rem] border-dashed p-8 text-center"><Users className="mx-auto h-9 w-9 text-primary" /><h3 className="mt-4 text-xl font-black">No squad yet.</h3><p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-muted-foreground">Create a room for your friends or join one with an invite code. Your accountability layer starts here.</p></Card>}{squads?.map((entry) => <Card key={entry.squad?.id} className="elevated-card rounded-[1.75rem] p-6 sm:p-7"><div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start"><div><div className="flex items-center gap-2"><span className="rounded-xl bg-sky-100 p-2 text-sky-700 dark:bg-sky-950/40 dark:text-sky-300"><Users className="h-4 w-4" /></span><h3 className="text-xl font-black">{entry.squad?.name}</h3></div><p className="mt-2 text-sm text-muted-foreground">{entry.members?.length ?? 0} members on the visible board</p></div><button onClick={() => entry.squad?.inviteCode && copyInvite(entry.squad.inviteCode)} className="flex items-center gap-2 rounded-full border border-border px-3 py-2 text-xs font-black hover:bg-accent/30"><Copy className="h-3.5 w-3.5" /> {entry.squad?.inviteCode}</button></div><div className="mt-6 space-y-2">{entry.members?.slice(0, 5).map((member, index) => <div key={member.id} className="flex items-center gap-3 rounded-xl bg-background/55 p-3"><span className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-black ${index === 0 ? "bg-amber-100 text-amber-800" : "bg-muted text-muted-foreground"}`}>{index === 0 ? <Crown className="h-4 w-4" /> : index + 1}</span><span className="flex-1 text-sm font-black">{`Student ${index + 1}`}</span><span className="flex items-center gap-1 text-xs font-bold text-muted-foreground"><ArrowUp className="h-3.5 w-3.5 text-emerald-600" /> {member.points ?? 0} XP</span></div>)}{!entry.members?.length && <p className="rounded-xl border border-dashed border-border p-4 text-sm text-muted-foreground">Your squad is ready. Log effort to make the pulse visible.</p>}</div></Card>)}</div>
      </div>
      <section className="flex items-center gap-3 rounded-2xl border border-border bg-card/70 p-5 text-sm text-muted-foreground"><Sparkles className="h-5 w-5 shrink-0 text-primary" /><p>Squad rankings are scoped to your room. They are designed to make showing up feel visible, not to turn study into a popularity contest.</p></section>
    </div>
  );
}
