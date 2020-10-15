import React, { useState } from 'react'
import { useSelector } from 'react-redux'
import { Button, Col, Row, Table, Modal, Form } from 'react-bootstrap'
import { selectStatistics, selectLoading } from './selectors'
import { RefreshCw } from 'react-feather'
import Moment from 'react-moment'
import { Link } from '@statisticsnorway/ssb-component-library'
import { selectContentStudioBaseUrl } from '../HomePage/selectors'

export function Statistics() {
  const statistics = useSelector(selectStatistics)
  const loading = useSelector(selectLoading)
  const contentStudioBaseUrl = useSelector(selectContentStudioBaseUrl)
  const [show, setShow] = useState(false)
  const [modalInfo, setModalInfo] = useState({})
  const [showModal, setShowModal] = useState(false)
  const handleClose = () => setShow(false)
  const handleShow = () => setShow(true)

  const statisticsNo = statistics ? statistics.filter((s) => s.language === 'nb') : []
  const statisticsEn = statistics ? statistics.filter((s) => s.language === 'en') : []

  const statisticsFinal = []
  if (statisticsNo.length > 0) {
    statisticsNo.map((statistic) => {
      statisticsFinal.push(statistic)
      const statisticEnglish = statisticsEn.find((s) => s.shortName === statistic.shortName)
      if (statisticEnglish) {
        statisticsFinal.push(statisticEnglish)
      } else {
        statisticsFinal.push({
          shortName: statistic.shortName,
          language: 'en'
        })
      }
    })
  }

  const toggleTrueFalse = () => {
    setShowModal(handleShow)
  }

  const updateTables = () => {
    console.log('Oppdatere tall: ' + modalInfo.name)
    handleClose()
  }

  function renderStatistics() {
    if (loading) {
      return (
        <span className="spinner-border spinner-border" />
      )
    }
    return (
      <div className="next-release">
        <Table bordered striped>
          <thead>
            <tr>
              <th className="roboto-bold">
                <span>Statistikk</span>
              </th>
              <th className="roboto-bold">
                <span>Neste publisering</span>
              </th>
              <th />
              <th className="roboto-bold">
                <span>Logg/sist oppdatert</span>
              </th>
            </tr>
          </thead>
          {getStatistics()}
        </Table>
        {show ? <ModalContent/> : null }
      </div>
    )
  }

  function makeRefreshButton(key) {
    return (
      <Button
        variant="primary"
        size="sm"
        className="mx-1"
        onClick={() => refreshStatistic(key)}
        disabled={key.loading}
      >
        { key.loading ? <span className="spinner-border spinner-border-sm" /> : <RefreshCw size={16}/> }
      </Button>
    )
  }

  function refreshStatistic(key) {
    const statistic = statistics.find((item) => item.id === key)
    setModalInfo(statistic)
    toggleTrueFalse()
  }

  const ModalContent = () => {
    return (
      <Modal show={show} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>Oppdatering av tabeller på web</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <h2>Statistikk: {modalInfo.shortName}</h2>
          <span>For å oppdatere tabeller med ennå ikke publiserte tall må brukernavn og passord for lastebrukere i Statistikkbanken brukes.</span>
          <br/>
          <span>For andre endringer velg "Hent publiserte tall" uten å oppgi brukernavn og passord</span>
          <Form className="mt-3">
            <Form.Group controlId="formBasicUsername">
              <Form.Label>Brukernavn</Form.Label>
              <Form.Control type="username" placeholder="Brukernavn" disabled />
            </Form.Group>

            <Form.Group controlId="formBasicPassword">
              <Form.Label>Password</Form.Label>
              <Form.Control type="password" placeholder="Passord" disabled />
            </Form.Group>
            <Form.Group controlId="formBasicCheckbox">
              <Form.Check type="checkbox" label="Hent publiserte tall"/>
            </Form.Group>
            <Button variant="primary" onClick={updateTables}>
                Send
            </Button>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>
              Lukk
          </Button>
        </Modal.Footer>
      </Modal>
    )
  }

  function getStatistics() {
    if (statisticsFinal.length > 0) {
      return (
        <tbody>
          {statisticsFinal.map((statistic) => {
            return (
              statisticRow(statistic)
            )
          })}
        </tbody>
      )
    }
    return (
      <tbody/>
    )
  }

  function statisticRow(statistic) {
    const key = statistic.shortName + '_' + statistic.language
    return (
      <tr key={key}>
        <td className='statistic'>
          {getShortNameLink(statistic)}
        </td>
        <td>
          {getNextRelease(statistic)}
        </td>
        <td className="text-center">{statistic.nextRelease ? makeRefreshButton(statistic.id) : ''}</td>
        <td/>
      </tr>
    )
  }

  function getNextRelease(statistic) {
    if (statistic.nextRelease) {
      return (
        <span>
          <Moment format="DD.MM.YYYY hh:mm">{statistic.nextRelease}</Moment>
        </span>
      )
    }
    return (
      <span/>
    )
  }

  function getShortNameLink(statistic) {
    if (statistic.nextRelease) {
      return (
        <Link
          isExternal
          href={contentStudioBaseUrl + statistic.id}>{statistic.language === 'en' ? 'Eng. ' + statistic.shortName : statistic.shortName}
        </Link>
      )
    }
    return (
      <span>{statistic.language === 'en' ? 'Eng. ' + statistic.shortName : statistic.shortName}</span>
    )
  }

  return (
    <section className="xp-part part-dashboard container mb-5">
      <Row>
        <Col>
          <div className="p-4 tables-wrapper">
            <h2 className="mb-3">Kommende publiseringer</h2>
            {renderStatistics()}
          </div>
        </Col>
      </Row>
    </section>
  )
}

export default (props) => <Statistics {...props} />
