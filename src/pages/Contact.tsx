import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { toast } from "@/hooks/use-toast";

export default function Contact() {
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      toast({ title: "Message sent", description: "We'll get back to you shortly." });
    }, 800);
  };

  return (
    <div className="grid md:grid-cols-2 gap-6">
      <section className="space-y-3">
        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">Contact</h1>
        <p className="text-muted-foreground">Tell us about your operation and we'll tailor a demo for your workflows.</p>
      </section>
      <form onSubmit={onSubmit} className="glass rounded-xl p-6 border space-y-4">
        <div>
          <label className="text-sm">Name</label>
          <Input required placeholder="Your name" className="mt-1" />
        </div>
        <div>
          <label className="text-sm">Email</label>
          <Input required type="email" placeholder="you@company.com" className="mt-1" />
        </div>
        <div>
          <label className="text-sm">Message</label>
          <Textarea required placeholder="What challenges are you solving?" className="mt-1" />
        </div>
        <Button type="submit" disabled={loading} variant="hero" size="lg">
          {loading ? "Sending…" : "Send message"}
        </Button>
      </form>
    </div>
  );
}
