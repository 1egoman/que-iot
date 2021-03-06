/**
 * Things Controller. This module manages all the serverside CRUD operations
 * pertaining to things, and the code within them.
 * @module controller/things
 */

var fs = require("fs");
var _ = require("underscore");
var path = require("path");
var async = require("async");

var Thing = require("../../models/things");

/**
 * Deeply extend an object from another object
 * @param {object} destination The destination object to extend to
 * @param {object} source      The object to extend from into destination
 */
Object.deepExtend = function(destination, source) {
  for (var property in source) {
    if (source[property] && source[property].constructor &&
     source[property].constructor === Object) {
      destination[property] = destination[property] || {};
      arguments.callee(destination[property], source[property]);
    } else {
      destination[property] = source[property];
    }
  }
  return destination;
};



// a thing container
module.exports = function(thedb) {
  var root = this;

  // a default thing; used in .add()
  this.defaultThing = {
    "name": "Untitled Thing",
    "desc": "Untitled Thing Description",
    "type": "thing",
    "id": null,
    "image": null,
    "tags": [],
    "ip": {
      "host": null,
      "port": null
    },
    "data": {}
  }

  // the websocket instance
  this.socket = null;

  /**
   * Add a new thing to the thing collection.
   * @param {object}   data The data to add to the collection
   * @param {Function} done Optional callback. Passes the new thing id on success.
   */
  this.add = function(data, done) {
    // update
    this.get(null, function(all) {

      // allocate id
      maxId = _.max(all, function(i) {
        return i.id;
      }).id || 0;

      // add new record
      item = _.extend(root.defaultThing, data);
      item.id = ++maxId;

      // save thing in db
      item.type = "thing";
      var thing = new Thing(item);
      thing.save(function(err, d) {
        if (err) {
          done(null);
        } else {
          // tell the frontend it needs to pull in a new thing
          root.socket && root.socket.emit("backend-data-change", {
            type: "thing",
            data: all
          });

          // callback
          done && done(item.id);
        };
      });
    });
  }

  /**
   * Deletes a thing from the thing collection.
   * @param  {number}   id   The id of the thing to delete.
   * @param  {Function} done Optional callback. Returns any error if one exists.
   */
  this.delete = function(id, done) {
     Thing.remove({id: id}, function(err) {

       // return if an error has occured
       if (err && done) {
         done(err);
         return;
       }

       // tell the frontend it's time to update
       Thing.find({}, function(err, all) {
         root.socket && root.socket.emit("backend-data-change", {
           type: "thing",
           data: all
         });
       });

       // callback
       done && done();
     });
  }

  /**
   * Get a list of all things within the thing container
   * @param  {number}   id   The id to search for while retreiving things. a
   *                         null value will return all things.
   * @param  {Function} done Optional callback - returns any errors that are
   *                         thrown.
   */
  this.get = function(id, done) {

    // get from persistant data store
    Thing.find(function(err, docs) {

      // if there was a problem, return an error.
      if (err && done) {
        done(err);
        return;
      }

      // convert all models to objects
      // for encapsulation
      ret = docs.map(function(doc) {
        ob = doc.toObject();
        delete ob._id;
        return ob;
      });

      // search for id
      if (id !== null) {
        ret = _.find(ret, function(i) {
          return i.id == id || undefined;
        });
      }

      done && done(ret);
    });
  };

  /**
   * Update thing document with the specified changes.
   * @param  {number}   id      The id of the thing to update
   * @param  {object}   changes The changes to make to the thing. This doesn't
   *                            have to contain all the data, just the stuff to
   *                            be changed.
   * @param  {Function} done    Optional callback - returns any errors that are
   *                            thrown.
   */
  this.update = function(id, changes, done) {

    // update
    this.get(null, function(data) {

      // get the modified record
      var listIndex = null;
      record = _.find(data, function(i, indx) {
        listIndex = indx;
        return i.id == id || undefined;
      });

      // update record's data
      if (record) {

        // apply the updates
        record.data = Object.deepExtend(record.data || {}, changes || {});

        // check for deletions
        _.each(changes, function(c, k) {
          if (c == null) {
            delete record.data[k];
          }
        });

        // update thing
        Thing.update({id: id}, record, {}, function(err) {
          // tell the frontend it's time to update
          root.socket && root.socket.emit("backend-data-change", {
            type: "thing",
            data: data
          });

          // callback
          done && done();
        });

      }
    });
  }



  /**
    Create a response packet with the correct status and message
  */
  this.createResponsePacket = function(status, data) {
    return _.extend({"status": status || "OK", "msg": null}, data || {});
  }



}
