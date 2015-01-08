'use strict';

var expect = require('chai').expect;

describe('getMembers fn', function() {
  it('should send back 500 if req.collaboration is undefined', function(done) {
    var res = {
      json: function(code) {
        expect(code).to.equal(500);
        done();
      }
    };

    var req = {};

    var collaborations = require(this.testEnv.basePath + '/backend/webserver/controllers/collaborations');
    collaborations.getMembers(req, res);
  });

  it('should send back 500 if collaboration.getMembers returns error', function(done) {
    var res = {
      json: function(code) {
        expect(code).to.equal(500);
        done();
      }
    };

    var req = {
      lib: {
        getMembers: function(com, query, callback) {
          return callback(new Error());
        }
      },
      collaboration: {},
      query: function() {}
    };

    var collaborations = require(this.testEnv.basePath + '/backend/webserver/controllers/collaborations');
    collaborations.getMembers(req, res);
  });

  it('should send back 200 is collaboration.getMembers returns result', function(done) {
    var res = {
      json: function(code) {
        expect(code).to.equal(200);
        done();
      },
      header: function() {}
    };

    var req = {
      lib: {
        getMembers: function(com, query, callback) {
          return callback(null, []);
        }
      },
      collaboration: {},
      query: function() {}
    };

    var collaborations = require(this.testEnv.basePath + '/backend/webserver/controllers/collaborations');
    collaborations.getMembers(req, res);
  });

  it('should set the header with the members size', function(done) {
    var members = [1, 2, 3];

    var res = {
      json: function(code) {
        expect(code).to.equal(200);
        done();
      },
      header: function(name, value) {
        expect(name).to.equal('X-ESN-Items-Count');
        expect(value).to.equal(members.length);
      }
    };

    var req = {
      lib: {
        getMembers: function(com, query, callback) {
          return callback(null, []);
        }
      },
      collaboration: {
        members: members
      },
      query: function() {}
    };

    var collaborations = require(this.testEnv.basePath + '/backend/webserver/controllers/collaborations');
    collaborations.getMembers(req, res);
  });

  it('should query user with request query parameters', function(done) {
    var members = [1, 2, 3];
    var limit = 23;
    var offset = 45;

    var res = {
      json: function(code) {
        expect(code).to.equal(200);
        done();
      },
      header: function(name, value) {
        expect(name).to.equal('X-ESN-Items-Count');
        expect(value).to.equal(members.length);
      }
    };

    var req = {
      lib: {
        getMembers: function(com, query, callback) {
          expect(query).to.exist;
          expect(query.limit).to.equal(limit);
          expect(query.offset).to.equal(offset);

          return callback(null, []);
        }
      },
      collaboration: {
        members: members
      },
      query: {
        limit: limit,
        offset: offset
      }
    };

    var collaborations = require(this.testEnv.basePath + '/backend/webserver/controllers/collaborations');
    collaborations.getMembers(req, res);
  });
});
