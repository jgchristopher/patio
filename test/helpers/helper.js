var comb = require("comb"),
    moose = require("../../lib"),
    Dataset = moose.Dataset,
    Database = moose.Database;

moose.quoteIdentifiers = false

var MockDataset = comb.define(Dataset, {
    instance : {
        insert : function() {
            return this.db.execute(this.insertSql.apply(this, arguments));
        },

        update : function() {
            return this.db.execute(this.updateSql.apply(this, arguments));
        },

        fetchRows : function(sql) {
            var ret = new comb.Promise();
            this.db.execute(sql);
            ret.callback({id : 1, x : 1});
            return ret;
        },

        quotedIdentifier : function(c) {
            return '"' + c + '"';
        }

    }
}).as(exports, "MockDataset");

var MockDB = comb.define(Database, {

    instance : {
        constructor : function() {
            this._super(arguments);
            this.type = this._static.type;
            this.quoteIdentifiers = false;
            this.identifierInputMethod = null;
            this.identifierOutputMethod = null;
            this.sqls = [];
            this.closedCount = 0;
            this.createdCount = 0;
        },

        createConnection : function() {
            this.createdCount++;
            return {
                query : function(sql) {
                    return new comb.Promise().callback(sql);
                }
            }
        },

        closeConnection : function() {
            this.closedCount++;
            return new comb.Promise().callback();
        },

        validate : function() {
            return new comb.Promise().callback(true);
        },

        execute : function(sql, opts) {
            var ret = new comb.Promise();
            this.sqls.push(sql);
            ret.callback();
            return ret;
        },

        reset : function() {
            this.sqls = [];
        },

        transaction : function(opts, cb) {
            var ret = new comb.Promise();
            cb();
            ret.callback();
            return ret;
        },

        getters : {
            dataset : function() {
                return new MockDataset(this);
            }
        }
    }

}).as(exports, "MockDatabase");

MockDB.setAdapterType("mau");

comb.define(Database, {
    instance : {
        constructor : function() {
            this._super(arguments);
            this.identifierInputMethod = null;
            this.identifierOutputMethod = null;
            this.sqls = [];
        },

        execute : function(sql, opts) {
            var ret = new comb.Promise();
            this.sqls.push(sql);
            ret.callback();
            return ret;
        }
    }
}).as(exports, "SchemaDummyDatabase");
