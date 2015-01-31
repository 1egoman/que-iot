###*
This model describes the attributes within each item of the token collection.
@model models/tokens
###
mongoose = require("mongoose")
_ = require("underscore")

###*
This schema describes all the attributes within a token. Each token is a
reference to a 3rd party service that Que can interact with.
@type {object}
###
tokenSchema = mongoose.Schema(
  name: String
  data: String
)

# Compile the schema into a model
module.exports = mongoose.model("Token", tokenSchema)
