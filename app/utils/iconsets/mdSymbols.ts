import { h } from 'vue'
import type { IconSet, IconProps } from 'vuetify'

interface CustomIconProps extends IconProps {
  size?: number | string
  color?: string
}

const createMdSymbolsSet = (className: string): IconSet => ({
  component: (props: CustomIconProps) => {
    let iconName = typeof props.icon === 'string' ? props.icon : ''
    let fillValue = 1
    if (iconName.endsWith('_outlined')) {
      iconName = iconName.replace('_outlined', '')
      fillValue = 0
    }

    return h(
      'span',
      {
        class: className,
        style: {
          fontVariationSettings: `'FILL' ${fillValue}, 'wght' 400, 'GRAD' 0, 'opsz' ${props.size || 24}`,
          fontSize: props.size ? `${props.size}px` : undefined,
          color: props.color,
        },
      },
      iconName,
    )
  },
})

/**
 * `md:name` - Material Symbols. Production builds only ship the icons the code names
 * (modules/iconSubset.ts), so write the full name in the code, e.g. `md:school`, never `md:${name}`.
 */
export const mdSymbols = createMdSymbolsSet('material-symbols-outlined')

/**
 * `mdfull:name` - the full Material Symbols font, for icon names that come from data at run time
 * (e.g. school facility tags an admin can add). The font only downloads on pages that show one.
 */
export const mdSymbolsFull = createMdSymbolsSet('material-symbols-full')
