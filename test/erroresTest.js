var assert = require("chai").assert;
var app = require("../app");
var request = require('request');
var expect = require("chai").expect;

describe("Test de comprobacion de errores: ", function() {

    describe ('Error 404', function() {
        it('Test error 404 - "/absf" devuelve pagina error 404', function(){
            request('http://localhost:8081/absf', function(error, response, body) {
                expect(body).to.include('Error 404 Page not found');
            });
        });
    });

    describe ('Error 404', function() {
        it('Test error 404 - "/absf" devuelve status 404', function(){
            request('http://localhost:8081/absf', function(error, response, body) {
                expect(response.statusCode).to.deep.equal(404);
            });
        });
    });

});