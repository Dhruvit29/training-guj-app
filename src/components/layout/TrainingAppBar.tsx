import React from 'react';
import { Bell, ChevronDown } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { SidebarTrigger } from '@/components/ui/sidebar';

const TrainingAppBar: React.FC = () => {
  return (
    <header className="h-14 flex items-center justify-between px-4 bg-[hsl(var(--nav-dark))] text-[hsl(var(--nav-dark-foreground))] border-b border-[hsl(var(--sidebar-border))]">
      <div className="flex items-center gap-3">
        <SidebarTrigger className="text-white/80 hover:text-white hover:bg-white/10" />
        <div className="flex items-center gap-2">
          <span className="text-lg font-semibold tracking-tight">My ગુજરાતી Class</span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" className="text-white/70 hover:text-white hover:bg-white/10 h-9 w-9">
          <Bell className="w-4.5 h-4.5" />
        </Button>
        <div className="flex items-center gap-2 px-2 py-1 rounded-md hover:bg-white/10 cursor-pointer transition-colors">
          <Avatar className="h-8 w-8">
            <AvatarFallback className="bg-[hsl(var(--accent))] text-white text-xs font-medium">U</AvatarFallback>
          </Avatar>
          <ChevronDown className="w-3.5 h-3.5 text-white/60" />
        </div>
      </div>
    </header>
  );
};

export default TrainingAppBar;
