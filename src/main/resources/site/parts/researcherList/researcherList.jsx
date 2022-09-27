import React from 'react'
import PropTypes from 'prop-types'
import { Link, Divider, Text } from '@statisticsnorway/ssb-component-library'
import { ArrowRight } from 'react-feather'


function ResearcherList(props) {
  const { title, researchers } = props
  console.log(researchers)

  const groupedCollection = {};

  const sortAlphabetically = (obj) => {
    return Object.keys(obj)
      .sort()
      .reduce((accumulator, key) => {
        accumulator[key] = obj[key];

    return accumulator;
  }, {});

  }

  for (let i = 0; i < researchers.length; i++) {       
    let firstLetter = researchers[i].surname.charAt(0);
    
    if (groupedCollection[firstLetter] == undefined) {             
      groupedCollection[firstLetter] = [];         
    }         
    groupedCollection[firstLetter].push(researchers[i]);     
  }

  const renderResearchers = () => {
    let html = []
    const sortedGroupCollection = sortAlphabetically(groupedCollection)
    for (const [letter, researchersList] of Object.entries(sortedGroupCollection)) {

      let box = researchersList.map((researcher, i) => {
        return (
          <>
          <li className="list-item" >
            {i == 0 ? <div className="letter col-md-1"><h2>{letter}</h2></div> : <div className="col-md-1"></div>}
            <div className="list col-md-11">
              <div>
                <Link href={researcher._path} linkType="header">{researcher.surname}, {researcher.name}</Link>
                {researcher.position ? <div><Text small>{researcher.position}</Text></div> : null}
                <div><Text small><Link href={'tel:' + researcher.phone}>{researcher.phone}</Link>  / <Link href={'mailto:' + researcher.email}>{researcher.email}</Link> / Forskningsområde</Text></div>
              </div>
              <div className="list-arrow"><ArrowRight size={30} /></div>
            </div>
          </li>
          <Divider light />
          </>
        )
      })

      html.push(
        <ul className="letter-list">{box}</ul> 
      )
    }

    return (
      <div>
        <Divider dark />
        {html}
      </div>
    ) 
  }

  return (
    <section className="xp-part researchers container p-0 mb-5">
      <div className="row banner">
        <h1>Ansatte forskning</h1>  
        <p>På denne siden finner du kontaktinformasjon til alle som jobber i Forskningsavdelingen i SSB. Klikk på navnet for å lese mer om personen.</p>
      </div>
      {researchers != [] ? renderResearchers() : null}
    </section>
  )
}

export default (props) => <ResearcherList {...props} />

ResearcherList.propTypes = {
  title: PropTypes.string,
  researchers: PropTypes.array
}
