export interface SpacingConfig {
  value: number
  unit: 'px' | 'rem' | 'em' | '%'
}

export interface SpacerData {
  layout?: 'default' | 'section' | 'article'
  margin?: SpacingConfig
  marginTop?: SpacingConfig
  marginBottom?: SpacingConfig
  marginLeft?: SpacingConfig
  marginRight?: SpacingConfig
  padding?: SpacingConfig
  paddingTop?: SpacingConfig
  paddingBottom?: SpacingConfig
  paddingLeft?: SpacingConfig
  paddingRight?: SpacingConfig
  height?: SpacingConfig
  backgroundColor?: string
  border?: string
  borderRadius?: string
  className?: string
}