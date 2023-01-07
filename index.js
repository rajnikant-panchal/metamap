const ExcelJS = require("exceljs");
const fs = require("fs");
const logger = require('logger').createLogger('development.log');
logger.setLevel('debug');


// Require express and body-parser
const express = require("express");
const bodyParser = require("body-parser");
// Initialize express and define a port
const app = express();
const PORT = 5000;
// Tell express to use body-parser's JSON parsing
app.use(bodyParser.json());

app.get("/download/report", (req, res) => {
  const filePath = "export.xlsx";
  res.download(filePath, "export.xlsx", (err) => {
    if (err) {
      res.send({
        error: err,
        msg: "Problem downloading the file",
      });
    }
  });
});

app.post("/hook", (req, res) => {
  generateData(req.body);
  res.status(200).end(); // Responding is important
});

const generateData = async (res) => {
  logger.debug(JSON.stringify(res)); // Call your action on the request here

  try {
    let jsonData = res;
    if (jsonData && jsonData.resource && jsonData.step && jsonData.step.data) {
      const verificationId = jsonData.resource.substring(
        jsonData.resource.lastIndexOf("/") + 1
      );
      data = [
        {
          "Verification ID": verificationId,
          IdentityStatus: jsonData.step.data.fullName,
          Name: jsonData.step.data.fullName,
          DocumentNumber: jsonData.step.data.dateOfBirth,
        },
      ];

      let path = "export.xlsx";
      const workbook = new ExcelJS.Workbook();
      let worksheet = null;
      if (fs.existsSync(path)) {
        await workbook.xlsx.readFile(path);
        worksheet = workbook.getWorksheet("Responses");
      } else {
        worksheet = workbook.addWorksheet("Responses");
      }
      worksheet.columns = [
        { header: "Verification ID", key: "VerificationID", width: 10 },
        { header: "IdentityStatus", key: "IdentityStatus", width: 32 },
        { header: "Name.", key: "Name", width: 15 },
        { header: "DocumentNumber", key: "DocumentNumber", width: 32 },
        { header: "Resource", key: "resource", width: 32 },
      ];
      worksheet.addRow({
        VerificationID: verificationId,
        IdentityStatus: "",
        Name: jsonData.step.data.fullName,
        DocumentNumber: jsonData.step.data.documentNumber,
        resource: jsonData.resource,
      });
      await workbook.xlsx.writeFile(path);
    } else if (jsonData && jsonData.resource && jsonData.identityStatus) {
      let path = "export.xlsx";
      const workbook = new ExcelJS.Workbook();
      if (fs.existsSync(path)) {
        workbook.xlsx.readFile(path).then(function () {
          var worksheet = workbook.getWorksheet("Responses");
          var lastRow = worksheet.lastRow;
          lastRow.getCell(2).value = jsonData.identityStatus;
          lastRow.commit();
          return workbook.xlsx.writeFile(path);
        });
      }
    }
  } catch (err) {
    logger.debug("Not able to parse the Response " + res);
    logger.debug("Error " + err);
  }
};

// Start express on the defined port
app.listen(PORT, () => logger.debug(`🚀 Server running on port ${PORT}`));
