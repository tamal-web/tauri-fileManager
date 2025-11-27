import {
  File,
  DownloadIcon,
  Image,
  WallpaperIcon,
  CodeIcon,
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Link, useLocation } from "react-router-dom";

// Menu items.
const items = [
  {
    title: "Documents",
    url: "/Documents",
    icon: File,
  },
  {
    title: "Downloads",
    url: "/Downloads",
    icon: DownloadIcon,
  },
  {
    title: "Developer",
    url: "/Developer",
    icon: CodeIcon,
  },
  {
    title: "Pictures",
    url: "/Pictures",
    icon: Image,
  },
  {
    title: "Desktop",
    url: "/Desktop",
    icon: WallpaperIcon,
  },
];

export function AppSidebar() {
  const { pathname } = useLocation();
  return (
    <Sidebar variant="inset">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Files</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => {
                const isActive = pathname === item.url;
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild isActive={isActive}>
                      <Link to={item.url}>
                        <item.icon />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
