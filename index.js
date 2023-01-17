const ExcelJS = require("exceljs");
const fs = require("fs");
const logger = require("logger").createLogger("public/development.log");
logger.setLevel("debug");

// Require express and body-parser
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const connectDB = require("./config/db");
const dotenv = require("dotenv");
const metaMapRoutes = require("./routes/metaMapRoutes");
const metamMap = require("./models/metaMapModel");
const metaMapControllers = require("./controllers/metaMapControllers");

dotenv.config();
connectDB();

// Initialize express and define a port
const app = express();
const PORT = 5000;
// Tell express to use body-parser's JSON parsing
app.use(bodyParser.json());

app.use(bodyParser.urlencoded({ extended: true })); 

const whitelist = ["http://47.87.213.40", "http://localhost:5000", "http://httpwebhook.herokuapp.com"];
const corsOptions = {
  origin: function (origin, callback) {
    if (!origin || whitelist.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
};
app.use(cors(corsOptions));

app.use(express.static('public'))

// set the view engine to ejs
app.set("view engine", "ejs");

app.use("/api", metaMapRoutes);

app.get("/view/report", async (req, res) => {
  metaMapControllers.getAllData().then((response) => {
    if (response) {
      res.render("report", {
        data: response,
      });
    } else {
      res.render("report", {
        data: [],
      });
    }
  });
});

app.get("/download/report", (req, res) => {
  metaMapControllers.getAllData().then(async (response) => {
    if (response) {
      const filePath = "report.xlsx";
      const workbook = new ExcelJS.Workbook();
      let worksheet = workbook.addWorksheet("Responses");

      worksheet.columns = [
        { header: "Verification ID", key: "VerificationID", width: 10 },
        { header: "IdentityStatus", key: "IdentityStatus", width: 32 },
        { header: "Name.", key: "Name", width: 15 },
        { header: "DocumentNumber", key: "DocumentNumber", width: 32 },
        { header: "Birth Date", key: "dateOfBirth", width: 32 },
        { header: "Field 1", key: "field1", width: 32 },
        { header: "Field 2", key: "field2", width: 32 },
        { header: "Field 3", key: "field3", width: 32 },
        { header: "Resource", key: "resource", width: 32 },
      ];

      for (let data of response) {
        worksheet.addRow({
          VerificationID: data.verificationId,
          IdentityStatus: data.identityStatus,
          Name: data.name,
          DocumentNumber: data.documentNumber,
          dateOfBirth: data.dateOfBirth,
          field1: data.field1,
          field2: data.field2,
          field3: data.field3,
          resource: data.resource,
        });
      }
      await workbook.xlsx.writeFile(filePath).then((data) => {
        console.log(data);
        res.download(filePath, "report.xlsx", (err) => {
          if (err) {
            res.send({
              error: err,
              msg: "Problem downloading the file",
            });
          }
        });
      });
    } else {
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
    if (
      jsonData &&
      jsonData.resource &&
      jsonData.step &&
      jsonData.step.data &&
      jsonData.step.data.fullName &&
      jsonData.step.data.fullName.value &&
      jsonData.step.data.documentNumber &&
      jsonData.step.data.documentNumber.value
    ) {
      const verificationId = jsonData.resource.substring(
        jsonData.resource.lastIndexOf("/") + 1
      );

      const obj = await metamMap.create({
        verificationId: verificationId,
        identityStatus: "",
        name: jsonData.step.data.fullName.value,
        documentNumber: jsonData.step.data.documentNumber.value,
        dateOfBirth: jsonData.step.data.dateOfBirth.value,
        resource: jsonData.resource,
      });
    } else if (jsonData && jsonData.resource && jsonData.identityStatus) {
      let lastRec = await metamMap.findOne({}).sort({ _id: -1 });
      lastRec.identityStatus = jsonData.identityStatus;
      await metamMap.findByIdAndUpdate(
        lastRec._id,
        { $set: lastRec },
        function (err, data) {
          if (err) {
            console.log("Error while updaing data.!");
          } else {
            console.log("Last record updated.!");
          }
        }
      );
    }
  } catch (err) {
    logger.debug("Not able to parse the Response " + res);
    logger.debug("Error " + err);
  }
};

app.use(express.static('public'));

// Start express on the defined port
app.listen(PORT, () => logger.debug(`🚀 Server running on port ${PORT}`));
