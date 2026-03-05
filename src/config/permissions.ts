export interface PermissionModule {
  id: string;
  name: string;
  subModules: {
    id: string;
    name: string;
    // Some submodules might not support all CRUD operations, but based on the UI, they all have the checkboxes.
  }[];
}

export const MODULE_PERMISSIONS: PermissionModule[] = [
  {
    id: "dashboard",
    name: "Dashboard",
    subModules: [
      { id: "dashboard_main", name: "Dashboard" }
    ]
  },
  {
    id: "advertisement",
    name: "Advertisement",
    subModules: [
      { id: "advertisement_main", name: "Advertisement" },
      { id: "advertisement_update", name: "Advertisement >> Update advertiser" }
    ]
  },
  {
    id: "analytics",
    name: "Analytics",
    subModules: [
      { id: "analytics_main", name: "Analytics" },
      { id: "analytics_clear", name: "Analytics >> Clear analytics" },
      { id: "analytics_news", name: "Analytics >> News based" },
      { id: "analytics_location", name: "Analytics >> Location based" },
      { id: "analytics_live", name: "Analytics >> Live now" }
    ]
  },
  {
    id: "archive",
    name: "Archive",
    subModules: [
      { id: "archive_main", name: "Archive" }
    ]
  },
  {
    id: "category",
    name: "Category",
    subModules: [
      { id: "category_main", name: "Category" }
    ]
  },
  {
    id: "comments",
    name: "Comments",
    subModules: [
      { id: "comments_main", name: "Comments" }
    ]
  },
  {
    id: "media_library",
    name: "Media library",
    subModules: [
      { id: "media_library_main", name: "Media library" },
      { id: "media_library_photo_list", name: "Media library >> Photo list" },
      { id: "media_library_photo_upload", name: "Media library >> Photo upload" }
    ]
  },
  {
    id: "menu",
    name: "Menu",
    subModules: [
      { id: "menu_main", name: "Menu" }
    ]
  },
  {
    id: "news",
    name: "News",
    subModules: [
      { id: "news_main", name: "News" },
      { id: "news_photo_post", name: "News >> Photo post" },
      { id: "news_positioning", name: "News >> Positioning" },
      { id: "news_breaking", name: "News >> Trending news" },
      { id: "news_post", name: "News >> Post" }
    ]
  },
  {
    id: "page",
    name: "Page",
    subModules: [
      { id: "page_main", name: "Page" },
      { id: "page_list", name: "Page >> Page list" }
    ]
  },
  {
    id: "reporter",
    name: "Reporter",
    subModules: [
      { id: "reporter_main", name: "Reporter" },
      { id: "reporter_last_access", name: "Reporter >> Last 20 access" },
      { id: "reporter_subscribers", name: "Reporter >> Subscribers" }
    ]
  },
  {
    id: "seo",
    name: "Seo",
    subModules: [
      { id: "seo_main", name: "Seo" },
      { id: "seo_custom_code", name: "Seo >> Custom code" },
      { id: "seo_social_link", name: "Seo >> Social link" },
      { id: "seo_social_site", name: "Seo >> Social site" },
      { id: "seo_meta_setting", name: "Seo >> Meta setting" }
    ]
  },
  {
    id: "setting",
    name: "Setting",
    subModules: [
      { id: "setting_main", name: "Setting" },
      { id: "setting_cookie", name: "Setting >> Cookie content" },
      { id: "setting_panel_face", name: "Setting >> Panel face" },
      { id: "setting_date_field", name: "Setting >> Date field setup" },
      { id: "setting_cache", name: "Setting >> Cache system" },
      { id: "setting_social_auth", name: "Setting >> Social auth setting" },
      { id: "setting_color", name: "Setting >> Color setting" },
      { id: "setting_404", name: "Setting >> 404 page setting" },
    ]
  },
  {
    id: "theme_setup",
    name: "Theme setup",
    subModules: [
      { id: "theme_setup_main", name: "Theme setup" }
    ]
  }
];
