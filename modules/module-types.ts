export interface HeroTitle {
  main?: string
  sub?: string
  highlight?: string
}

export interface HeroButton {
  text?: string
  href?: string
}

export interface HeroButtons {
  primary?: HeroButton
  secondary?: HeroButton
}

export interface HeroData {
  layout?: 'layout1' | 'layout2' | 'layout3'
  badge?: string
  title?: HeroTitle
  subtitle?: string
  buttons?: HeroButtons
  featurePills?: string[]
  mainImage?: string
}

export interface ServicesItem {
  title?: string
  description?: string
  highlights?: string[]
}

export interface ServicesData {
  title?: string
  description?: string
  sectionTag?: string
  items?: ServicesItem[]
}

export interface PartnerItem {
  src?: string
  alt?: string
}

export interface PartnerData {
  title?: string
  description?: string
  items?: PartnerItem[]
}

export interface ProductsItem {
  id?: string
  name?: string
  description?: string
  icon?: string
  tag?: string
  tagColor?: string
  features?: string[]
  link?: string
}

export interface ProductsData {
  title?: string
  description?: string
  sectionTag?: string
  items?: ProductsItem[]
}

export interface PricingFeature {
  title?: string
  price?: string
  description?: string
  features?: string[]
  buttonText?: string
  buttonLink?: string
  link?: string
  isPopular?: boolean
}

export interface PricingData {
  sectionTag: string | undefined
  title?: string
  description?: string
  plans?: PricingFeature[]
  popularBadgeText?: string
}

export interface AboutStat {
  value?: string
  label?: string
}

export interface AboutMission {
  title?: string
  description?: string
}

export interface AboutData {
  sectionTag?: string
  title?: HeroTitle
  description?: string[]
  mission?: AboutMission
  vision?: AboutMission
  values?: AboutMission
  stats?: AboutStat[]
}

export interface ContactMethod {
  type?: string
  value?: string
  label?: string
}

export interface ContactPreference {
  value?: string
  label?: string
}

export interface ContactData {
  title?: string
  description?: string
  sectionTag?: string
  methods?: ContactMethod[]
  contactPreferences?: ContactPreference[]
}

export interface NavigationItem {
  label?: string
  href?: string
}

export interface NavigationData {
  main?: NavigationItem[]
  sidebar?: NavigationItem[]
}

export interface HeaderData {
  navItems?: NavigationItem[]
  showContactButton?: boolean
  showCtaButton?: boolean
  ctaButtonText?: string
  ctaButtonLink?: string
}

export interface SidebarNavData {
  visible?: boolean
  size?: 'small' | 'medium' | 'large'
}

export interface FooterData {
  description?: string
  address?: string
  phone?: string
  email?: string
  wechatQrCode?: string
  officialAccountQrCode?: string
  showAdminLink?: boolean
}

export interface SiteLinks {
  email?: string
  wechat?: string
  github?: string
  twitter?: string
}

export interface SiteCreator {
  name?: string
  url?: string
}

export interface SiteContact {
  address?: string
  phone?: string
  email?: string
}

export interface SiteSupport {
  customerServiceQRCode?: string
  helpDocUrl?: string
}

export interface SiteFeatures {
  enableTOC?: boolean
  enableReadingProgress?: boolean
  enableSearch?: boolean
}

export interface SiteGoogleBot {
  index?: boolean
  follow?: boolean
  maxVideoPreview?: number
  maxImagePreview?: 'none' | 'standard' | 'large'
  maxSnippet?: number
}

export interface SiteRobots {
  index?: boolean
  follow?: boolean
  googleBot?: SiteGoogleBot
}

export interface SiteSeo {
  keywords?: string[]
  robots?: SiteRobots
}

export interface SiteRootData {
  name?: string
  description?: string
  url?: string
  logo?: string
  ogImage?: string
  links?: SiteLinks
  creator?: SiteCreator
  contact?: SiteContact
  support?: SiteSupport
  icp?: string
  features?: SiteFeatures
  seo?: SiteSeo
  currentTheme?: string
}
