export interface MarginConfig {
  value: number
  unit: 'px' | 'rem' | 'em' | '%'
}

export interface ContentData {
  title?: string
  content?: string
  contentLayout?: 'default' | 'section' | 'article'
  marginTop?: MarginConfig
  marginBottom?: MarginConfig
}
