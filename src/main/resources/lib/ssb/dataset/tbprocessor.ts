import { DatasetRepoNode, RepoDatasetLib } from '../../repo/dataset'
import { Content } from 'enonic-types/content'
import { DataSource } from '../../../site/mixins/dataSource/dataSource'
import { RepoQueryLib } from '../../repo/query'
import { TbmlData, TbmlSourceList } from '../../types/xmlParser'
import {TbmlLib, TbprocessorParsedResponse} from '../../tbml/tbml'
import { mergeDeepLeft } from 'ramda'

const {
  getDataset
}: RepoDatasetLib = __non_webpack_require__('/lib/repo/dataset')
const {
  getTbmlData,
  getTbmlSourceList
}: TbmlLib = __non_webpack_require__('/lib/tbml/tbml')
const {
  logUserDataQuery,
  Events
}: RepoQueryLib = __non_webpack_require__('/lib/repo/query')
const {
  isUrl
} = __non_webpack_require__('/lib//ssb/utils')

export function getTbprocessor(content: Content<DataSource>, branch: string): DatasetRepoNode<TbmlData> | null {
  if (content.data.dataSource && content.data.dataSource._selected) {
    const dataSource: DataSource['dataSource'] = content.data.dataSource
    if (dataSource.tbprocessor && dataSource.tbprocessor.urlOrId) {
      const langauge: string = content.language || ''
      return getDataset(content.data.dataSource?._selected, branch, `${getTbprocessorKey(content)}${langauge === 'en' ? langauge : ''}`)
    }
  }
  return null
}

function hasTBProcessorDatasource(content: Content<DataSource>): string | undefined {
  return content.data.dataSource &&
    content.data.dataSource._selected &&
    content.data.dataSource.tbprocessor &&
    content.data.dataSource.tbprocessor.urlOrId
}

function tryRequestTbmlData(url: string, contentId?: string, processXml?: string ): TbprocessorParsedResponse | null {
  try {
    return getTbmlData(url, contentId, processXml)
  } catch (e) {
    const message: string = `Failed to fetch data from tbprocessor: ${contentId} (${e})`
    if (contentId) {
      logUserDataQuery(contentId, {
        file: '/lib/ssb/dataset/tbprocessor.ts',
        function: 'fetchTbprocessorData',
        message: Events.REQUEST_COULD_NOT_CONNECT,
        info: message,
        status: e
      })
    }
    log.error(message)
  }
  return null
}

function tryRequestTbmlSourceList(url: string, contentId?: string): TbmlSourceList | null {
  try {
    return getTbmlSourceList(url)
  } catch (e) {
    const message: string = `Failed to fetch source list from tbprocessor: ${contentId} (${e})`
    if (contentId) {
      logUserDataQuery(contentId, {
        file: '/lib/ssb/dataset/tbprocessor.ts',
        function: 'tryRequestTbmlSourceList',
        message: Events.REQUEST_COULD_NOT_CONNECT,
        info: message,
        status: e
      })
    }
    log.error(message)
  }
  return null
}

function getDataAndMetaData(content: Content<DataSource>, processXml?: string ): TbmlData | null {
  const baseUrl: string = app.config && app.config['ssb.tbprocessor.baseUrl'] ?
    app.config['ssb.tbprocessor.baseUrl'] : 'https://i.ssb.no/tbprocessor'
  const dataPath: string = `/process/tbmldata/`
  const sourceListPath: string = `/document/sourceList/`
  const language: string = content.language || ''

  const tbmlKey: string = getTbprocessorKey(content)
  const tbmlData: TbmlData | null = tryRequestTbmlData(
    `${baseUrl}${dataPath}${tbmlKey}${language === 'en' ? `?lang=${language}` : ''}`,
    content._id,
    processXml)

  const tbmlSourceList: TbmlSourceList | null = tryRequestTbmlSourceList(`${baseUrl}${sourceListPath}${tbmlKey}`, content._id)

  const sourceListObject: object = {
    tbml: {
      metadata: {
        sourceList: tbmlSourceList ? tbmlSourceList.sourceList.tbml.source : undefined
      }
    }
  }
  const tbmlDataAndSourceList: TbmlData | null = tbmlData && tbmlSourceList ?
    mergeDeepLeft(tbmlData, sourceListObject) : null

  return tbmlData && !tbmlSourceList ? tbmlData : tbmlDataAndSourceList
}

export function fetchTbprocessorData(content: Content<DataSource>, processXml?: string): TbmlData | null {
  const urlOrId: string | undefined = hasTBProcessorDatasource(content)
  return urlOrId ? getDataAndMetaData(content, processXml) : null
}

export function getTbprocessorKey(content: Content<DataSource>): string {
  if (content.data.dataSource && content.data.dataSource.tbprocessor && content.data.dataSource.tbprocessor.urlOrId) {
    let key: string = content.data.dataSource.tbprocessor.urlOrId
    if (isUrl(key)) {
      key = key.replace(/\/$/, '')
      const split: Array<string> = key.split('/')
      key = split[split.length - 1]
    }
    return key
  }
  return content._id // fallback, should never find anything
}

export function getTableIdFromTbprocessor(data: TbmlData): Array<string> {
  if (data && data.tbml.metadata.instance.publicRelatedTableIds) {
    return data.tbml.metadata.instance.publicRelatedTableIds.toString().split(' ')
  }
  return []
}

export interface TbprocessorLib {
  getTbprocessor: (content: Content<DataSource>, branch: string) => DatasetRepoNode<TbmlData> | null;
  fetchTbprocessorData: (content: Content<DataSource>, processXml?: string) => TbmlData | null;
  getTbprocessorKey: (content: Content<DataSource>) => string;
  getTableIdFromTbprocessor: (dataset: TbmlData) => Array<string>;
}
