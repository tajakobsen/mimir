import Button from 'react-bootstrap/Button'
import React, { useContext, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { selectLoadingClearCache } from '../HomePage/selectors'
import { WebSocketContext } from '../../utils/websocket/WebsocketProvider'
import { requestClearCache } from '../HomePage/actions.es6'
import { RefreshCw, Trash } from 'react-feather'
import { Col, Container, Row } from 'react-bootstrap'
import { Dropdown } from '@statisticsnorway/ssb-component-library'
import { selectStatistics, selectLoading, selectHasLoadingStatistic } from '../Statistics/selectors'
import { setOpenStatistic } from '../Statistics/actions'
import { selectDataQueriesByType } from '../DataQueries/selectors'
import { requestDatasetUpdate } from '../DataQueries/actions'
import { startRefresh } from '../StatRegDashboard/actions'
import { selectStatuses } from '../StatRegDashboard/selectors'

export function DataQueryTools() {
  const loadingCache = useSelector(selectLoadingClearCache)
  const statistics = useSelector(selectStatistics)
  const loadingStatistics = useSelector(selectLoading)
  const hasLoadingStatistic = useSelector(selectHasLoadingStatistic)
  const io = useContext(WebSocketContext)
  const dispatch = useDispatch()
  const [selectedStat, setSelectedStat] = useState(null)
  const tableQueries = useSelector(selectDataQueriesByType('mimir:table'))
  const loading = useSelector(selectLoading)
  const statuses = useSelector(selectStatuses)

  function refreshStatReg(key) {
    startRefresh(dispatch, io, [key])
  }

  function makeRefreshButton(statRegStatus) {
    return (
      <Button
        variant="primary"
        className="mx-1"
        onClick={() => refreshStatReg(statRegStatus.key)}
        disabled={statRegStatus.loading}
      >
        Oppdater { statRegStatus.displayName } { statRegStatus.loading ? <span className="spinner-border spinner-border-sm" /> : <RefreshCw size={16}/> }
      </Button>
    )
  }

  function refreshAllTables() {
    const ids = tableQueries.filter((q) => !q.loading).map((q) => q.id)
    requestDatasetUpdate(dispatch, io, ids)
  }

  function renderSpinner(loading) {
    if (loading) {
      return (<span className="spinner-border spinner-border-sm ml-2 mb-1" />)
    }
    return null
  }
  const loadingTables = tableQueries.filter((q) => q.loading).length > 0

  function clearCache() {
    requestClearCache(dispatch, io)
  }

  function renderIcon(loading) {
    if (loading) {
      return (<span className="spinner-border spinner-border-sm" />)
    }
    return (<Trash size={16}/>)
  }

  function onStatisticsSearchSelect(e) {
    setSelectedStat(e)
  }

  function renderStatisticsSearch() {
    if (loadingStatistics) {
      return (
        <span className="spinner-border spinner-border-sm ml-2 mb-1" />
      )
    }
    return (
      <Dropdown
        placeholder="Finn statistikk"
        searchable
        items={statistics.map((s) => {
          return {
            title: `${s.shortName} - ${s.name}`,
            id: s.id
          }
        })}
        onSelect={(e) => onStatisticsSearchSelect(e)}
      />
    )
  }

  return (
    <div className="p-4 tables-wrapper">
      <h2>Diverse verktøy</h2>
      <Container>
        <Row className="mb-3">
          <Col>
            <span>Tøm Cache</span>
            <Button
              size="sm"
              className="mx-3"
              onClick={() => clearCache()}
              disabled={loadingCache}>
              {renderIcon(loadingCache)}
            </Button>
          </Col>
        </Row>
        <Row className="mb-4">
          <Col className="col-10 p-0">
            {renderStatisticsSearch()}
          </Col>
          <Col className="col-2 p-0 pt-1">
            <Button
              variant="primary"
              size="sm"
              className="mx-1"
              onClick={() => setOpenStatistic(dispatch, selectedStat.id)}
              disabled={hasLoadingStatistic || loadingStatistics || !selectedStat}
            >
              { hasLoadingStatistic ? <span className="spinner-border spinner-border-sm" /> : <RefreshCw size={16}/> }
            </Button>
          </Col>
        </Row>
        <Row className="mb-4">
          <Col className="p-0">
            <Button disabled={loadingStatistics} onClick={() => refreshAllTables()}>
              {`Oppdater alle tabeller (${tableQueries.length})`} {renderSpinner(loadingTables)}
            </Button>
          </Col>
        </Row>
        {statuses.map((statRegStatus, index) => {
          const {
            displayName,
            status
          } = statRegStatus
          return (
            <Row className="mb-4" key={index}>
              <Col className="p-0">
                {makeRefreshButton(statRegStatus)}
              </Col>
            </Row>
          )
        })}
      </Container>
    </div>
  )
}

export default (props) => <DataQueryTools {...props} />
