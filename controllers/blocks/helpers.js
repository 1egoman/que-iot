var _ = require("underscore");
var request = require("request");

// some small helper apis to make outside interaction
// possible inside of a code block
module.exports = function(socket, things, services, notifys, rooms, item) {

  return {

    // get a thing by its tag
    getThingByTag: function(tag, cb) {
      things.get(null, function(data) {

        // get matching things
        fltr = _.filter(data, function(item) {
          return _.contains(item.tags, tag);
        });

        // iterate over them
        _.each(fltr, function(f, ct) {
          cb(f, ct);
        });
      });
    },

    // get a thing by its id
    getThingById: function(id, cb) {
      things.get(null, function(data) {

        // get matching things
        fltr = _.filter(data, function(item) {
          return item.id == id;
        });

        // iterate over them
        _.each(fltr, function(f, ct) {
          cb(f, ct);
        });
      });
    },

    // get a room by its tag
    getRoomByTag: function(tag, cb) {
      rooms.get(null, function(data) {

        // get matching rooms
        fltr = _.filter(data, function(item) {
          return _.contains(item.tags, tag);
        });

        // iterate over them
        _.each(fltr, function(f, ct) {
          cb(f, ct);
        });
      });
    },

    // get a room by its id
    getRoomById: function(id, cb) {
      rooms.get(null, function(data) {

        // get matching rooms
        fltr = _.filter(data, function(item) {
          return item.id == id;
        });

        // iterate over them
        _.each(fltr, function(f, ct) {
          cb(f, ct);
        });
      });
    },


    // set value for things
    setThingValue: function(id, key, value, callback) {
      // set up the object
      obj = {}
      obj[key] = {value: value};

      // update
      things.get(id, function(thing) {
        if (thing.data[key].value !== value) {
          things.update(id, obj, function(data) {
            callback && (data && callback(true) || callback(null));
          });
        }
      });
    },




    // get and set persistant variables intividual to that block
    get: function(elem) {
      return item.data[elem];
    },

    set: function(elem, value) {
      if (!item.data) item.data = []
      item.data[elem] = value;
      return true;
    },

    // get all actions
    getActions: function(thing) {
      actions = {}
      // format
      thing.actions.forEach(function(action) {
        actions[action.name] = {
          trigger: function(cb) {
            // console.log("TRIGGER", JSON.stringify(action));
            request(action.trigger, function(err, resp, body) {
              try {
                cb && cb(err, resp, JSON.parse(body));
              } catch (err) {}
            });
          },
          detrigger: function(cb) {
            // console.log("DETRIGGER", JSON.stringify(action));;
            request(action.detrigger, function(err, resp, body) {
              try {
                cb && cb(err, resp, JSON.parse(body));
              } catch (err) {}
            });
          }
        }
      });

      return actions;
    },

    // enter and leave rooms
    room: function(room, action, username, callback) {

      // add or remove username
      if (action || action === "enter" || action === "e") {
        // add, but make sure user isn't already in the list
        if (room.usersInside.indexOf(username) === -1)
          room.usersInside.push(username);
      } else {
        // remove
        room.usersInside.splice(
          room.usersInside.indexOf(username),
          1
        );
      }

      // update backend
      rooms.updateUsers(room.id, room.usersInside, function() {

        // update frontend
        rooms.get(null, function(all) {
          socket.emit('backend-data-change', {
            type: "room",
            data: all
          });
        });

        // callback
        callback && callback();
      });
    },


    // log to console underneath the block
    log: function(msg) {
      socket && socket.emit("block-log", {
        id: item.id,
        type: "info",
        when: new Date(),
        msg: msg.toString()
      });
    },

    // log to console underneath the block (level warn)
    warn: function(msg) {
      socket && socket.emit("block-log", {
        id: item.id,
        type: "warn",
        when: new Date(),
        msg: msg.toString()
      });
    },

    // log to console underneath the block (level error)
    error: function(msg) {
      socket && socket.emit("block-log", {
        id: item.id,
        type: "error",
        when: new Date(),
        msg: msg.toString()
      });
    },

    // send a notification to the user
    notify: function(msg, title) {
      notifys.createNotify(msg, title);
    },

    // if the time is what has been specified
    whenTime: function(h, m, s, callback) {
      d = new Date();
      if (d.getHours() == h && d.getMinutes() == m && d.getSeconds() == s) {
        callback();
      }
    },

    // canvas drawing functions
    getCanvas: function(id, key) {
      if (!socket) return null


      return {

        clear: function(x, y, w, h) {
          socket.emit("canvas-update", {
            id: id, key: key,
            action: "clear",
            x: x, y: y, w: w, h: h
          });
        },

        line: function(nodes, fill, stroke, fillorstroke) {
          socket.emit("canvas-update", {
            id: id, key: key,
            action: "line",
            nodes: nodes,
            fillColor: fill,
            strokeColor: stroke,
            finished: fillorstroke
          });
        },

        rect: function(x, y, w, h, fill, stroke) {
          socket.emit("canvas-update", {
            id: id, key: key,
            action: "rect",
            x: x, y: y, w: w, h: h,
            fillColor: fill,
            strokeColor: stroke
          });
        },

        imageFromUrl: function(url, x, y) {
          socket.emit("canvas-update", {
            id: id, key: key,
            action: "image",
            src: url,
            x: x, y: y
          });
        },

        text: function(text, x, y) {
          socket.emit("canvas-update", {
            id: id, key: key,
            action: "text",
            text: text,
            x: x, y: y,
            fillColor: fill,
            strokeColor: stroke
          });
        }
      }


    },

    // all underscore functions
    underscore: _


  };
};
