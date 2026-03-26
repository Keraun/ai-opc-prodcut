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
  title?: string
  description?: string
  plans?: PricingFeature[]
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

export interface ContactData {
  title?: string
  description?: string
  sectionTag?: string
  methods?: ContactMethod[]
}

export interface NavigationItem {
  label?: string
  href?: string
}

export interface NavigationData {
  main?: NavigationItem[]
  sidebar?: NavigationItem[]
}

export interface SidebarNavData {
  visible?: boolean
}

export interface FooterData {
  description?: string
}
