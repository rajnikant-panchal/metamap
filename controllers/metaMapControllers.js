const asyncHandler = require("express-async-handler");
const metamMap = require("../models/metaMapModel");

const getAllData = asyncHandler(async (req, res) => {
  const data = await metamMap.find({});
  return data;
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

  metamMap.findByIdAndUpdate(
    id,
    { $set: req.body },
    function (err, data) {
      if (err) {
        res.status(404);
        throw new Error("Data Not Found");
      } else {
        res.redirect("http://httpwebhook.herokuapp.com/view/report");
      }
    }
  );
});

module.exports = { getAllData, addData, getDataById, updateDataById };
