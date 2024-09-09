const getReportElements = (reportElement) => {
  if (reportElement.marker == 'compoundReportElement') {
    return reportElement.reportElements
  } else {
    return [reportElement]
  }
  /*
  if (context.reportElements) {
    return context.reportElements
  } else if (context.reportElement) {
    return [context.reportElement]
  } else {
    return context
  }
  */
}

module.exports = {
  getReportElements,
}
