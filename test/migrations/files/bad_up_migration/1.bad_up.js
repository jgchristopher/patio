exports.up = function(db){
    db.alterTable("test", function(){
        this.renameColumn("column", "column2");
    });
    db.alterTable("test2", function(){
        this.renameColumn("column", "column2");
    });
    db.alterTable("test3", function(){
        this.renameColumn("column", "column2");
    });
    throw "error";
}

exports.down = function(db){
    db.alterTable("test", function(){
        this.renameColumn("column2", "column");
    });
    db.alterTable("test2", function(){
        this.renameColumn("column2", "column");
    });
    db.alterTable("test3", function(){
        this.renameColumn("column2", "column");
    });
    db.alterTable("test4", function(){
        this.renameColumn("column2", "column");
    });
}