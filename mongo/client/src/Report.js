import { useMemo, useEffect, useState } from 'react'

function Report(props) {
  const { data } = props

  return (
    <div className="Report">
      <span>{JSON.stringify(data)}</span>
    </div>
  );
}

export default Report;

