var mongoose = require("mongoose");
var Schema = mongoose.Schema;

const metaMap = new Schema({
  verificationId: { type: String, required: false },
  identityStatus: { type: String, required: false },
  documentNumber: { type: String, required: false },
  name: { type: String, required: false },
  dateOfBirth: { type: String, required: false },
  field1: { type: String, required: false },
  field2: { type: String, required: false },
  field3: { type: String, required: false },
  phoneNumber: { type: String, required: false },
  emailAddress: { type: String, required: false },
  gender: { type: String, required: false },
  resource: { type: String, required: false },
  nationality: { type: String, required: false },
  matchStatus: { type: String, required: false },
  
});

module.exports = mongoose.model("metaMap", metaMap);
