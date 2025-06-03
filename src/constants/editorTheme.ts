export const editorTheme = (t: any) => {

  const themeColorList = [
    { label: t('themeColors.default'), value: '#F5F5F5', labelColor: '#333333' },
    { label: t('themeColors.mica'), value: '#F8F7F4', labelColor: '#333333' },
    { label: t('themeColors.coldPorcelain'), value: '#F3F5F7', labelColor: '#2D3847' },
    { label: t('themeColors.night'), value: '#1A1A1A', labelColor: '#E6E6E6' },
    { label: t('themeColors.inkJade'), value: '#121212', labelColor: '#D9D9D9' },
    { label: t('themeColors.midnight'), value: '#2B2F3A', labelColor: '#C0C5CE' },
    { label: t('themeColors.warmSand'), value: '#F4EED7', labelColor: '#3E3A32' },
    { label: t('themeColors.paleYellow'), value: '#FAF3E0', labelColor: '#2B2A27' },
    { label: t('themeColors.linen'), value: '#EFE5CD', labelColor: '#333333' },
    { label: t('themeColors.morningMist'), value: '#E8F0F7', labelColor: '#1A365F' },
    { label: t('themeColors.celadon'), value: '#EDF2F5', labelColor: '#2D3847' },
    { label: t('themeColors.mint'), value: '#E5ECE8', labelColor: '#2F373E' },
  ]

  const paperList = [
    { label: t('paperTypes.parchment'), value: '/images/global/parchment.png' },
    { label: t('paperTypes.ricePaper'), value: '/images/global/ricePaper.png' },
    { label: t('paperTypes.flocPattern'), value: '/images/global/flocPattern.png' },
    { label: t('paperTypes.fibrousShadowPattern'), value: '/images/global/fibrousShadowPattern.png' },
    { label: t('paperTypes.riceFrostPattern'), value: '/images/global/RiceFrostPattern.png' },
  ]

  return { themeColorList, paperList }
}
