const express = require("express");
const {
  addData,
  getAllData,
  getDataById,
  updateDataById,
} = require("../controllers/metaMapControllers");

const router = express.Router();

router.route("/addData").post(addData);
router.route("/getAllData").get(getAllData);
router.route('/getDataById/:metaMapId').get(getDataById);
router.route('/updateDataById').post(updateDataById);

module.exports = router;
