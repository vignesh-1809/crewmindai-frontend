import { TopNav } from "./TopNav";
import { Outlet } from "react-router-dom";

export default function AppLayout() {
  return (
    <div className="min-h-svh w-full flex flex-col bg-background">
      <header className="sticky top-0 z-40 glass-nav border-b">
        <TopNav />
      </header>
      <main className="flex-1 p-0 w-full overflow-hidden">
        <Outlet />
      </main>
    </div>
  );
}
