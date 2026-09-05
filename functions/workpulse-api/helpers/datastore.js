// Helper to run Data Store queries via Catalyst SDK
async function query(catalystApp, sql) {
  const zcql = catalystApp.zcql()
  const result = await zcql.executeZCQLQuery(sql)
  return result
}

async function insertRow(catalystApp, tableName, data) {
  const datastore = catalystApp.datastore()
  const table = datastore.table(tableName)
  const result = await table.insertRow(data)
  return result
}

async function updateRow(catalystApp, tableName, data) {
  const datastore = catalystApp.datastore()
  const table = datastore.table(tableName)
  const result = await table.updateRow(data)
  return result
}

async function deleteRow(catalystApp, tableName, rowId) {
  const datastore = catalystApp.datastore()
  const table = datastore.table(tableName)
  await table.deleteRow(rowId)
}

module.exports = { query, insertRow, updateRow, deleteRow }
