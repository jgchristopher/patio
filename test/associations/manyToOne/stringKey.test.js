var vows = require('vows'),
    assert = require('assert'),
    helper = require("../../data/manyToOne/stringKey"),
    patio = require("index"),
    comb = require("comb"),
    hitch = comb.hitch;

var ret = module.exports = exports = new comb.Promise();

var gender = ["M", "F"];
helper.loadModels().then(function() {
    var Company = patio.getModel("company"), Employee = patio.getModel("employee");

    var suite = vows.describe("Many to one useing string for key association ");

    suite.addBatch({
        "A model" : {
            topic : function() {
                return Employee;
            },

            "should have associations" : function() {
                assert.deepEqual(Employee.associations, ["company"]);
                assert.deepEqual(Company.associations, ["employees"]);
                var emp = new Employee();
                var company = new Company();
                assert.deepEqual(emp.associations, ["company"]);
                assert.deepEqual(company.associations, ["employees"]);
            }
        }
    });

    suite.addBatch({

        "When creating a company with employees" : {
            topic : function() {
                var c1 = new Company({
                    companyName : "Google",
                    employees : [
                        {
                            lastname : "last" + 1,
                            firstname : "first" + 1,
                            midinitial : "m",
                            gender : gender[1 % 2],
                            street : "Street " + 1,
                            city : "City " + 1
                        },
                        {
                            lastname : "last" + 2,
                            firstname : "first" + 2,
                            midinitial : "m",
                            gender : gender[2 % 2],
                            street : "Street " + 2,
                            city : "City " + 2
                        }
                    ]
                });
                c1.save().then(hitch(this, "callback", null), hitch(this, "callback"));
            },

            " the company should have employees " : {
                topic : function(company) {
                    company.employees.then(hitch(this, "callback", null), hitch(this, "callback"));
                },

                " when querying the employees " : {
                    topic : function(emps, company) {
                        assert.lengthOf(emps, 2);
                        emps.forEach(function(emp, i) {
                            assert.equal(i + 1, emp.id);
                        }, this);
                        comb.executeInOrder(assert, Employee,
                            function(assert, Employee) {
                                var emps = Employee.filter({companyId : company.id}).all()
                                assert.lengthOf(emps, 2);
                                assert.equal(1, emps[0].id);
                                assert.equal(2, emps[1].id);
                                return {company1 : emps[0].company, company2 : emps[1].company};
                            }).then(hitch(this, "callback", null), hitch(this, "callback"));

                    },

                    "the employees company should be loaded" : function(ret) {
                        assert.equal(ret.company1.companyName, "Google");
                        assert.equal(ret.company2.companyName, "Google");
                    }
                }
            }
        }

    });

    suite.addBatch({

        "When finding a company" : {
            topic : function() {
                Company.one().then(hitch(this, "callback", null), hitch(this, "callback"));
            },

            " the companys employees should not be loaded " : {
                topic : function(company) {
                    company.employees.then(hitch(this, "callback", null), hitch(this, "callback"));
                },

                " but after fetching them there should be two" : function(emps) {
                    assert.lengthOf(emps, 2);
                    var ids = [1,2];
                    emps.forEach(function(emp, i) {
                        assert.equal(ids[i], emp.id);
                    });
                },

                " and adding an employee" : {
                    topic : function(i, company) {
                        var emp = new Employee({
                            lastname : "last" + 3,
                            firstname : "first" + 3,
                            midinitial : "m",
                            gender : gender[1 % 3],
                            street : "Street " + 3,
                            city : "City " + 3
                        });
                        comb.executeInOrder(company,
                            function(company) {
                                company.addEmployee(emp);
                                return company.employees;
                            }).then(hitch(this, "callback", null), hitch(this, "callback"));
                    },

                    "the company should have three employees " : function(emps) {
                        assert.lengthOf(emps, 3);
                        var ids = [1, 2,3];
                        emps.forEach(function(emp, i) {
                            assert.equal(emp.id, ids[i]);
                        });
                    }
                }
            }



        }
    });

    suite.addBatch({

        "When finding a company and removing an employee and deleting the employee" : {
            topic : function() {
                comb.executeInOrder(Company, Employee,
                    function(Company, Employee) {
                        var company = Company.one();
                        var emps = company.employees;
                        company.removeEmployee(emps[0], true);
                        return {employees : company.employees, empCount : Employee.count()};
                    }).then(hitch(this, "callback", null), hitch(this, "callback"));
            },

            "the company should have two employees " : function(ret) {
                var emps = ret.employees;
                assert.lengthOf(emps, 2);
                var ids = [2,3];
                emps.forEach(function(emp, i) {
                    assert.equal(ids[i], emp.id);
                });
                assert.equal(ret.empCount, 2);
            }
        }

    });

    suite.addBatch({

        "When finding a company and removing multiple employees and deloting the employees" : {
            topic : function() {
                comb.executeInOrder(Company, Employee,
                    function(Company, Employee) {
                        var company = Company.one();
                        var emps = company.employees;
                        company.removeEmployees(emps, true);
                        return {employees : company.employees, empCount : Employee.count()};
                    }).then(hitch(this, "callback", null), hitch(this, "callback"));
            },

            "the company should have no employees " : function(ret) {
                assert.lengthOf(ret.employees, 0);
                assert.equal(ret.empCount, 0);
            }
        }

    });

    suite.addBatch({

        "When finding a company and adding employees" : {
            topic : function() {
                var employees = [];
                for (var i = 0; i < 3; i++) {
                    employees.push({
                        lastname : "last" + i,
                        firstname : "first" + i,
                        midinitial : "m",
                        gender : gender[i % 2],
                        street : "Street " + i,
                        city : "City " + i
                    });
                }
                comb.executeInOrder(Company,
                    function(Company) {
                        var company = Company.one();
                        company.addEmployees(employees);
                        return company.employees;
                    }).then(hitch(this, "callback", null), hitch(this, "callback"));
            },

            "the company should have three employees " : function(emps) {
                assert.lengthOf(emps, 3);
                emps.forEach(function(emp) {
                    assert.instanceOf(emp, Employee);
                });
            }
        }

    });

    suite.addBatch({

        "When finding a company and removing an employee and not deleting the employee" : {
            topic : function() {
                comb.executeInOrder(Company, Employee,
                    function(Company, Employee) {
                        var company = Company.one();
                        var emps = company.employees;
                        company.removeEmployee(emps[0]);
                        return {employees : company.employees, empCount : Employee.count()};
                    }).then(hitch(this, "callback", null), hitch(this, "callback"));
            },


            "the company should have two employees " : function(ret) {
                var emps = ret.employees;
                assert.lengthOf(emps, 2);
                assert.equal(ret.empCount, 3);
            }
        }

    });

    suite.addBatch({

        "When finding a company and removing multiple employees and deloting the employees" : {
            topic : function() {
                comb.executeInOrder(Company, Employee,
                    function(Company, Employee) {
                        var company = Company.one();
                        var emps = company.employees;
                        company.removeEmployees(emps);
                        return {employees : company.employees, empCount : Employee.count()};
                    }).then(hitch(this, "callback", null), hitch(this, "callback"));
            },

            "the company should have no employees " : function(ret) {
                assert.lengthOf(ret.employees, 0);
                assert.equal(ret.empCount, 3);
            }
        }

    });


    suite.addBatch({
        "When deleting a company" : {
            topic : function() {
                comb.executeInOrder(Company, Employee,
                    function(Company, Employee) {
                        var company = Company.one();
                        company.remove();
                        return Employee.count();
                    }).then(hitch(this, "callback", null), hitch(this, "callback"));
            },

            " the company should no employees " : function(count) {
                assert.equal(count, 3);
            }
        }
    });


    suite.run({reporter : require("vows").reporter.spec}, function() {
        helper.dropModels().then(comb.hitch(ret, "callback"), comb.hitch(ret, "errback"));
    });

});

