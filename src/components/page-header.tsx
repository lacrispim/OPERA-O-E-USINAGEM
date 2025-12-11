import { cn } from "@/lib/utils";
import { SidebarTrigger } from "@/components/ui/sidebar";

type PageHeaderProps = {
  title: string;
  description?: string;
  children?: React.ReactNode;
  className?: string;
  showSidebarTrigger?: boolean;
};

export function PageHeader({ title, description, children, className, showSidebarTrigger = true }: PageHeaderProps) {
  return (
    <div className={cn("flex flex-col md:flex-row items-start md:items-center justify-between gap-4 py-8 px-4 sm:px-6 lg:px-8", className)}>
      <div className="grid gap-1">
        <div className="flex items-center gap-2">
            {showSidebarTrigger && <SidebarTrigger className="md:hidden" />}
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">{title}</h1>
        </div>
        {description && (
          <p className="text-muted-foreground">{description}</p>
        )}
      </div>
      {children && <div className="flex items-center gap-2">{children}</div>}
    </div>
  );
}
