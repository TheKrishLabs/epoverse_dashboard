import {
  LayoutDashboard,
  Server,
  FileText,
  Image as ImageIcon,
  Gift,
  BrainCircuit,
  Tags,
  Archive,
  Megaphone,
  Radio,
  MessageSquare,
  BarChart,
  Video,
  Layout,
  Search,
  Share2,
  Globe,
  Settings,
  Users,
  BookOpen,
} from "lucide-react";

export type SidebarNavItem = {
  title: string;
  href: string;
  icon: React.ElementType;
  variant: "default" | "ghost";
  items?: SidebarNavItem[];
};

export type SidebarNavGroup = {
  title: string;
  items: SidebarNavItem[];
};

export const sidebarNav: SidebarNavGroup[] = [
  {
    title: "Overview",
    items: [
      {
        title: "Dashboard",
        href: "/dashboard",
        icon: LayoutDashboard,
        variant: "default",
      },
    ],
  },
  {
    title: "Content",
    items: [
      {
        title: "Post",
        href: "#",
        icon: FileText,
        variant: "ghost",
        items: [
          {
            title: "Add Post",
            href: "/post/add",
            icon: FileText,
            variant: "ghost",
          },
          {
            title: "Post List",
            href: "/post/list",
            icon: FileText,
            variant: "ghost",
          },
          {
            title: "Bulk Post Upload",
            href: "/post/bulk-upload",
            icon: FileText,
            variant: "ghost",
          },
          {
            title: "Trending Post",
            href: "/post/breaking",
            icon: FileText,
            variant: "ghost",
          },
          {
            title: "Story Manage",
            href: "/story",
            icon: FileText,
            variant: "ghost",
          },
          {
            title: "Post Comments",
            href: "/post/comments",
            icon: FileText,
            variant: "ghost",
          },
        ],
      },
      {
        title: "Video Post",
        href: "#",
        icon: Video,
        variant: "ghost",
        items: [
          {
            title: "Add Video Post",
            href: "/video-post/add",
            icon: Video,
            variant: "ghost",
          },
          {
            title: "Video Post List",
            href: "/video-post/list",
            icon: Video,
            variant: "ghost",
          }
        ]
      },
      {
        title: "Page",
        href: "#",
        icon: Layout,
        variant: "ghost",
        items: [
          {
            title: "Add New Page",
            href: "/page-builder/add",
            icon: Layout,
            variant: "ghost",
          },
          {
            title: "Page List",
            href: "/page-builder/list",
            icon: Layout,
            variant: "ghost",
          }
        ]
      },
      {
        title: "Media Library",
        href: "#", // Use # or a parent route if using submenu
        icon: ImageIcon,
        variant: "ghost",
        items: [
          {
            title: "Photo Upload",
            href: "/media-library/upload",
            icon: ImageIcon,
            variant: "ghost",
          },
          {
            title: "Photo List",
            href: "/media-library/list",
            icon: ImageIcon,
            variant: "ghost",
          }
        ]
      },
      {
        title: "Categories",
        href: "/categories",
        icon: Tags,
        variant: "ghost",
      },
      {
        title: "Archive",
        href: "/archive",
        icon: Archive,
        variant: "ghost",
      },
    ],
  },
  {
    title: "Tools & AI",
    items: [
      {
        title: "Ai Writer",
        href: "/ai-writer",
        icon: BrainCircuit,
        variant: "ghost",
      },
      {
        title: "Menu",
        href: "/menu",
        icon: Gift,
        variant: "ghost",
      },
      // {
      //   title: "Reporter",
      //   href: "/reporter",
      //   icon: User,
      //   variant: "ghost",
      // },
    ],
  },
  {
    title: "Engagement",
    items: [
      {
        title: "Opinions",
        href: "/opinions",
        icon: MessageSquare,
        variant: "ghost",
      },
      {
        title: "Polls",
        href: "#",
        icon: BarChart,
        variant: "ghost",
        items: [
          {
            title: "Add Poll",
            href: "/polls/add",
            icon: BarChart,
            variant: "ghost",
          },
          {
            title: "Polls List",
            href: "/polls",
            icon: BarChart,
            variant: "ghost",
          },
        ]
      },
      {
        title: "Subscribers",
        href: "/subscribers",
        icon: Users,
        variant: "ghost",
      },
    ],
  },
  {
    title: "Marketing",
    items: [
      {
        title: "SEO",
        href: "/seo",
        icon: Search,
        variant: "ghost",
      },
      {
        title: "Advertisement",
        href: "/advertisement",
        icon: Megaphone,
        variant: "ghost",
      },
      {
        title: "Rss Feeds",
        href: "/rss-feeds",
        icon: Radio,
        variant: "ghost",
      },
      {
        title: "Auto Post",
        href: "/auto-post-settings",
        icon: Share2,
        variant: "ghost",
      },
    ],
  },
  {
    title: "Settings",
    items: [
      {
        title: "Theme",
        href: "/theme",
        icon: Server,
        variant: "ghost",
      },
      {
        title: "Web Setup",
        href: "/web-setup",
        icon: Globe,
        variant: "ghost",
      },
      {
        title: "Settings",
        href: "/settings",
        icon: Settings,
        variant: "ghost",
      },
      {
        title: "User Management",
        href: "#",
        icon: Users,
        variant: "ghost",
        items: [
          {
            title: "Employee List",
            href: "/settings/users",
            icon: Users,
            variant: "ghost",
          },
          {
            title: "Role List",
            href: "/settings/roles",
            icon: FileText,
            variant: "ghost",
          },
          {
            title: "Language List",
            href: "/settings/languages",
            icon: FileText,
            variant: "ghost",
          },
          {
            title: "Access Log",
            href: "/settings/access-log",
            icon: FileText,
            variant: "ghost",
          },
        ]
      },
      {
        title: "Update guides",
        href: "/update-guides",
        icon: BookOpen,
        variant: "ghost",
      },
    ],
  },
];
