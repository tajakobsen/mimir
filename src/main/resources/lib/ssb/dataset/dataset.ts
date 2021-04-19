import { ContentLibrary, Content, QueryResponse } from 'enonic-types/content'
import { DataSource } from '../../../site/mixins/dataSource/dataSource'
import { DataSource as DataSourceType, DatasetRepoNode, RepoDatasetLib } from '../../repo/dataset'
import { StatbankApiLib } from './statbankApi'
import { JSONstat } from '../../types/jsonstat-toolkit'
import { RepoQueryLib } from '../../repo/query'
import { StatbankSavedRaw, TbmlDataUniform } from '../../types/xmlParser'
import { TbprocessorLib } from './tbprocessor'
import { KlassLib } from './klass'
import { ContextLibrary, RunContext } from 'enonic-types/context'
import { AuthLibrary, User } from 'enonic-types/auth'
import { StatbankSavedLib } from './statbankSaved'
import { TbprocessorParsedResponse } from '../../tbml/tbml'
import { RepoCommonLib } from '../../repo/common'

const {
  Events
}: RepoQueryLib = __non_webpack_require__('/lib/repo/query')
const {
  query
}: ContentLibrary = __non_webpack_require__('/lib/xp/content')
const {
  run
}: ContextLibrary = __non_webpack_require__('/lib/xp/context')
const {
  getUser
}: AuthLibrary = __non_webpack_require__('/lib/xp/auth')
const {
  getStatbankApi,
  fetchStatbankApiData,
  getStatbankApiKey
}: StatbankApiLib = __non_webpack_require__('/lib/ssb/dataset/statbankApi')
const {
  fetchStatbankSavedData
}: StatbankSavedLib = __non_webpack_require__('/lib/ssb/dataset/statbankSaved')
const {
  getTbprocessor,
  getTbprocessorKey,
  fetchTbprocessorData
}: TbprocessorLib = __non_webpack_require__('/lib/ssb/dataset/tbprocessor')
const {
  getKlass,
  getKlassKey,
  fetchKlassData
}: KlassLib = __non_webpack_require__('/lib/ssb/dataset/klass')
const {
  createOrUpdateDataset,
  deleteDataset: deleteDatasetFromRepo,
  DATASET_BRANCH
}: RepoDatasetLib = __non_webpack_require__('/lib/repo/dataset')
const {
  ENONIC_CMS_DEFAULT_REPO
}: RepoCommonLib = __non_webpack_require__('/lib/repo/common')

export function getDataset(content: Content<DataSource>, branch: string = DATASET_BRANCH): DatasetRepoNode<JSONstat | TbmlDataUniform | object> | null {
  switch (content.data.dataSource?._selected) {
  case DataSourceType.STATBANK_API: {
    return getStatbankApi(content, branch)
  }
  case DataSourceType.TBPROCESSOR: {
    return getTbprocessor(content, branch)
  }
  case DataSourceType.KLASS: {
    return getKlass(content, branch)
  }
  default: {
    return null
  }
  }
}

export function extractKey(content: Content<DataSource>): string | null {
  switch (content.data.dataSource?._selected) {
  case DataSourceType.STATBANK_API:
    return getStatbankApiKey(content)
  case DataSourceType.TBPROCESSOR:
    const language: string = content.language || ''
    return `${getTbprocessorKey(content)}${language === 'en' ? language : ''}`
  case DataSourceType.STATBANK_SAVED:
    return getStatbankApiKey(content)
  case DataSourceType.KLASS:
    return getKlassKey(content)
  default:
    return null
  }
}

function fetchData(content: Content<DataSource>, processXml?: string): JSONstat | TbprocessorParsedResponse<TbmlDataUniform> | StatbankSavedRaw | object | null {
  switch (content.data.dataSource?._selected) {
  case DataSourceType.STATBANK_API:
    return fetchStatbankApiData(content) // JSONstat | null;
  case DataSourceType.TBPROCESSOR:
    return fetchTbprocessorData(content, processXml) // TbprocessorParsedResponse<TbmlDataUniform> | null;
  case DataSourceType.STATBANK_SAVED:
    return fetchStatbankSavedData(content) // StatbankSavedRaw | null;
  case DataSourceType.KLASS:
    return fetchKlassData(content) // object | null
  default:
    return null
  }
}

