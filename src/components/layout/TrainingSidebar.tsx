import React from 'react';
import { useLocation } from 'react-router-dom';
import { NavLink } from '@/components/NavLink';
import {
  LayoutDashboard, Users, ClipboardList, GraduationCap,
  Video, Settings, ShieldCheck, ChevronDown, ChevronRight,
} from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  useSidebar,
} from '@/components/ui/sidebar';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

const externalItems = [
  { title: 'Dashboard', icon: LayoutDashboard, url: '#' },
  { title: 'Classes', icon: Users, url: '#' },
  { title: 'Registration', icon: ClipboardList, url: '#' },
  { title: 'Exams', icon: GraduationCap, url: '#' },
];

const TrainingSidebar: React.FC = () => {
  const { state } = useSidebar();
  const collapsed = state === 'collapsed';
  const location = useLocation();
  const isTraining = location.pathname.startsWith('/training');

  return (
    <Sidebar collapsible="icon" className="border-r-0">
      <SidebarContent className="bg-[hsl(var(--nav-dark))]">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {/* External nav items (disabled/placeholder) */}
              {externalItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    className="text-[hsl(var(--sidebar-foreground))]/60 hover:bg-white/5 hover:text-[hsl(var(--sidebar-foreground))]/80 cursor-not-allowed"
                    tooltip={item.title}
                  >
                    <item.icon className="w-4 h-4" />
                    {!collapsed && <span>{item.title}</span>}
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}

              {/* Training - expandable & active */}
              <Collapsible defaultOpen={isTraining}>
                <SidebarMenuItem>
                  <CollapsibleTrigger asChild>
                    <SidebarMenuButton
                      className="text-[hsl(var(--sidebar-foreground))] hover:bg-white/10 font-medium"
                      tooltip="Training"
                    >
                      <Video className="w-4 h-4" />
                      {!collapsed && (
                        <>
                          <span className="flex-1">Training</span>
                          {isTraining ? (
                            <ChevronDown className="w-3.5 h-3.5 text-[hsl(var(--sidebar-foreground))]/50" />
                          ) : (
                            <ChevronRight className="w-3.5 h-3.5 text-[hsl(var(--sidebar-foreground))]/50" />
                          )}
                        </>
                      )}
                    </SidebarMenuButton>
                  </CollapsibleTrigger>

                  {!collapsed && (
                    <CollapsibleContent>
                      <SidebarMenuSub>
                        <SidebarMenuSubItem>
                          <SidebarMenuSubButton asChild>
                            <NavLink
                              to="/training"
                              end
                              className="text-[hsl(var(--sidebar-foreground))]/70 hover:text-[hsl(var(--sidebar-foreground))] hover:bg-white/10"
                              activeClassName="bg-white/10 text-white font-medium"
                            >
                              Videos
                            </NavLink>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                        <SidebarMenuSubItem>
                          <SidebarMenuSubButton asChild>
                            <NavLink
                              to="/training/admin"
                              className="text-[hsl(var(--sidebar-foreground))]/70 hover:text-[hsl(var(--sidebar-foreground))] hover:bg-white/10"
                              activeClassName="bg-white/10 text-white font-medium"
                            >
                              Admin
                            </NavLink>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      </SidebarMenuSub>
                    </CollapsibleContent>
                  )}
                </SidebarMenuItem>
              </Collapsible>

              {/* Settings placeholder */}
              <SidebarMenuItem>
                <SidebarMenuButton
                  className="text-[hsl(var(--sidebar-foreground))]/60 hover:bg-white/5 hover:text-[hsl(var(--sidebar-foreground))]/80 cursor-not-allowed"
                  tooltip="Settings"
                >
                  <Settings className="w-4 h-4" />
                  {!collapsed && <span>Settings</span>}
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
};

export default TrainingSidebar;
