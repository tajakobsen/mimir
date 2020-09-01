import React from 'react'
import PropTypes from 'prop-types'
import { Dropdown, Link } from '@statisticsnorway/ssb-component-library'
import { isEmpty } from 'ramda'

class Table extends React.Component {
  createTable() {
    return (
      <table className={this.props.table.tableClass}>
        {this.addCaption()}
        {this.addThead()}
        {this.addTbody()}
      </table>
    )
  }

  addCaption() {
    if (this.props.table.caption) {
      if (typeof this.props.table.caption === 'object') {
        return (
          <caption noterefs={this.props.table.caption.noterefs}>
            {this.props.table.caption.content}
          </caption>
        )
      } else {
        return (
          <caption>
            {this.props.table.caption}
          </caption>
        )
      }
    }
  }

  addThead() {
    return (
      <thead>
        {this.createRowsHead(this.props.table.thead)}
      </thead>
    )
  }

  addTbody() {
    return (
      <tbody>
        {this.createRowsBody(this.props.table.tbody)}
      </tbody>
    )
  }

  createRowsHead(rows) {
    if (rows) {
      return rows.map((row, i) => {
        return (
          <tr key={i}>
            { this.createCell(row) }
          </tr>
        )
      })
    }
  }

  createRowsBody(rows) {
    if (rows) {
      return rows.map((row, i) => {
        return (
        // TODO: When parsing Tbml has correct order use createCell
          <tr key={i}>
            { this.createBodyTh(row) }
            { this.createBodyTd(row) }
          </tr>
        )
      })
    }
  }

  createBodyTh(row) {
    return Object.keys(row).map(function(keyName, keyIndex) {
      const value = row[keyName]
      if (keyName === 'th') {
        if (typeof value === 'string' | typeof value === 'number') {
          return (
            <th key={keyIndex}>{value}</th>
          )
        } else {
          return (
            <th key={keyIndex} className={value.class} rowSpan={value.rowspan} colSpan={value.colspan} >
              {value.content}
            </th>
          )
        }
      }
    })
  }

  createBodyTd(row) {
    return Object.keys(row).map(function(keyName, keyIndex) {
      const value = row[keyName]
      if (keyName === 'td') {
        if (typeof value === 'string' | typeof value === 'number') {
          return (
            <th key={keyIndex}>{value}</th>
          )
        } else {
          if (Array.isArray(value)) {
            return value.map((cellValue, i) => {
              if (typeof cellValue === 'object') {
                return (
                  <td className={cellValue.class} key={i}>{cellValue.content}</td>
                )
              } else {
                return (
                  <td key={i}>{cellValue}</td>
                )
              }
            })
          } else {
            return (
              <td key={keyIndex} className={value.class} rowSpan={value.rowspan} colSpan={value.colspan}>
                {value.content}
              </td>
            )
          }
        }
      }
    })
  }

  createCell(row) {
    return Object.keys(row).map(function(keyName, keyIndex) {
      const value = row[keyName]
      if (typeof value === 'string' | typeof value === 'number') {
        return (
          React.createElement(keyName, {
            key: keyIndex
          }, value)
        )
      } else {
        if (Array.isArray(value)) {
          return value.map((cellValue, i) => {
            if (typeof cellValue === 'object') {
              return (
                React.createElement(keyName, {
                  key: i,
                  rowSpan: cellValue.rowspan,
                  colSpan: cellValue.colspan,
                  noterefs: cellValue.noterefs
                }, cellValue.content)
              )
            } else {
              return (
                React.createElement(keyName, {
                  key: i
                }, cellValue)
              )
            }
          })
        } else {
          return (
            React.createElement(keyName, {
              key: keyIndex,
              rowSpan: value.rowspan,
              colSpan: value.colspan,
              noterefs: value.noterefs
            }, value.content)
          )
        }
      }
    })
  }

  addStandardSymbols() {
    if (this.props.standardSymbol) {
      return (
        <Link href={this.props.standardSymbol.href} >{this.props.standardSymbol.text}</Link>
      )
    }
    return
  }

  addDownloadAsDropdown() {
    return (
      <div className="d-lg-flex justify-content-end">
        <Dropdown
          selectedItem={this.props.downloadAsTitle}
          items={this.props.downloadAsOptions}
        />
      </div>
    )
  }

  render() {
    if (!isEmpty(this.props.table)) {
      return <div className="container">
        {this.addDownloadAsDropdown()}
        {this.createTable()}
        {this.addStandardSymbols()}
      </div>
    } else {
      return <div>
        <p>Ingen tilknyttet Tabell</p>
      </div>
    }
  }
}

Table.propTypes = {
  downloadAsTitle: PropTypes.object,
  downloadAsOptions: PropTypes.arrayOf(
    PropTypes.shape({
      title: PropTypes.string,
      id: PropTypes.string
    })
  ),
  standardSymbol: PropTypes.shape({
    href: PropTypes.string,
    text: PropTypes.string
  }),
  table: PropTypes.shape({
    caption: PropTypes.string | PropTypes.shape({
      content: PropTypes.string,
      noterefs: PropTypes.string
    }),
    tableClass: PropTypes.string,
    thead: PropTypes.arrayOf(
      PropTypes.shape({
        td: PropTypes.array | PropTypes.number | PropTypes.string | PropTypes.shape({
          rowspan: PropTypes.number,
          colspan: PropTypes.number,
          content: PropTypes.string,
          class: PropTypes.string
        }),
        th: PropTypes.array | PropTypes.number | PropTypes.string | PropTypes.shape({
          rowspan: PropTypes.number,
          colspan: PropTypes.number,
          content: PropTypes.string,
          class: PropTypes.string,
          noterefs: PropTypes.string
        })
      })
    ),
    tbody: PropTypes.arrayOf(
      PropTypes.shape({
        th: PropTypes.array | PropTypes.number | PropTypes.string | PropTypes.shape({
          content: PropTypes.string,
          class: PropTypes.string,
          noterefs: PropTypes.string
        }),
        td: PropTypes.array | PropTypes.number | PropTypes.string | PropTypes.shape({
          content: PropTypes.string,
          class: PropTypes.string
        })
      })
    )
  })
}

export default (props) => <Table {...props}/>