export function refreshDataset(
  content: Content<DataSource>,
  branch: string = DATASET_BRANCH,
  processXml?: string ): CreateOrUpdateStatus {
  /**/
  const newDataset: JSONstat | TbmlDataUniform | TbprocessorParsedResponse<TbmlDataUniform> | object | null = fetchData(content, processXml)
  const key: string | null = extractKey(content)
  const user: User | null = getUser()

  if (newDataset && content.data.dataSource && content.data.dataSource._selected && key) {
    let oldDataset: DatasetRepoNode<JSONstat | TbmlDataUniform | object> | null = getDataset(content, branch)

    // Check if data is of type TbprocessorParsedResponse
    if (determineIfTbprocessorParsedResponse(newDataset) && content.data.dataSource._selected === DataSourceType.TBPROCESSOR) {
      // pass error msg from tbprocessor: e.g: bad username/password combo, wrong tbml id.
      if (newDataset.status && newDataset.status === 500) {
        return {
          dataquery: content,
          status: newDataset.body ? newDataset.body : '',
          dataset: null,
          hasNewData: false,
          hasNewSourceList: false,
          newDataset,
          branch,
          user
        }
      } else {
        const hasNewData: boolean = newDataset.parsedBody ? isDataNew(newDataset.parsedBody, oldDataset) : false
        const hasNewSourceList: boolean = !!(newDataset.parsedBody && newDataset.parsedBody.tbml.metadata.sourceList)
        if ((!oldDataset || hasNewData) && newDataset.parsedBody) {
          oldDataset = createOrUpdateDataset(content.data.dataSource?._selected, branch, key, newDataset.parsedBody)
        }
        return {
          dataquery: content,
          status: hasNewData ? Events.GET_DATA_COMPLETE : Events.NO_NEW_DATA,
          hasNewData: hasNewData,
          hasNewSourceList,
          dataset: oldDataset,
          newDataset,
          branch,
          user
        }
      }
    } else {
      const hasNewData: boolean = isDataNew(newDataset, oldDataset)
      if (!oldDataset || hasNewData) {
        oldDataset = createOrUpdateDataset(content.data.dataSource?._selected, branch, key, newDataset)
      }
      return {
        dataquery: content,
        status: hasNewData ? Events.GET_DATA_COMPLETE : Events.NO_NEW_DATA,
        hasNewData: hasNewData,
        dataset: oldDataset,
        user
      }
    }
  } else {
    return {
      dataquery: content,
      status: Events.FAILED_TO_GET_DATA,
      dataset: null,
      hasNewData: false,
      user
    }
  }
}

function determineIfTbprocessorParsedResponse(toBeDetermined: TbprocessorParsedResponse<TbmlDataUniform> | object):
  toBeDetermined is TbprocessorParsedResponse<TbmlDataUniform> {
  if ((toBeDetermined as TbprocessorParsedResponse<TbmlDataUniform>).status) {
    return true
  }
  return false
}


export function refreshDatasetWithUserKey(content: Content<DataSource>, userLogin: string, branch: string = DATASET_BRANCH, ): CreateOrUpdateStatus {
  const context: RunContext = {
    branch: 'master',
    repository: ENONIC_CMS_DEFAULT_REPO,
    principals: ['role:system.admin'],
    user: {
      login: userLogin,
      idProvider: 'system'
    }
  }
  return run(context, () => refreshDataset(content, branch))
}

export function deleteDataset(content: Content<DataSource>, branch: string = DATASET_BRANCH): boolean {
  const key: string | null = extractKey(content)
  if (content.data.dataSource && content.data.dataSource._selected && key) {
    return deleteDatasetFromRepo(content.data.dataSource._selected, branch, key)
  } else {
    return false
  }
}

export function getContentWithDataSource(): Array<Content<DataSource>> {
  let start: number = 0
  let count: number = 100
  let hits: Array<Content<DataSource>> = []
  while (count === 100) {
    const result: QueryResponse<DataSource> = query({
      start,
      count,
      query: `data.dataSource._selected LIKE "*"`
    })
    count = result.count
    start += count
    hits = hits.concat(result.hits)
  }
  return hits
}

function isDataNew(
  newDataset: JSONstat | TbmlDataUniform | object,
  oldDataset: DatasetRepoNode<JSONstat | TbmlDataUniform | object> | null): boolean {
  if (!oldDataset) {
    return true
  } else if (newDataset && oldDataset) {
    return JSON.stringify(oldDataset.data, null, 0) !== JSON.stringify(newDataset, null, 0)
  }
  return false
}

export interface CreateOrUpdateStatus {
  dataquery: Content<DataSource>;
  dataset: DatasetRepoNode<JSONstat | TbmlDataUniform | object> | null;
  hasNewData: boolean;
  hasNewSourceList?: boolean;
  status: string;
  user: User | null;
  newDataset?: object;
  branch?: string;
}

export interface DatasetLib {
  getDataset: (content: Content<DataSource>, branch?: string) => DatasetRepoNode<JSONstat | TbmlDataUniform | object> | null;
  extractKey: (content: Content<DataSource>) => string;
  refreshDataset: (content: Content<DataSource>, branch?: string, processXml?: string) => CreateOrUpdateStatus;
  refreshDatasetWithUserKey: (content: Content<DataSource>, userLogin: string, branch?: string) => CreateOrUpdateStatus;
  deleteDataset: (content: Content<DataSource>, branch?: string) => boolean;
  getContentWithDataSource: () => Array<Content<DataSource>>;
  isDataNew: (data: JSONstat | TbmlDataUniform | object, dataset: DatasetRepoNode<JSONstat | TbmlDataUniform | object> | null) => boolean;
}
