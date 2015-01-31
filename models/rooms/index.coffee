###*
This model describes the attributes within each item of the room collection.
@model models/rooms
###
mongoose = require("mongoose")
_ = require("underscore")

###*
This schema describes all the attributes within a room.
@type {object}
###
roomSchema = mongoose.Schema(
  name: String
  desc: String
  id: Number
  tags: Array
  things: Array
  usersInside: Array
)

# Compile the schema into a model
module.exports = mongoose.model("Room", roomSchema)
