const asyncHandler = require("express-async-handler");
const metamMap = require("../models/metaMapModel");

const getAllData = asyncHandler(async (req, res) => {
  let jArr = await metamMap.find({}).then((result) => {
    return result;
  });

  let jArray = [];
  if (jArr) {
    for (let i = 0; i < jArr.length; i++) {
      let mergedObj = jArr[i].toObject();

      let userData = {
        _id: mergedObj._id,
        verificationId: mergedObj.verificationId
          ? mergedObj.verificationId
          : "",
        identityStatus: mergedObj.identityStatus
          ? mergedObj.identityStatus
          : "",
        documentNumber: mergedObj.documentNumber
          ? mergedObj.documentNumber
          : "",
        name: mergedObj.name ? mergedObj.name : "",
        dateOfBirth: mergedObj.dateOfBirth ? mergedObj.dateOfBirth : "",
        field1: mergedObj.field1 ? mergedObj.field1 : "",
        field2: mergedObj.field2 ? mergedObj.field2 : "",
        field3: mergedObj.field3 ? mergedObj.field3 : "",
        phoneNumber: mergedObj.phoneNumber ? mergedObj.phoneNumber : "",
        emailAddress: mergedObj.emailAddress ? mergedObj.emailAddress : "",
        gender: mergedObj.gender ? mergedObj.gender : "",
        nationality: mergedObj.nationality ? mergedObj.nationality : "",
        matchStatus: mergedObj.matchStatus ? mergedObj.matchStatus : "",
        action:
          "<a href='#editEmployeeModal' data-id='" +
          mergedObj._id +
          "' class='edit editingTRbutton' data-toggle='modal'><i class='material-icons' data-toggle='tooltip' title='Edit'>&#xE254;</i></a> <a href='#' data-id='" +
          mergedObj._id +
          "' class='edit sendTRbutton' ><i class='material-icons'  title='Send'>&#xe163;</i></a>",
      };
      jArray.push(userData);
    }

    res.json({ data: jArray });
  } else {
    res.json({ data: jArray });
  }
});

const addData = asyncHandler(async (req, res) => {
  const {
    verificationId,
    identityStatus,
    documentNumber,
    name,
    dateOfBirth,
    field1,
    field2,
    field3,
    phoneNumber,
    emailAddress,
    gender,
    nationality,
    matchStatus,
  } = req.body;

  const obj = await metamMap.create({
    verificationId,
    identityStatus,
    documentNumber,
    name,
    dateOfBirth,
    field1,
    field2,
    field3,
    resource,
    phoneNumber,
    emailAddress,
    gender,
    nationality,
    matchStatus,
  });

  if (obj) {
    res.status(201).json({
      _id: obj._id,
      verificationId: obj.verificationId,
      identityStatus: obj.identityStatus,
      documentNumber: obj.documentNumber,
      name: obj.name,
      dateOfBirth: obj.dateOfBirth,
      field1: obj.field1,
      field2: obj.field2,
      field3: obj.field3,
      resource: obj.resource,
      phoneNumber: obj.phoneNumber,
      emailAddress: obj.emailAddress,
      gender: obj.gender,
      nationality: obj.nationality,
      matchStatus: obj.matchStatus,
    });
  } else {
    res.status(400);
    throw new Error("Not able to add metamap data");
  }
});

const getDataById = asyncHandler(async (req, res) => {
  let { metaMapId } = req.params;

  let data = await metamMap.findOne({ _id: metaMapId });

  if (data) {
    res.json(data);
  } else {
    res.status(404);
    throw new Error("Data Not Found");
  }
});

const updateDataById = asyncHandler(async (req, res) => {
  const id = req.body.id;

  delete req.body.id;

  metamMap.findByIdAndUpdate(id, { $set: req.body }, function (err, data) {
    if (err) {
      res.status(404);
      throw new Error("Data Not Found");
    } else {
      res.redirect("/view/report");
    }
  });
});

module.exports = { getAllData, addData, getDataById, updateDataById };
