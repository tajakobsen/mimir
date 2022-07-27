import { Content, ContentLibrary } from 'enonic-types/content'
import { Request, Response } from 'enonic-types/controller'
import { React4xp, React4xpResponse } from '../../../lib/types/react4xp'
import { ResourceKey, render } from 'enonic-types/thymeleaf'
import { Component } from 'enonic-types/portal'
import { MenuBoxPartConfig } from '../menuBox/menuBox-part-config'
import { MenuBox } from '../../content-types/menuBox/menuBox'

const {
  getComponent,
  imageUrl,
  pageUrl
} = __non_webpack_require__('/lib/xp/portal')

const {
  renderError
} = __non_webpack_require__('/lib/ssb/error/error')
const {
  getImageAlt
} = __non_webpack_require__('/lib/ssb/utils/imageUtils')
const {
  data: {
    forceArray
  }
} = __non_webpack_require__('/lib/util')

const content: ContentLibrary = __non_webpack_require__('/lib/xp/content')
const view: ResourceKey = resolve('./menuBox.html')
const React4xp: React4xp = __non_webpack_require__('/lib/enonic/react4xp') as React4xp

exports.get = function(req:Request):Response | React4xpResponse | string {
  try {
    return renderPart(req)
  } catch (e) {
    return renderError(req, 'Error in part', e)
  }
}

exports.preview = function(req:Request):Response | React4xpResponse | string {
  return renderPart(req)
}

function renderPart(req:Request):Response | React4xpResponse | string {
  const part:Component<MenuBoxPartConfig> = getComponent()
  const menuBoxId: string = part.config.menu
  const height: string = part.config.height ? part.config.height as string : 'default'
  if (!menuBoxId) {
    if (req.mode === 'edit') {
      return {
        body: render(view, {
          title: 'Liste profilerte kort',
          message: 'MenuBox - Missing Id'
        })
      }
    } else {
      throw new Error('MenuBox - Missing Id')
    }
  }
  const menuBoxContent: Content<MenuBox> | null = content.get({
    key: menuBoxId
  })
  if (!menuBoxContent) throw new Error(`MenuBox with id ${menuBoxId} doesn't exist`)

  const boxes: Array<MenuItem> = buildMenu(menuBoxContent)

  const props: MenuBoxProps = {
    boxes,
    height
  }

  return React4xp.render('MenuBox', props, req)
}

function buildMenu(menuBoxContent: Content<MenuBox> ): Array<MenuItem> {
  const menuItems: Array<MenuConfig | undefined> = forceArray(menuBoxContent.data.menu)
  return menuItems ? menuItems.map((box: MenuConfig| undefined): MenuItem => {
    const boxTitle: string = box?.title ? box.title : ''
    const titleSize: string = getTitleSize(boxTitle)
    return {
      title: boxTitle,
      subtitle: box?.subtitle ? box.subtitle : '',
      icon: box?.image ? getIcon(box.image) : undefined,
      href: box ? getHref(box) : '',
      titleSize
    }
  }) : []
}

function getIcon(iconId: string): Image | undefined {
  if (iconId) {
    return {
      src: imageUrl({
        id: iconId,
        scale: 'block(100,100)'
      }),
      alt: getImageAlt(iconId) ? getImageAlt(iconId) : ' '
    }
  } else {
    return undefined
  }
}

function getHref(menuConfig: MenuConfig): string {
  if (menuConfig.urlSrc && menuConfig.urlSrc._selected === 'manual') {
    return menuConfig.urlSrc.manual.url
  } else if (menuConfig.urlSrc && menuConfig.urlSrc.content) {
    return pageUrl({
      id: menuConfig.urlSrc.content.contentId
    })
  }
  return ''
}

function getTitleSize(title: string): string {
  const titleLength: number = title.length
  let titleSize: string = 'sm'
  if (titleLength > 25) {
    titleSize = 'md'
  }
  if (titleLength > 50) {
    titleSize = 'lg'
  }
  return titleSize
}

interface MenuBoxProps {
  boxes: Array<MenuItem>;
  height: string;
}

interface MenuConfig {
  title?: string,
  subtitle?: string,
  image?: string,
  urlSrc?: hrefManual | hrefContent
}

interface hrefManual {
  _selected: 'manual',
  manual: {
    url: string
  }
}

interface hrefContent {
  _selected: 'content',
  content: {
    contentId: string
  }
}

interface MenuItem {
  title: string,
  subtitle: string,
  icon: Image | undefined,
  href: string,
  titleSize: string
}

interface Image {
  src: string,
  alt: string | undefined
}
