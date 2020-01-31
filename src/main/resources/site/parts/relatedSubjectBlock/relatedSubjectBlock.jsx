import React from 'react'
import { Card, Paragraph } from '@statisticsnorway/ssb-component-library'

export default (props) => <Card {...props} image={<img src={props.imgUrl} alt="" />} onClick={() => { }}>
  <Paragraph {...props}>{props.preambleText}</Paragraph>
</Card>
