import React, { ReactNode } from "react";
import SideBar from "../components/sidebar";
import { Sidebar, SidebarProvider } from "../components/ui/sidebar";

interface BlogProps {
  children: ReactNode;
}

const Homelayout: React.FC<BlogProps> = ({ children }) => {
  return (
    <div>
      <SidebarProvider>
        <SideBar />
        <main className="w-full">
          <div className="w-full min-h-[calc(100vh-45)] px-4">{children}</div>
        </main>
        </SidebarProvider>
    </div>
  );
};

export default Homelayout;
