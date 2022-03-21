import {Request, Response} from "enonic-types/controller";
import {React4xpResponse} from "../../../lib/types/react4xp";
import {EndedStatisticsPartConfig} from "./endedStatistics-part-config";
import {Content} from "enonic-types/content";
import {Phrases} from "../../../lib/types/language";
import {CmsStatistic, XpStatistic} from "../../../lib/types/relatedStatistics";
import {Statistics} from "../../content-types/statistics/statistics";

const {
  data: {
    forceArray
  }
} = __non_webpack_require__('/lib/util')
const {
  get
} = __non_webpack_require__('/lib/xp/content')
const {
  getContent,
  getComponent,
  pageUrl
} = __non_webpack_require__('/lib/xp/portal')
const {
  getPhrases
} = __non_webpack_require__('/lib/ssb/utils/language')
const {
  render
} = __non_webpack_require__('/lib/thymeleaf')
const {
  renderError
} = __non_webpack_require__('/lib/ssb/error/error')
const {
  hasPath
} = __non_webpack_require__('/lib/vendor/ramda')

const React4xp = __non_webpack_require__('/lib/enonic/react4xp')
const view = resolve('./endedStatistics.html')

exports.get = (req: Request) => {
  try {
    return renderPart(req)
  } catch (e) {
    return renderError(req, 'Error in part ', e)
  }
}

exports.preview = (req: Request) => renderPart(req)

function renderPart(req: Request): Response | React4xpResponse {
  const page: Content = getContent()
  const part: EndedStatisticsPartConfig = getComponent().config
  const endedStatistics: Array<CmsStatistic|XpStatistic> = part.relatedStatisticsOptions ? forceArray(part.relatedStatisticsOptions) : []

  const phrases = getPhrases(page)

  return renderEndedStatistics(parseContent(endedStatistics), phrases)
}

function renderEndedStatistics(endedStatisticsContent: Array<EndedStatistic | undefined>, phrases: Phrases): React4xpResponse {
  if (endedStatisticsContent && endedStatisticsContent.length) {
    const endedStatisticsXP = new React4xp('EndedStatistics')
      .setProps({
        endedStatistics: endedStatisticsContent.map((statisticsContent) => {
          return {
            ...statisticsContent
          }
        }),
        iconText: phrases.endedCardText,
        buttonText: phrases.endedStatistics
      })
      .uniqueId()

    const body = render(view, {
      endedStatisticsId: endedStatisticsXP.react4xpId
    })

    return {
      body: endedStatisticsXP.renderBody({
        body
      }),
      pageContributions: endedStatisticsXP.renderPageContributions()
    }
  }
  return {
    body: '',
    pageContributions: ''
  }
}

function parseContent(endedStatistics: Array<CmsStatistic|XpStatistic>): Array<EndedStatistic | undefined> {
  if (endedStatistics && endedStatistics.length) {
    return endedStatistics.map((statistics) => {
      if (statistics._selected === 'xp' && statistics.xp.contentId) {
        const statisticsContentId: string = statistics.xp.contentId
        const endedStatisticsContent: Content<Statistics> | null = statisticsContentId ? get({
          key: statisticsContentId
        }) : null

        let preamble
        if (hasPath(['x', 'com-enonic-app-metafields', 'meta-data', 'seoDescription'], endedStatisticsContent)) {
          // TS gets confused here, the field totally exists. Promise.
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          preamble = endedStatisticsContent?.x['com-enonic-app-metafields']['meta-data'].seoDescription
        }

        return {
          title: endedStatisticsContent ? endedStatisticsContent.displayName : '',
          preamble: preamble ? preamble : '',
          href: pageUrl({
            id: statisticsContentId
          })
        }
      }
      else if (statistics._selected === 'cms') {
        return {
          title: statistics.cms.title,
          preamble: statistics.cms.profiledText,
          href: statistics.cms.url
        }
      } else return undefined
    }).filter((statistics) => !!statistics)
  }else return []
}


interface EndedStatistic {
  title: string;
  preamble: string;
  href: string;
}
