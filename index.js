const ExcelJS = require("exceljs");
const logger = require("logger").createLogger("public/development.log");
logger.setLevel("debug");
const cluster = require("cluster");
const totalCPUs = require("os").cpus().length;

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
const PORT = process.env.PORT || 5000;

if (cluster.isMaster) {
  logger.debug(`Number of CPUs is ${totalCPUs}`);
  logger.debug(`Master ${process.pid} is running`);

  // Fork workers.
  for (let i = 0; i < totalCPUs; i++) {
    cluster.fork();
  }

  cluster.on("exit", (worker, code, signal) => {
    logger.debug(`worker ${worker.process.pid} died`);
    logger.debug("Let's fork another worker!");
    cluster.fork();
  });
} else {
  // Initialize express and define a port
  const app = express();

  // Tell express to use body-parser's JSON parsing
  app.use(bodyParser.json());

  app.use(bodyParser.urlencoded({ extended: true }));

  const whitelist = [
    "http://47.87.213.40",
    "http://localhost:5000",
    "http://httpwebhook.herokuapp.com",
    "https://httpwebhook.herokuapp.com",
  ];
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

  app.use(express.static("public"));

  // set the view engine to ejs
  app.set("view engine", "ejs");

  app.use("/api", metaMapRoutes);

  app.get("/view/report", async (req, res) => {
    res.render("report", {
      data: [],
    });
  });

  app.get("/download/report", async (req, res) => {
    await metamMap.find({}).then(async (response) => {
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
          { header: "Phone Number", key: "phoneNumber", width: 32 },
          { header: "EmailAddress", key: "emailAddress", width: 32 },
          { header: "Gender", key: "gender", width: 32 },
          { header: "Nationality", key: "nationality", width: 32 },
          { header: "AML", key: "matchStatus", width: 32 },
          { header: "Doc Type", key: "field1", width: 32 },
          { header: "Govt Check Result", key: "field2", width: 32 },
          { header: "Remarks", key: "field3", width: 32 },
          { header: "Resource", key: "resource", width: 32 },
        ];

        for (let data of response) {
          worksheet.addRow({
            VerificationID: data.verificationId,
            IdentityStatus: data.identityStatus,
            Name: data.name,
            DocumentNumber: data.documentNumber,
            dateOfBirth: data.dateOfBirth,
            phoneNumber: data.phoneNumber,
            emailAddress: data.emailAddress,
            gender: data.gender,
            nationality: data.nationality,
            matchStatus: data.matchStatus,
            field1: data.field1,
            field2: data.field2,
            field3: data.field3,
            resource: data.resource,
          });
        }
        await workbook.xlsx.writeFile(filePath).then((data) => {
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

  app.post("/hook", async (req, res) => {
    await generateData(req.body);
    res.status(200).end(); // Responding is important
  });

  const generateData = async (res) => {
    logger.debug(res); // Call your action on the request here

    try {
      let jsonData = res;
      if (
        jsonData &&
        jsonData.resource &&
        jsonData.step &&
        jsonData.step.data &&
        jsonData.step.data.fullName &&
        jsonData.step.data.documentNumber
      ) {
        const verificationId = jsonData.resource.substring(
          jsonData.resource.lastIndexOf("/") + 1
        );

        let lastRec = await metamMap.findOne({
          verificationId: verificationId,
        });

        if (lastRec) {
          lastRec.name = jsonData.step.data.fullName.value
            ? jsonData.step.data.fullName.value
            : "";
          lastRec.documentNumber = jsonData.step.data.documentNumber.value
            ? jsonData.step.data.documentNumber.value
            : "";
          lastRec.dateOfBirth = jsonData.step.data.dateOfBirth
            ? jsonData.step.data.dateOfBirth.value
            : "";
          lastRec.resource = jsonData.resource;
          lastRec.nationality = jsonData.step.data.nationality
            ? jsonData.step.data.nationality.value
            : "";
          lastRec.gender = jsonData.step.data.sex
            ? jsonData.step.data.sex.value
            : "";

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
        } else {
          let inputJson = {
            verificationId: verificationId,
            name: jsonData.step.data.fullName.value
              ? jsonData.step.data.fullName.value
              : "",
            documentNumber: jsonData.step.data.documentNumber.value
              ? jsonData.step.data.documentNumber.value
              : "",
            dateOfBirth: jsonData.step.data.dateOfBirth
              ? jsonData.step.data.dateOfBirth.value
              : "",
            resource: jsonData.resource,
            nationality: jsonData.step.data.nationality
              ? jsonData.step.data.nationality.value
              : "",
            gender: jsonData.step.data.sex ? jsonData.step.data.sex.value : "",
          };
          await metamMap.findOneAndUpdate(
            {
              verificationId: verificationId,
            },
            { $set: inputJson },
            { upsert: true, new: true },
            function (err, data) {
              if (err) {
                console.log("Error while updaing data.!");
              } else {
                console.log("Last record updated.!");
              }
            }
          );
        }
      } else if (jsonData && jsonData.resource && jsonData.identityStatus) {
        const verificationId = jsonData.resource.substring(
          jsonData.resource.lastIndexOf("/") + 1
        );

        let lastRec = await metamMap.findOne({
          verificationId: verificationId,
        });

        if (lastRec) {
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
        } else {
          let inputJson = {
            verificationId: verificationId,
            identityStatus: jsonData.identityStatus,
          };
          await metamMap.findOneAndUpdate(
            {
              verificationId: verificationId,
            },
            { $set: inputJson },
            { upsert: true, new: true },
            function (err, data) {
              if (err) {
                console.log("Error while updaing data.!");
              } else {
                console.log("Last record updated.!");
              }
            }
          );
        }
      } else if (
        jsonData &&
        jsonData.resource &&
        jsonData.step &&
        jsonData.step.data &&
        jsonData.step.data.phoneNumber
      ) {
        const verificationId = jsonData.resource.substring(
          jsonData.resource.lastIndexOf("/") + 1
        );

        let lastRec = await metamMap.findOne({
          verificationId: verificationId,
        });

        if (lastRec) {
          lastRec.phoneNumber = jsonData.step.data.phoneNumber;
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
        } else {
          let inputJson = {
            verificationId: verificationId,
            phoneNumber: jsonData.step.data.phoneNumber,
          };
          await metamMap.findOneAndUpdate(
            {
              verificationId: verificationId,
            },
            { $set: inputJson },
            { upsert: true, new: true },
            function (err, data) {
              if (err) {
                console.log("Error while updaing data.!");
              } else {
                console.log("Last record updated.!");
              }
            }
          );
        }
      } else if (
        jsonData &&
        jsonData.resource &&
        jsonData.step &&
        jsonData.step.data &&
        jsonData.step.data.emailAddress
      ) {
        const verificationId = jsonData.resource.substring(
          jsonData.resource.lastIndexOf("/") + 1
        );

        let lastRec = await metamMap.findOne({
          verificationId: verificationId,
        });
        if (lastRec) {
          lastRec.emailAddress = jsonData.step.data.emailAddress;
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
        } else {
          let inputJson = {
            verificationId: verificationId,
            emailAddress: jsonData.step.data.emailAddress,
          };
          await metamMap.findOneAndUpdate(
            {
              verificationId: verificationId,
            },
            { $set: inputJson },
            { upsert: true, new: true },
            function (err, data) {
              if (err) {
                console.log("Error while updaing data.!");
              } else {
                console.log("Last record updated.!");
              }
            }
          );
        }
      } else if (
        jsonData &&
        jsonData.resource &&
        jsonData.step &&
        jsonData.step.data &&
        jsonData.step.data[0] &&
        jsonData.step.data[0].originalMatchStatus
      ) {
        const verificationId = jsonData.resource.substring(
          jsonData.resource.lastIndexOf("/") + 1
        );

        let lastRec = await metamMap.findOne({
          verificationId: verificationId,
        });
        if (lastRec) {
          lastRec.matchStatus = jsonData.step.data[0].originalMatchStatus;
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
        } else {
          let inputJson = {
            verificationId: verificationId,
            matchStatus: jsonData.step.data[0].originalMatchStatus,
          };
          await metamMap.findOneAndUpdate(
            {
              verificationId: verificationId,
            },
            { $set: inputJson },
            { upsert: true, new: true },
            function (err, data) {
              if (err) {
                console.log("Error while updaing data.!");
              } else {
                console.log("Last record updated.!");
              }
            }
          );
        }
      }
    } catch (err) {
      logger.debug("Something went wrong....!");
      logger.debug(res);
      logger.error(err);
    }
  };

  // Start express on the defined port
  app.listen(PORT, () => logger.debug(`🚀 Server running on port ${PORT}`));
}
