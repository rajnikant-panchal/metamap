const XLSX = require('xlsx')

// Require express and body-parser
const express = require("express")
const bodyParser = require("body-parser")
// Initialize express and define a port
const app = express()
const PORT = 5000
// Tell express to use body-parser's JSON parsing
app.use(bodyParser.json())
app.post("/hook", (req, res) => {
    generateData(req.body);
  res.status(200).end() // Responding is important
})


const generateData = (res) => {

  console.log(res) // Call your action on the request here

  data = [{
    firstName: 'John',
    lastName: 'Doe'
   }, {
    firstName: 'Smith',
    lastName: 'Peters'
   }, {
    firstName: 'Alice',
    lastName: 'Lee'
   }]
   
   const ws = XLSX.utils.json_to_sheet(data)
   const wb = XLSX.utils.book_new()
   XLSX.utils.book_append_sheet(wb, ws, 'Responses')
   XLSX.writeFile(wb, 'sampleData.xlsx')

}

// Start express on the defined port
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`))
