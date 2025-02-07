import { Content } from '/lib/xp/content'
import { render as r4XpRender, RenderResponse } from '/lib/enonic/react4xp'
import { ResourceKey, render } from '/lib/thymeleaf'
import { Component } from '/lib/xp/portal'
import { MunicipalityWithCounty } from '../../../lib/ssb/dataset/klass/municipalities'
import { MenuDropdownPartConfig } from '../menuDropdown/menuDropdown-part-config'
import { SiteConfig } from '../../site-config'
import { MenuDropdown } from '../../content-types/menuDropdown/menuDropdown'
import { randomUnsafeString } from '/lib/ssb/utils/utils'

const {
  assetUrl,
  getContent,
  getComponent,
  pageUrl,
  getSiteConfig,
  serviceUrl
} = __non_webpack_require__('/lib/xp/portal')
const {
  municipalsWithCounties,
  getMunicipality,
  removeCountyFromMunicipalityName
} = __non_webpack_require__('/lib/ssb/dataset/klass/municipalities')

const {
  renderError
} = __non_webpack_require__('/lib/ssb/error/error')

const i18nLib = __non_webpack_require__('/lib/xp/i18n')

const view: ResourceKey = resolve('./menuDropdown.html')

exports.get = (req: XP.Request):XP.Response | RenderResponse => {
  try {
    return renderPart(req)
  } catch (e) {
    return renderError(req, 'Error in part', e)
  }
}

exports.preview = (req:XP.Request) => renderPart(req)

function renderPart(req:XP.Request): XP.Response | RenderResponse {
  const parsedMunicipalities:Array<MunicipalityWithCounty> = municipalsWithCounties()
  const municipality:MunicipalityWithCounty | undefined = getMunicipality(req)
  const component: Component<MenuDropdownPartConfig> = getComponent()
  const siteConfig: SiteConfig = getSiteConfig()
  let mapFolder: string = '/mapdata'

  if (typeof siteConfig.kommunefakta !== 'undefined' && siteConfig.kommunefakta.mapfolder) {
    mapFolder = siteConfig.kommunefakta.mapfolder
  }

  const dataPathAssetUrl: string = assetUrl( {
    path: mapFolder
  })

  const dataServiceUrl: string = serviceUrl({
    service: 'municipality'
  })

  const page: Content<MenuDropdown> = getContent()
  const baseUrl: string = component.config.basePage ?
    pageUrl({
      id: component.config.basePage
    }) :
    pageUrl({
      id: page._id
    })

  const searchBarText: string = i18nLib.localize({
    key: 'menuDropdown.searchBarText'
  })

  const municipalityItems: Array<Municipality> = parsedMunicipalities.map( (municipality) => ({
    id: municipality.path,
    title: municipality.displayName
  }))

  const municipalityName: string | undefined = municipality ? removeCountyFromMunicipalityName(municipality.displayName) : undefined
  const reactUuid: string = randomUnsafeString()

  const model: ThymeleafModel = {
    modeMunicipality: component.config.modeMunicipality,
    displayName: page.displayName,
    baseUrl,
    dataPathAssetUrl,
    dataServiceUrl,
    municipality: municipality,
    municipalityName: municipalityName,
    municipalityList: municipalityItems,
    dropdownId: reactUuid
  }

  const thymeleafRender: string = render(view, model)

  // Dropdown react object for sticky menu
  return r4XpRender('site/parts/menuDropdown/DropdownMunicipality',
    {
      ariaLabel: searchBarText,
      placeholder: searchBarText,
      items: municipalityItems,
      baseUrl: baseUrl
    },
    req,
    {
      id: reactUuid,
      body: thymeleafRender,
      clientRender: req.mode !== 'edit'
    })
}

interface Municipality {
  id: string,
  title: string
}

interface ThymeleafModel {
  modeMunicipality: boolean,
  displayName: string,
  baseUrl: string,
  dataPathAssetUrl: string,
  dataServiceUrl: string,
  municipality: MunicipalityWithCounty | undefined,
  municipalityName: string | undefined,
  municipalityList: Array<Municipality>
  dropdownId: string
}
